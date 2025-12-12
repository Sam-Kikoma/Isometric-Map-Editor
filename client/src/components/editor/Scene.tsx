import { useState, useMemo } from "react";
import { useFrame, useThree, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Cube from "./Cube";
import Highlight from "./Highlight";
import { TEXTURES, CubeData } from "./types";

// Texture loader component to preload textures
const TextureLoader = ({
	children,
}: {
	children: (textureMap: Record<string, THREE.Texture | null>) => React.ReactElement;
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

interface SceneProps {
	blockColor: string;
	gridSize: number;
	gridColor: string;
	cubes: CubeData[];
	onCubesChange: (cubes: CubeData[]) => void;
	deleteMode: boolean;
	selectedTexture: string | null;
}

const Scene = ({ blockColor, gridSize, gridColor, cubes, onCubesChange, deleteMode, selectedTexture }: SceneProps) => {
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
						{/* Horizontal grid lines */}
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

						{/* Vertical grid lines */}
						{Array.from({ length: gridSize + 1 }).map((_, i) => {
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

					{/* Invisible click plane */}
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

export default Scene;
