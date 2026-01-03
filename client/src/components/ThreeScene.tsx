import { useState, useEffect, useMemo, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useSearchParams } from "react-router-dom";
import SettingsPanel from "./editor/SettingsPanel";
import MapControls from "./editor/MapControls";
import Scene from "./editor/Scene";
import { AssetData, CubeData } from "./editor/types";
import { useCollaboration } from "../hooks/useCollaboration";
import { API_URL } from "../config/api";

const ThreeScene = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	
	// Get room ID from URL or generate a default one
	const roomId = searchParams.get("room") || searchParams.get("load") || "default-room";
	
	// Room input state
	const [roomInput, setRoomInput] = useState("");
	const [showRoomModal, setShowRoomModal] = useState(false);
	
	const [guiControls, setGuiControls] = useState({
		canvasSize: 100,
		blockColor: "#ff0000",
		gridSize: 20,
		gridColor: "#ffffff",
	});
	const [deleteMode, setDeleteMode] = useState(false);
	const [selectedTexture, setSelectedTexture] = useState<string | null>(null);
	const [initialLoadDone, setInitialLoadDone] = useState(false);
	
	// New state for models
	const [placementMode, setPlacementMode] = useState<'cube' | 'model'>('cube');
	const [selectedModel, setSelectedModel] = useState<string | null>(null);
	const [modelRotation, setModelRotation] = useState(0);

	// Use collaboration hook for synced assets
	const { assets, setAssets, connectedUsers, isConnected, undo, redo, canUndo, canRedo, userCursors, updateCursor } = useCollaboration({
		roomId,
	});
	
	// Keyboard shortcuts for undo/redo
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
				e.preventDefault();
				if (e.shiftKey) {
					redo();
				} else {
					undo();
				}
			}
			if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
				e.preventDefault();
				redo();
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [undo, redo]);
	
	// Handle joining a room - use window.location to force full reload and reconnect
	const handleJoinRoom = () => {
		if (roomInput.trim()) {
			window.location.href = `/editor?room=${encodeURIComponent(roomInput.trim())}`;
		}
	};
	
	// Copy room link to clipboard
	const handleCopyLink = () => {
		const url = `${window.location.origin}/editor?room=${encodeURIComponent(roomId)}`;
		navigator.clipboard.writeText(url);
	};

	// Export canvas as image
	const handleExportImage = () => {
		const canvas = document.querySelector('canvas');
		if (canvas) {
			const link = document.createElement('a');
			link.download = `isoedit-${roomId}-${Date.now()}.png`;
			link.href = canvas.toDataURL('image/png');
			link.click();
		}
	};

	// Handle color update from loaded map
	const handleColorUpdate = (color: string) => {
		setGuiControls((prev) => ({
			...prev,
			blockColor: color,
		}));
	};

	// Handle grid size change
	const setGridSize = (size: number) => {
		setGuiControls((prev) => ({
			...prev,
			gridSize: size,
		}));
	};

	// Handle loading map data (supports both legacy CubeData and new AssetData)
	const handleLoadMap = (loadedData: (CubeData | AssetData)[], loadedColor: string) => {
		console.log("ThreeScene received loadedData:", loadedData, "loadedColor:", loadedColor);

		if (Array.isArray(loadedData)) {
			const validAssets = loadedData
				.map((item) => {
					if (Array.isArray(item) && item.length === 3) {
						// Old format: [x, y, z] arrays
						return {
							position: item as unknown as [number, number, number],
							type: 'cube' as const,
							color: loadedColor,
							texture: null,
						};
					} else if (typeof item === "object" && item !== null) {
						// Check if it's new AssetData format (has 'type' field)
						if ('type' in item && (item.type === 'cube' || item.type === 'model')) {
							return item as AssetData;
						}
						// Legacy CubeData format
						return {
							position: Array.isArray(item.position) ? (item.position as [number, number, number]) : [0, 0, 0],
							type: 'cube' as const,
							color: typeof item.color === "string" ? item.color : loadedColor,
							texture: typeof item.texture === "string" || item.texture === null ? item.texture : null,
						};
					}
					return null;
				})
				.filter((asset) => asset !== null) as AssetData[];

			setAssets(validAssets);
		} else {
			console.error("loadedData is not an array:", loadedData);
			setAssets([]);
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
					const response = await fetch(`${API_URL}/api/maps/${mapId}`, {
						headers: {
							Authorization: `Bearer ${token}`,
						},
					});

					if (response.ok) {
						const mapData = await response.json();
						console.log("Loading map from URL:", mapData);

						if (mapData.data) {
							let assets, blockColor;
							if (mapData.data.data) {
								// Check for new 'assets' field first, fall back to 'cubes'
								assets = mapData.data.data.assets || mapData.data.data.cubes;
								blockColor = mapData.data.data.blockColor;
							} else {
								assets = mapData.data.assets || mapData.data.cubes;
								blockColor = mapData.data.blockColor;
							}

							if (Array.isArray(assets) && typeof blockColor === "string") {
								handleLoadMap(assets, blockColor);
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

	// Toggle delete mode with 'D' key, rotate model with 'R' key
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key.toLowerCase() === "d") {
				setDeleteMode((prev) => !prev);
			}
			if (e.key.toLowerCase() === "r" && placementMode === 'model') {
				setModelRotation((prev) => (prev + 90) % 360);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [placementMode]);

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

	// Convert assets to legacy format for MapControls (save compatibility)
	const cubesForSave = assets;

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
				placementMode={placementMode}
				setPlacementMode={setPlacementMode}
				selectedModel={selectedModel}
				setSelectedModel={setSelectedModel}
				modelRotation={modelRotation}
				setModelRotation={setModelRotation}
				gridSize={guiControls.gridSize}
				setGridSize={setGridSize}
			/>

			{/* Delete Mode Status Indicator - positioned below the Delete Blocks button */}
			{deleteMode && (
				<div className="absolute top-36 left-4 z-10 bg-error text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
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

			{/* Model Placement Indicator - below delete mode indicator or below button */}
			{placementMode === 'model' && selectedModel && (
				<div className={`absolute ${deleteMode ? 'top-48' : 'top-36'} left-4 z-10 bg-primary text-white px-4 py-2 rounded-lg shadow-lg`}>
					<span className="font-medium">Placing: {selectedModel}</span>
					<span className="ml-2 opacity-75">({modelRotation}°)</span>
					<span className="ml-2 text-xs opacity-75">Press 'R' to rotate</span>
				</div>
			)}

			{/* Undo/Redo/Export Buttons - above online indicator */}
			<div className="absolute bottom-16 left-4 z-10 flex items-center gap-1 bg-base-200 px-2 py-1 rounded-lg shadow-lg">
				<button
					onClick={undo}
					disabled={!canUndo}
					className="btn btn-sm btn-ghost"
					title="Undo (Ctrl+Z)"
				>
					Undo
				</button>
				<button
					onClick={redo}
					disabled={!canRedo}
					className="btn btn-sm btn-ghost"
					title="Redo (Ctrl+Y)"
				>
					Redo
				</button>
				<div className="w-px h-6 bg-base-300 mx-1" />
				<button
					onClick={handleExportImage}
					className="btn btn-sm btn-ghost"
					title="Export as PNG"
				>
					Export
				</button>
			</div>

			{/* Collaboration Status Indicator */}
			<div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-base-200 px-4 py-2 rounded-lg shadow-lg">
				<div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-warning'}`} />
				<span className="text-sm">
					{connectedUsers} user{connectedUsers !== 1 ? 's' : ''} online
				</span>
				<span className="text-xs opacity-60">• Room: {roomId}</span>
				<button 
					onClick={handleCopyLink}
					className="btn btn-xs btn-ghost"
					title="Copy room link"
				>
					Copy
				</button>
				<button 
					onClick={() => setShowRoomModal(true)}
					className="btn btn-xs btn-primary"
				>
					Join Room
				</button>
			</div>

			{/* Room Join Modal */}
			{showRoomModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="bg-base-100 rounded-xl p-6 shadow-2xl w-96">
						<h3 className="text-lg font-bold mb-4">Join or Create Room</h3>
						<input
							type="text"
							placeholder="Enter room name..."
							value={roomInput}
							onChange={(e) => setRoomInput(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
							className="input input-bordered w-full mb-4"
							autoFocus
						/>
						<div className="flex gap-2 justify-end">
							<button 
								onClick={() => setShowRoomModal(false)}
								className="btn btn-ghost"
							>
								Cancel
							</button>
							<button 
								onClick={handleJoinRoom}
								className="btn btn-primary"
								disabled={!roomInput.trim()}
							>
								Join Room
							</button>
						</div>
						<p className="text-xs opacity-60 mt-4">
							Tip: Share the same room name with others to collaborate in real-time!
						</p>
					</div>
				</div>
			)}

			{/* MapControls moved here, outside of the Canvas */}
			<MapControls
				cubes={cubesForSave}
				blockColor={guiControls.blockColor}
				handleLoadMap={handleLoadMap}
				deleteMode={deleteMode}
				setDeleteMode={setDeleteMode}
			/>

			<Canvas
				gl={{ antialias: true, preserveDrawingBuffer: true }}
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
				<Suspense fallback={null}>
					<Scene
						blockColor={guiControls.blockColor}
						gridSize={guiControls.gridSize}
						gridColor={guiControls.gridColor}
						assets={assets}
						onAssetsChange={setAssets}
						deleteMode={deleteMode}
						selectedTexture={selectedTexture}
						selectedModel={selectedModel}
						placementMode={placementMode}
						modelRotation={modelRotation}
						userCursors={userCursors}
						onCursorMove={updateCursor}
					/>
				</Suspense>
			</Canvas>
		</div>
	);
};

export default ThreeScene;
