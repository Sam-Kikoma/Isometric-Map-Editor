import React, { useState, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import * as lil from "lil-gui";

const Cube = ({
	position,
	color,
	onRightClick,
}: {
	position: [number, number, number];
	color: string;
	onRightClick: (pos: [number, number, number]) => void;
}) => {
	const handleContextMenu = (e: React.MouseEvent) => {
		e.preventDefault();
		onRightClick(position);
	};

	// Place blocks directly on the grid (lower y position from 0.5 to 0.45)
	const adjustedPosition: [number, number, number] = [position[0], 0.45, position[2]];

	return (
		<mesh position={adjustedPosition} onContextMenu={handleContextMenu}>
			<boxGeometry args={[0.9, 0.9, 0.9]} />
			<meshStandardMaterial color={color} />
		</mesh>
	);
};

const Highlight = ({ position, visible }: { position: [number, number, number]; visible: boolean }) => {
	return (
		<mesh position={[position[0], 0.03, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
			<planeGeometry args={[1, 1]} />
			<meshBasicMaterial side={THREE.DoubleSide} transparent opacity={0.5} color={visible ? 0xffffff : 0xff0000} />
		</mesh>
	);
};

const Scene = ({ blockColor, gridSize, gridColor }: { blockColor: string; gridSize: number; gridColor: string }) => {
	const [cubes, setCubes] = useState<[number, number, number][]>([]);
	const [highlightPos, setHighlightPos] = useState<[number, number, number]>([0, 0, 0]);
	const [highlightColor, setHighlightColor] = useState(0xffffff);
	const { camera, raycaster } = useThree();

	// Calculate grid properties based on size
	const grid = useMemo(() => {
		// For even grid sizes, we want to center the grid at (0,0)
		// For odd grid sizes, we want to have a cell centered at (0,0)
		let offset = 0;
		if (gridSize % 2 === 0) {
			offset = 0.5;
		}

		const halfSize = gridSize / 2;
		return {
			min: -halfSize + offset,
			max: halfSize + offset,
			size: gridSize,
			offset,
		};
	}, [gridSize]);

	useFrame((state) => {
		const mouse = new THREE.Vector2(state.mouse.x, state.mouse.y);
		raycaster.setFromCamera(mouse, camera);

		const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
		const intersectionPoint = new THREE.Vector3();

		if (raycaster.ray.intersectPlane(groundPlane, intersectionPoint)) {
			// Snap to grid by rounding to integer values
			const newX = Math.floor(intersectionPoint.x + 0.5);
			const newZ = Math.floor(intersectionPoint.z + 0.5);

			// Calculate grid bounds for validation
			const min = Math.ceil(grid.min);
			const max = Math.floor(grid.max) - 1;

			// Ensure highlight stays within grid bounds
			if (newX >= min && newX <= max && newZ >= min && newZ <= max) {
				setHighlightPos([newX, 0, newZ]);

				const objectExists = cubes.some((pos) => pos[0] === newX && pos[2] === newZ);
				setHighlightColor(objectExists ? 0xff0000 : 0xffffff);
			}
		}
	});

	const handleClick = () => {
		const [x, y, z] = highlightPos;
		const exists = cubes.some((pos) => pos[0] === x && pos[2] === z);

		if (!exists) {
			setCubes([...cubes, [x, y, z]]);
		}
	};

	const handleRightClick = (pos: [number, number, number]) => {
		setCubes(cubes.filter((cube) => cube[0] !== pos[0] || cube[2] !== pos[2]));
	};

	// Update all cubes when color changes
	useEffect(() => {
		// This effect just makes React aware of the dependency on blockColor
	}, [blockColor]);

	return (
		<>
			<ambientLight intensity={0.5} />
			<directionalLight position={[10, 10, 5]} intensity={1} />

			<group>
				{/* Dark background plane exactly matching the grid size */}
				<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
					<planeGeometry args={[gridSize, gridSize]} />
					<meshBasicMaterial color="#222222" />
				</mesh>

				{/* Creates a consistent grid aligned with cells */}
				{Array.from({ length: gridSize + 1 }).map((_, i) => {
					// Calculate position for each line to ensure proper alignment
					const pos = grid.min + i;
					return (
						<line key={`h-${i}`}>
							<bufferGeometry
								attach="geometry"
								onUpdate={(self) => {
									const positions = new Float32Array(6);
									positions[0] = grid.min;
									positions[1] = 0.01; // Slightly above the plane
									positions[2] = pos;
									positions[3] = grid.max;
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
					// Calculate position for each line to ensure proper alignment
					const pos = grid.min + i;
					return (
						<line key={`v-${i}`}>
							<bufferGeometry
								attach="geometry"
								onUpdate={(self) => {
									const positions = new Float32Array(6);
									positions[0] = pos;
									positions[1] = 0.01; // Slightly above the plane
									positions[2] = grid.min;
									positions[3] = pos;
									positions[4] = 0.01;
									positions[5] = grid.max;
									self.setAttribute("position", new THREE.BufferAttribute(positions, 3));
								}}
							/>
							<lineBasicMaterial attach="material" color={gridColor} />
						</line>
					);
				})}
			</group>

			{/* Invisible click plane matching grid size exactly */}
			<mesh rotation={[-Math.PI / 2, 0, 0]} onClick={handleClick} visible={false} position={[0, 0.02, 0]}>
				<planeGeometry args={[gridSize, gridSize]} />
				<meshBasicMaterial transparent opacity={0} />
			</mesh>

			<Highlight position={highlightPos} visible={highlightColor === 0xffffff} />

			{cubes.map((pos) => (
				<Cube
					key={`cube-${pos[0]}-${pos[2]}-${blockColor}`}
					position={pos}
					color={blockColor}
					onRightClick={handleRightClick}
				/>
			))}
			<OrbitControls enableRotate={false} enablePan={true} minZoom={30} maxZoom={100} enableDamping={false} />
		</>
	);
};

const ThreeScene = () => {
	const [guiControls, setGuiControls] = useState({
		canvasSize: 100,
		blockColor: "#ff0000",
		gridSize: 20,
		gridColor: "#ffffff",
	});

	// Calculate camera settings based on grid size
	const cameraSettings = useMemo(() => {
		const baseZoom = 40;
		// Adjust zoom based on grid size to keep the view consistent
		const scaleFactor = 20 / guiControls.gridSize;
		return {
			position: [15, 15, 15] as [number, number, number],
			zoom: baseZoom * scaleFactor,
		};
	}, [guiControls.gridSize]);

	useEffect(() => {
		const gui = new lil.GUI();

		// Create folders for better organization
		const canvasFolder = gui.addFolder("Canvas Settings");
		const gridFolder = gui.addFolder("Grid Settings");
		const blockFolder = gui.addFolder("Block Settings");

		// Canvas Size control with square increments
		canvasFolder
			.add(guiControls, "canvasSize", [50, 100, 150, 200])
			.name("Canvas Size (%)")
			.onChange((value: number) => {
				setGuiControls((prev) => ({ ...prev, canvasSize: value }));
			});

		// Grid size control
		gridFolder
			.add(guiControls, "gridSize", [10, 20, 30, 40, 50])
			.name("Grid Size")
			.onChange((value: number) => {
				setGuiControls((prev) => ({ ...prev, gridSize: value }));
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

		// Open folders by default
		canvasFolder.open();
		gridFolder.open();
		blockFolder.open();

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
			}}
		>
			<Canvas
				gl={{ antialias: true }}
				orthographic
				camera={{
					position: cameraSettings.position,
					zoom: cameraSettings.zoom,
					near: 0.1,
					far: 1000,
					rotation: [0, 0, 0],
					up: [0, 1, 0],
				}}
				style={{
					width: `${guiControls.canvasSize}%`,
					height: `${guiControls.canvasSize}%`,
					aspectRatio: "1 / 1",
				}}
			>
				<Scene blockColor={guiControls.blockColor} gridSize={guiControls.gridSize} gridColor={guiControls.gridColor} />
			</Canvas>
		</div>
	);
};

export default ThreeScene;
