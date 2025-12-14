import { useRef, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { MODELS } from "./types";

interface ModelProps {
	position: [number, number, number];
	modelId: string;
	rotation?: number; // Y-axis rotation in degrees
	scale?: number; // User-defined scale multiplier (1 = fit to 1x1x1 cube)
	onRightClick: (pos: [number, number, number]) => void;
	deleteMode: boolean;
	onClick: (pos: [number, number, number]) => void;
}

const Model = ({ 
	position, 
	modelId, 
	rotation = 0, 
	scale = 1, 
	onRightClick, 
	deleteMode, 
	onClick 
}: ModelProps) => {
	const groupRef = useRef<THREE.Group>(null);
	
	const modelInfo = MODELS[modelId];
	const { scene } = useGLTF(modelInfo?.path || '');
	
	// Clone the scene and calculate scale to fit 1x1x1 bounding box
	const { clonedScene, normalizedScale } = useMemo(() => {
		const clone = scene.clone();
		
		// Calculate bounding box of the model
		const box = new THREE.Box3().setFromObject(clone);
		const size = new THREE.Vector3();
		box.getSize(size);
		
		// Find the largest dimension and calculate scale to fit in 1x1x1 cube
		const maxDimension = Math.max(size.x, size.y, size.z);
		const fitScale = maxDimension > 0 ? 1 / maxDimension : 1;
		
		// Center the model at origin (so it sits on the ground plane)
		const center = new THREE.Vector3();
		box.getCenter(center);
		clone.position.sub(center);
		// Adjust Y so the model sits on the ground (bottom of bounding box at y=0)
		clone.position.y += size.y / 2;
		
		// Enable shadows on all meshes
		clone.traverse((child) => {
			if (child instanceof THREE.Mesh) {
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});
		
		return { clonedScene: clone, normalizedScale: fitScale };
	}, [scene]);

	// Final scale = normalized scale (to fit 1x1x1) * user scale multiplier
	const finalScale = normalizedScale * scale;

	// Handle right-click event for deletion
	const handleRightClick = (e: ThreeEvent<MouseEvent>) => {
		e.stopPropagation();
		onRightClick(position);
	};

	// Handle left-click in delete mode
	const handleClick = (e: ThreeEvent<MouseEvent>) => {
		if (deleteMode) {
			e.stopPropagation();
			onClick(position);
		}
	};

	if (!modelInfo) {
		console.warn(`Model not found: ${modelId}`);
		return null;
	}

	return (
		<group
			ref={groupRef}
			position={[position[0], position[1], position[2]]}
			rotation={[0, (rotation * Math.PI) / 180, 0]}
			scale={finalScale}
			onClick={handleClick}
			onContextMenu={handleRightClick}
		>
			<primitive object={clonedScene} />
		</group>
	);
};

// Preload all models to avoid loading delays
export const preloadModels = () => {
	Object.values(MODELS).forEach((model) => {
		useGLTF.preload(model.path);
	});
};

export default Model;
