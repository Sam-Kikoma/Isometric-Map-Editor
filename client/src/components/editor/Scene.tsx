import { useState, useMemo, Suspense } from "react";
import { useFrame, useThree, useLoader } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import Cube from "./Cube";
import Model from "./Model";
import Highlight from "./Highlight";
import { AssetData, getAllTexturePaths } from "./types";
import type { UserCursor } from "../../hooks/useCollaboration";

// Texture loader component to preload textures
const TextureLoader = ({
	children,
}: {
	children: (textureMap: Record<string, THREE.Texture | null>) => React.ReactElement;
}) => {
	const texturePaths = getAllTexturePaths();
	const textures = useLoader(THREE.TextureLoader, texturePaths);

	// Create a mapping of texture paths to loaded textures
	const textureMap = useMemo(() => {
		const map: Record<string, THREE.Texture | null> = {};
		texturePaths.forEach((path, index) => {
			map[path] = textures[index];
			// Configure texture repeat and wrapping
			textures[index].wrapS = textures[index].wrapT = THREE.RepeatWrapping;
			textures[index].repeat.set(1, 1);
		});
		return map;
	}, [textures, texturePaths]);

	return children(textureMap);
};

// Selection state for what user is placing
export interface PlacementSelection {
	mode: 'cube' | 'model';
	// For cubes
	color?: string;
	textureId?: string | null;
	// For models
	modelId?: string;
	rotation?: number;
}

interface SceneProps {
	blockColor: string;
	gridSize: number;
	gridColor: string;
	assets: AssetData[];
	onAssetsChange: (assets: AssetData[]) => void;
	deleteMode: boolean;
	selectedTexture: string | null;
	selectedModel: string | null;
	placementMode: 'cube' | 'model';
	modelRotation: number;
	userCursors?: UserCursor[];
	onCursorMove?: (position: [number, number, number] | null) => void;
}

const Scene = ({ 
	blockColor, 
	gridSize, 
	gridColor, 
	assets, 
	onAssetsChange, 
	deleteMode, 
	selectedTexture,
	selectedModel,
	placementMode,
	modelRotation,
	userCursors = [],
	onCursorMove,
}: SceneProps) => {
	const [highlightPos, setHighlightPos] = useState<[number, number, number]>([0, 0, 0]);
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
				// Calculate the stacking height for the highlight
				const assetsAtPosition = assets.filter((asset) => asset.position[0] === newX && asset.position[2] === newZ);
				const stackY = assetsAtPosition.length > 0 
					? Math.max(...assetsAtPosition.map((asset) => asset.position[1])) + 1 
					: 0;
				
				setHighlightPos([newX, stackY, newZ]);
				
				// Update cursor position for collaboration
				onCursorMove?.([newX, stackY, newZ]);
			}
		}
	});

	const handleClick = () => {
		const [x, , z] = highlightPos;

		if (deleteMode) {
			return;
		}

		// Find all assets at this x,z position and get the highest y value
		const assetsAtPosition = assets.filter((asset) => asset.position[0] === x && asset.position[2] === z);
		const highestY = assetsAtPosition.length > 0 
			? Math.max(...assetsAtPosition.map((asset) => asset.position[1])) + 1 
			: 0;

		let newAsset: AssetData;
		
		if (placementMode === 'model' && selectedModel) {
			newAsset = {
				position: [x, highestY, z],
				type: 'model',
				modelId: selectedModel,
				rotation: modelRotation,
			};
		} else {
			newAsset = {
				position: [x, highestY, z],
				type: 'cube',
				color: blockColor,
				texture: selectedTexture,
			};
		}
		
		const newAssets = [...assets, newAsset];
		onAssetsChange(newAssets);
	};

	const handleDeleteAsset = (pos: [number, number, number]) => {
		// Delete the specific asset at this exact position (including y)
		const newAssets = assets.filter(
			(asset) => !(asset.position[0] === pos[0] && asset.position[1] === pos[1] && asset.position[2] === pos[2])
		);
		onAssetsChange(newAssets);
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

					<Highlight position={highlightPos} visible={true} deleteMode={deleteMode} />

					{/* Render cubes */}
					{assets.filter(asset => asset.type === 'cube').map((asset, index) => (
						<Cube
							key={`cube-${asset.position[0]}-${asset.position[2]}-${index}`}
							position={asset.position}
							color={asset.color || '#ff0000'}
							onRightClick={handleDeleteAsset}
							deleteMode={deleteMode}
							onClick={handleDeleteAsset}
							texture={asset.texture ? textureMap[asset.texture] : null}
						/>
					))}

					{/* Render models */}
					<Suspense fallback={null}>
						{assets.filter(asset => asset.type === 'model' && asset.modelId).map((asset, index) => (
							<Model
								key={`model-${asset.position[0]}-${asset.position[2]}-${index}`}
								position={asset.position}
								modelId={asset.modelId!}
								rotation={asset.rotation}
								scale={asset.scale}
								onRightClick={handleDeleteAsset}
								deleteMode={deleteMode}
								onClick={handleDeleteAsset}
							/>
						))}
					</Suspense>

					{/* Render other users' cursors */}
					{userCursors.map((cursor, index) => 
						cursor.position && (
							<group key={`cursor-${index}`} position={cursor.position}>
								{/* Cursor ring */}
								<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
									<ringGeometry args={[0.3, 0.4, 32]} />
									<meshBasicMaterial color={cursor.color} transparent opacity={0.8} />
								</mesh>
								{/* Username label */}
								<Html
									position={[0, 0.5, 0]}
									center
									style={{
										pointerEvents: 'none',
										userSelect: 'none',
									}}
								>
									<div
										style={{
											background: cursor.color,
											color: 'white',
											padding: '2px 8px',
											borderRadius: '4px',
											fontSize: '12px',
											fontWeight: 'bold',
											whiteSpace: 'nowrap',
											textShadow: '0 1px 2px rgba(0,0,0,0.5)',
										}}
									>
										{cursor.name}
									</div>
								</Html>
							</group>
						)
					)}

					<OrbitControls enableRotate={false} enablePan={true} minZoom={30} maxZoom={100} enableDamping={false} />
				</>
			)}
		</TextureLoader>
	);
};

export default Scene;
