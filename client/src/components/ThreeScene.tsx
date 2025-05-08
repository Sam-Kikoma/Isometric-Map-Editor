import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import * as lil from "lil-gui";
import { useNavigate } from "react-router-dom";

// Define available textures
const TEXTURES = {
	none: null,
	brick: "/Texturelabs_Brick_158M.jpg",
	fabric: "/Texturelabs_Fabric_120M.jpg",
	metal: "/Texturelabs_Metal_282M.jpg",
	paper: "/Texturelabs_Paper_361M.jpg",
};

// Define a cube data type to include position, color and texture
interface CubeData {
	position: [number, number, number];
	color: string;
	texture: string | null;
}

// Texture loader component to preload textures
const TextureLoader = ({
	children,
}: {
	children: (textureMap: Record<string, THREE.Texture | null>) => JSX.Element;
}) => {
	const textures = useLoader(THREE.TextureLoader, [TEXTURES.brick, TEXTURES.fabric, TEXTURES.metal, TEXTURES.paper]);

	// Create a mapping of texture paths to loaded textures
	const textureMap = useMemo(() => {
		const map: Record<string, THREE.Texture | null> = {};
		[TEXTURES.brick, TEXTURES.fabric, TEXTURES.metal, TEXTURES.paper].forEach((path, index) => {
			map[path] = textures[index];
			// Configure texture repeat and wrapping
			textures[index].wrapS = textures[index].wrapT = THREE.RepeatWrapping;
			textures[index].repeat.set(1, 1);
		});
		return map;
	}, [textures]);

	return children(textureMap);
};

