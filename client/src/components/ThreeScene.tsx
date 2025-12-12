import { useState, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { useSearchParams } from "react-router-dom";
import SettingsPanel from "./editor/SettingsPanel";
import MapControls from "./editor/MapControls";
import Scene from "./editor/Scene";
import { CubeData } from "./editor/types";

const ThreeScene = () => {
	const [guiControls, setGuiControls] = useState({
		canvasSize: 100,
		blockColor: "#ff0000",
		gridSize: 20,
		gridColor: "#ffffff",
	});
	const [cubes, setCubes] = useState<CubeData[]>([]);
	const [deleteMode, setDeleteMode] = useState(false);
	const [selectedTexture, setSelectedTexture] = useState<string | null>(null);
	const [searchParams, setSearchParams] = useSearchParams();
	const [initialLoadDone, setInitialLoadDone] = useState(false);

	// Handle color update from loaded map
	const handleColorUpdate = (color: string) => {
		setGuiControls((prev) => ({
			...prev,
			blockColor: color,
		}));
	};

	// Handle loading map data
	const handleLoadMap = (loadedCubes: CubeData[], loadedColor: string) => {
		console.log("ThreeScene received loadedCubes:", loadedCubes, "loadedColor:", loadedColor);

		if (Array.isArray(loadedCubes)) {
			// Convert simple position arrays to CubeData if necessary
			const validCubes = loadedCubes
				.map((cube) => {
					if (Array.isArray(cube) && cube.length === 3) {
						// Old format: [x, y, z] arrays
						return {
							position: cube as [number, number, number],
							color: loadedColor,
							texture: null,
						};
					} else if (typeof cube === "object" && cube !== null) {
						// New format: CubeData objects
						return {
							position: Array.isArray(cube.position) ? (cube.position as [number, number, number]) : [0, 0, 0],
							color: typeof cube.color === "string" ? cube.color : loadedColor,
							texture: typeof cube.texture === "string" || cube.texture === null ? cube.texture : null,
						};
					}
					return null;
				})
				.filter((cube) => cube !== null) as CubeData[];

			setCubes(validCubes);
		} else {
			console.error("loadedCubes is not an array:", loadedCubes);
			setCubes([]);
		}

		if (typeof loadedColor === "string") {
			handleColorUpdate(loadedColor);
		}
	};

	// Load map from URL parameter on mount
	useEffect(() => {
		const loadMapFromUrl = async () => {
			const mapId = searchParams.get("load");
			if (mapId && !initialLoadDone) {
				try {
					const token = localStorage.getItem("token");
					const response = await fetch(`http://localhost:3001/api/maps/${mapId}`, {
						headers: {
							Authorization: `Bearer ${token}`,
						},
					});

					if (response.ok) {
						const mapData = await response.json();
						console.log("Loading map from URL:", mapData);

						if (mapData.data) {
							let cubes, blockColor;
							if (mapData.data.data) {
								cubes = mapData.data.data.cubes;
								blockColor = mapData.data.data.blockColor;
							} else {
								cubes = mapData.data.cubes;
								blockColor = mapData.data.blockColor;
							}

							if (Array.isArray(cubes) && typeof blockColor === "string") {
								handleLoadMap(cubes, blockColor);
							}
						}
					}
				} catch (error) {
					console.error("Error loading map from URL:", error);
				}
				// Clear the URL parameter after loading
				setSearchParams({});
				setInitialLoadDone(true);
			}
		};

		loadMapFromUrl();
	}, [searchParams, initialLoadDone]);

	// Toggle delete mode with keyboard
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key.toLowerCase() === "d") {
				setDeleteMode((prev) => !prev);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	const cameraSettings = useMemo(() => {
		const baseZoom = 40;
		const scaleFactor = 20 / guiControls.gridSize;

		const distance = 25;
		return {
			position: [distance, distance * 0.8660254, distance] as [number, number, number],
			rotation: [-Math.PI / 6, Math.PI / 4, 0] as [number, number, number],
			zoom: baseZoom * scaleFactor,
		};
	}, [guiControls.gridSize]);

	// Helper functions to update guiControls
	const setBlockColor = (color: string) => {
		setGuiControls((prev) => ({ ...prev, blockColor: color }));
	};

	const setGridColor = (color: string) => {
		setGuiControls((prev) => ({ ...prev, gridColor: color }));
	};

	return (
		<div
			style={{
				width: "100vw",
				height: "100vh",
				paddingTop: "64px", // Account for navbar height
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				overflow: "hidden",
				position: "relative",
			}}
		>
			{/* Settings Panel */}
			<SettingsPanel
				blockColor={guiControls.blockColor}
				setBlockColor={setBlockColor}
				gridColor={guiControls.gridColor}
				setGridColor={setGridColor}
				selectedTexture={selectedTexture}
				setSelectedTexture={setSelectedTexture}
				deleteMode={deleteMode}
				setDeleteMode={setDeleteMode}
			/>

			{/* Delete Mode Status Indicator */}
			{deleteMode && (
				<div className="absolute top-20 right-80 z-10 bg-error text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
						<path
							fillRule="evenodd"
							d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
							clipRule="evenodd"
						/>
					</svg>
					Delete Mode Active (Press 'D' to toggle)
				</div>
			)}

			{/* MapControls moved here, outside of the Canvas */}
			<MapControls
				cubes={cubes}
				blockColor={guiControls.blockColor}
				handleLoadMap={handleLoadMap}
				deleteMode={deleteMode}
				setDeleteMode={setDeleteMode}
			/>

			<Canvas
				gl={{ antialias: true }}
				orthographic
				camera={{
					position: cameraSettings.position,
					zoom: cameraSettings.zoom,
					near: 0.1,
					far: 1000,
					rotation: cameraSettings.rotation,
					up: [0, 1, 0],
				}}
				style={{
					width: `${guiControls.canvasSize}%`,
					height: `${guiControls.canvasSize}%`,
					aspectRatio: "1 / 1",
					background: "#1d232a",
				}}
			>
				<Scene
					blockColor={guiControls.blockColor}
					gridSize={guiControls.gridSize}
					gridColor={guiControls.gridColor}
					cubes={cubes}
					onCubesChange={setCubes}
					deleteMode={deleteMode}
					selectedTexture={selectedTexture}
				/>
			</Canvas>
		</div>
	);
};

export default ThreeScene;
