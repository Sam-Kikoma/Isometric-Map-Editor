import { useRef } from "react";
import * as THREE from "three";

interface CubeProps {
	position: [number, number, number];
	color: string;
	texture: THREE.Texture | null;
	onRightClick: (pos: [number, number, number]) => void;
	deleteMode: boolean;
	onClick: (pos: [number, number, number]) => void;
}

const Cube = ({ position, color, texture, onRightClick, deleteMode, onClick }: CubeProps) => {
	// Create a mesh reference to track the cube
	const meshRef = useRef<THREE.Mesh>(null);

	// Handle right-click event for cube deletion
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

// Import ThreeEvent type from @react-three/fiber
import type { ThreeEvent } from "@react-three/fiber";

export default Cube;