const MapControls = ({
	cubes,
	blockColor,
	handleLoadMap,
	deleteMode,
	setDeleteMode,
}: {
	cubes: CubeData[];
	blockColor: string;
	handleLoadMap: (cubes: CubeData[], color: string) => void;
	deleteMode: boolean;
	setDeleteMode: (mode: boolean) => void;
}) => {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [isPublic, setIsPublic] = useState(true);
	const [saving, setSaving] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);
	const [saveError, setError] = useState("");
	const [maps, setMaps] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [showLoadDialog, setShowLoadDialog] = useState(false);

	// Navigate hook for redirecting after logout
	const navigate = useNavigate();

	// Fetch user's maps when component mounts
	useEffect(() => {
		fetchMaps();
	}, []);

	const fetchMaps = async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem("token");

			const response = await fetch("http://localhost:3001/api/maps", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error("Failed to fetch maps");
			}

			const data = await response.json();
			setMaps(data.data || []);
		} catch (error) {
			console.error("Error fetching maps:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSaveMap = async () => {
		if (!title.trim()) {
			setError("Title is required");
			return;
		}

		try {
			setSaving(true);
			setError("");

			// Prepare map data with current cubes and color
			const mapData = {
				title,
				description,
				isPublic,
				data: {
					cubes,
					blockColor,
				},
			};

			const token = localStorage.getItem("token");

			const response = await fetch("http://localhost:3001/api/maps", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(mapData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to save map");
			}

			setSaveSuccess(true);

			// Reset form after successful save
			setTimeout(() => {
				setSaveSuccess(false);
				setTitle("");
				setDescription("");
			}, 2000);

			// Refresh maps list
			fetchMaps();
		} catch (error) {
			console.error("Error saving map:", error);
			setError(error instanceof Error ? error.message : "An error occurred");
		} finally {
			setSaving(false);
		}
	};

	const loadMap = async (mapId: string) => {
		try {
			setLoading(true);
			const token = localStorage.getItem("token");

			const response = await fetch(`http://localhost:3001/api/maps/${mapId}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error("Failed to load map");
			}

			const mapData = await response.json();
			console.log("Loaded map data:", mapData);

			if (mapData.data) {
				let cubes, blockColor;
				if (mapData.data.data) {
					// Structure: mapData.data.data.{cubes, blockColor}
					cubes = mapData.data.data.cubes;
					blockColor = mapData.data.data.blockColor;
				} else {
					// Structure: mapData.data.{cubes, blockColor}
					cubes = mapData.data.cubes;
					blockColor = mapData.data.blockColor;
				}

				// Validate the data before using it
				if (Array.isArray(cubes) && typeof blockColor === "string") {
					console.log("Loading cubes:", cubes, "color:", blockColor);
					handleLoadMap(cubes, blockColor);
				} else {
					console.error("Invalid map data format:", mapData);
					throw new Error("Invalid map data format");
				}
			} else {
				throw new Error("Map data not found");
			}

			setShowLoadDialog(false);
		} catch (error) {
			console.error("Error loading map:", error);
		} finally {
			setLoading(false);
		}
	};

	const deleteMap = async (mapId: string) => {
		try {
			const token = localStorage.getItem("token");

			const response = await fetch(`http://localhost:3001/api/maps/${mapId}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error("Failed to delete map");
			}

			fetchMaps();
		} catch (error) {
			console.error("Error deleting map:", error);
		}
	};

	// Handle logout function
	const handleLogout = () => {
		localStorage.removeItem("token");
		navigate("/");
	};

	// Toggle delete mode
	const toggleDeleteMode = () => {
		setDeleteMode(!deleteMode);
	};

	return (
		<div className="absolute top-4 left-4 z-10">
			<div className="flex flex-col gap-2">
				{/* Delete Mode Toggle */}
				<button className={`btn ${deleteMode ? "btn-error" : "btn-outline"}`} onClick={toggleDeleteMode}>
					{deleteMode ? "Exit Delete Mode" : "Delete Blocks"}
				</button>

				{/* Save Button */}
				<button className="btn btn-primary" onClick={() => document.getElementById("save-map-modal")?.showModal()}>
					Save Map
				</button>

				{/* Load Button */}
				<button
					className="btn btn-secondary"
					onClick={() => {
						fetchMaps();
						setShowLoadDialog(true);
					}}
				>
					Load Map
				</button>

				{/* Logout Button */}
				<button className="btn btn-error" onClick={handleLogout}>
					Logout
				</button>
			</div>

			{/* Help tooltip for deletion */}
			{/* <div className="mt-4 bg-base-300 p-3 rounded-lg shadow-lg">
				<h3 className="font-bold text-sm mb-1">Block Controls:</h3>
				<ul className="text-xs space-y-1">
					<li>• Left-click: Place block</li>
					<li>• Right-click: Delete block</li>
					<li>• Delete Mode: Click to delete blocks</li>
					<li>• Keyboard: Press 'D' to toggle delete mode</li>
				</ul>
			</div> */}

			{/* Save Modal */}
			<dialog id="save-map-modal" className="modal">
				<div className="modal-box">
					<h3 className="font-bold text-lg">Save Map</h3>

					{saveSuccess && <div className="alert alert-success mt-2">Map saved successfully!</div>}

					{saveError && <div className="alert alert-error mt-2">{saveError}</div>}

					<div className="form-control mt-4">
						<label className="label">
							<span className="label-text">Title</span>
						</label>
						<input
							type="text"
							placeholder="Map title"
							className="input input-bordered"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
						/>
					</div>

					<div className="form-control mt-2">
						<label className="label">
							<span className="label-text">Description</span>
						</label>
						<textarea
							placeholder="Map description"
							className="textarea textarea-bordered"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>

					<div className="form-control mt-2">
						<label className="label cursor-pointer">
							<span className="label-text">Public</span>
							<input
								type="checkbox"
								className="toggle toggle-primary"
								checked={isPublic}
								onChange={(e) => setIsPublic(e.target.checked)}
							/>
						</label>
					</div>

					<div className="modal-action">
						<form method="dialog">
							<button className="btn btn-outline mr-2">Cancel</button>
						</form>
						<button className={`btn btn-primary ${saving ? "loading" : ""}`} onClick={handleSaveMap} disabled={saving}>
							{saving ? "Saving..." : "Save Map"}
						</button>
					</div>
				</div>
			</dialog>

			{/* Load Dialog */}
			{showLoadDialog && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-base-200 p-6 rounded-lg w-full max-w-md">
						<h2 className="text-xl font-bold mb-4">Load Map</h2>

						{loading ? (
							<div className="flex justify-center py-8">
								<span className="loading loading-spinner loading-lg"></span>
							</div>
						) : maps.length === 0 ? (
							<div className="text-center py-4">
								<p>No saved maps found</p>
							</div>
						) : (
							<div className="max-h-64 overflow-y-auto">
								{maps.map((map) => (
									<div key={map.id} className="card bg-base-100 mb-2">
										<div className="card-body p-4">
											<h3 className="card-title text-base">{map.title}</h3>
											<p className="text-sm">{map.description}</p>
											<div className="card-actions justify-end mt-2">
												<button className="btn btn-primary btn-sm" onClick={() => loadMap(map.id)}>
													Load
												</button>
												<button className="btn btn-error btn-sm" onClick={() => deleteMap(map.id)}>
													Delete
												</button>
											</div>
										</div>
									</div>
								))}
							</div>
						)}

						<div className="flex justify-end mt-4">
							<button className="btn btn-outline" onClick={() => setShowLoadDialog(false)}>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

const Cube = ({
	position,
	color,
	texture,
	onRightClick,
	deleteMode,
	onClick,
}: {
	position: [number, number, number];
	color: string;
	texture: THREE.Texture | null;
	onRightClick: (pos: [number, number, number]) => void;
	deleteMode: boolean;
	onClick: (pos: [number, number, number]) => void;
}) => {
	// Create a mesh reference to track the cube
	const meshRef = useRef<THREE.Mesh>(null);

	// Handle right-click event for cube deletion
	const handleRightClick = (e: THREE.Event) => {
		e.stopPropagation();
		onRightClick(position);
	};

	// Handle left-click in delete mode
	const handleClick = (e: THREE.Event) => {
		if (deleteMode) {
			e.stopPropagation();
			onClick(position);
		}
	};

	return (
		<mesh
			position={[position[0], position[1] + 0.5, position[2]]}
			ref={meshRef}
			onClick={handleClick}
			onContextMenu={handleRightClick}
		>
			<boxGeometry args={[1, 1, 1]} />
			{texture ? <meshStandardMaterial map={texture} color="#ffffff" /> : <meshStandardMaterial color={color} />}
		</mesh>
	);
};

// Highlight component to show where a new cube will be placed
const Highlight = ({
	position,
	visible,
	deleteMode,
}: {
	position: [number, number, number];
	visible: boolean;
	deleteMode: boolean;
}) => {
	const highlightColor = deleteMode ? 0xff3333 : visible ? 0xffffff : 0xff0000;

	return (
		<mesh position={[position[0], 0.03, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
			<planeGeometry args={[1, 1]} />
			<meshBasicMaterial side={THREE.DoubleSide} transparent opacity={0.5} color={highlightColor} />
		</mesh>
	);
};

const Scene = ({
	blockColor,
	gridSize,
	gridColor,
	onColorChange,
	cubes,
	onCubesChange,
	deleteMode,
	selectedTexture,
}: {
	blockColor: string;
	gridSize: number;
	gridColor: string;
	onColorChange: (color: string) => void;
	cubes: CubeData[];
	onCubesChange: (cubes: CubeData[]) => void;
	deleteMode: boolean;
	selectedTexture: string | null;
}) => {
	const [highlightPos, setHighlightPos] = useState<[number, number, number]>([0, 0, 0]);
	const [highlightColor, setHighlightColor] = useState(0xffffff);
	const { camera, raycaster } = useThree();

	const grid = useMemo(() => {
		const halfSize = gridSize / 2;
		return {
			min: -halfSize,
			max: halfSize,
			size: gridSize,
		};
	}, [gridSize]);

	useFrame((state) => {
		const mouse = new THREE.Vector2(state.mouse.x, state.mouse.y);
		raycaster.setFromCamera(mouse, camera);

		const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
		const intersectionPoint = new THREE.Vector3();

		if (raycaster.ray.intersectPlane(groundPlane, intersectionPoint)) {
			const newX = Math.floor(intersectionPoint.x + 0.5);
			const newZ = Math.floor(intersectionPoint.z + 0.5);

			const min = Math.ceil(grid.min);
			const max = Math.floor(grid.max) - 1;

			if (newX >= min && newX <= max && newZ >= min && newZ <= max) {
				setHighlightPos([newX, 0, newZ]);

				const objectExists = cubes.some((cube) => cube.position[0] === newX && cube.position[2] === newZ);
				setHighlightColor(objectExists ? 0xff0000 : 0xffffff);
			}
		}
	});

	const handleClick = () => {
		const [x, y, z] = highlightPos;
		const exists = cubes.some((cube) => cube.position[0] === x && cube.position[2] === z);

		if (deleteMode) {
			return;
		}

		if (!exists) {
			const newCube: CubeData = {
				position: [x, y, z],
				color: blockColor,
				texture: selectedTexture,
			};
			const newCubes = [...cubes, newCube];
			onCubesChange(newCubes);
		}
	};

	const handleDeleteBlock = (pos: [number, number, number]) => {
		const newCubes = cubes.filter((cube) => cube.position[0] !== pos[0] || cube.position[2] !== pos[2]);
		onCubesChange(newCubes);
	};

	return (
		<TextureLoader>
			{(textureMap) => (
				<>
					<ambientLight intensity={0.5} />
					<directionalLight position={[10, 10, 5]} intensity={1} />

					<group>
						<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
							<planeGeometry args={[gridSize, gridSize]} />
							<meshBasicMaterial color="#222222" />
						</mesh>
						{Array.from({ length: gridSize + 1 }).map((_, i) => {
							const pos = i - gridSize / 2;
							return (
								<line key={`h-${i}`}>
									<bufferGeometry
										attach="geometry"
										onUpdate={(self) => {
											const positions = new Float32Array(6);
											positions[0] = -gridSize / 2;
											positions[1] = 0.01;
											positions[2] = pos;
											positions[3] = gridSize / 2;
											positions[4] = 0.01;
											positions[5] = pos;
											self.setAttribute("position", new THREE.BufferAttribute(positions, 3));
										}}
									/>
									<lineBasicMaterial attach="material" color={gridColor} />
								</line>
							);
						})}

						{Array.from({ length: gridSize + 1 }).map((_, i) => {
							// Calculate position for each line to ensure proper alignment with cells
							const pos = i - gridSize / 2;
							return (
								<line key={`v-${i}`}>
									<bufferGeometry
										attach="geometry"
										onUpdate={(self) => {
											const positions = new Float32Array(6);
											positions[0] = pos;
											positions[1] = 0.01;
											positions[2] = -gridSize / 2;
											positions[3] = pos;
											positions[4] = 0.01;
											positions[5] = gridSize / 2;
											self.setAttribute("position", new THREE.BufferAttribute(positions, 3));
										}}
									/>
									<lineBasicMaterial attach="material" color={gridColor} />
								</line>
							);
						})}
					</group>

					<mesh rotation={[-Math.PI / 2, 0, 0]} onClick={handleClick} visible={false} position={[0, 0.02, 0]}>
						<planeGeometry args={[gridSize, gridSize]} />
						<meshBasicMaterial transparent opacity={0} />
					</mesh>

					<Highlight position={highlightPos} visible={highlightColor === 0xffffff} deleteMode={deleteMode} />

					{cubes.map((cube, index) => (
						<Cube
							key={`cube-${cube.position[0]}-${cube.position[2]}-${index}`}
							position={cube.position}
							color={cube.color}
							onRightClick={handleDeleteBlock}
							deleteMode={deleteMode}
							onClick={handleDeleteBlock}
							texture={cube.texture ? textureMap[cube.texture] : null}
						/>
					))}

					<OrbitControls enableRotate={false} enablePan={true} minZoom={30} maxZoom={100} enableDamping={false} />
				</>
			)}
		</TextureLoader>
	);
};

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

	useEffect(() => {
		const gui = new lil.GUI();

		const canvasFolder = gui.addFolder("Canvas Settings");
		const gridFolder = gui.addFolder("Grid Settings");
		const blockFolder = gui.addFolder("Block Settings");
		const textureFolder = gui.addFolder("Texture Settings");

		canvasFolder
			.add(guiControls, "canvasSize", [50, 100, 150, 200])
			.name("Canvas Size (%)")
			.onChange((value: number) => {
				setGuiControls((prev) => ({ ...prev, canvasSize: value }));
			});

		// Grid color control
		gridFolder
			.addColor(guiControls, "gridColor")
			.name("Grid Color")
			.onChange((value: string) => {
				setGuiControls((prev) => ({ ...prev, gridColor: value }));
			});

		// Block Color control
		blockFolder
			.addColor(guiControls, "blockColor")
			.name("Block Color")
			.onChange((value: string) => {
				setGuiControls((prev) => ({ ...prev, blockColor: value }));
			});

		// Add delete mode control to GUI
		blockFolder
			.add({ deleteMode: deleteMode }, "deleteMode")
			.name("Delete Mode")
			.onChange((value: boolean) => {
				setDeleteMode(value);
			});

		// Add texture selection to GUI
		textureFolder
			.add({ texture: "none" }, "texture", {
				None: "none",
				Brick: TEXTURES.brick,
				Fabric: TEXTURES.fabric,
				Metal: TEXTURES.metal,
				Paper: TEXTURES.paper,
			})
			.name("Block Texture")
			.onChange((value: string) => {
				setSelectedTexture(value === "none" ? null : value);
			});

		// Open folders by default
		canvasFolder.open();
		gridFolder.open();
		blockFolder.open();
		textureFolder.open();

		// Cleanup GUI when component unmounts
		return () => {
			gui.destroy();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div
			style={{
				width: "100vw",
				height: "100vh",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				overflow: "hidden",
				position: "relative", // Add this to allow for absolute positioning
			}}
		>
			{/* Delete Mode Status Indicator */}
			{deleteMode && (
				<div className="absolute top-4 right-4 z-10 bg-error text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
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
				}}
			>
				<Scene
					blockColor={guiControls.blockColor}
					gridSize={guiControls.gridSize}
					gridColor={guiControls.gridColor}
					onColorChange={handleColorUpdate}
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
