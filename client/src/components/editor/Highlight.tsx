import * as THREE from "three";

interface HighlightProps {
	position: [number, number, number];
	visible: boolean;
	deleteMode: boolean;
}

// Highlight component to show where a new cube will be placed (supports stacking)
const Highlight = ({ position, visible, deleteMode }: HighlightProps) => {
	const highlightColor = deleteMode ? 0xff3333 : visible ? 0xffffff : 0xff0000;

	// Position the highlight at the correct y level for stacking
	// Add small offset (0.03) above the placement level to prevent z-fighting
	const yPos = position[1] + 0.03;

	return (
		<mesh position={[position[0], yPos, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
			<planeGeometry args={[1, 1]} />
			<meshBasicMaterial side={THREE.DoubleSide} transparent opacity={0.5} color={highlightColor} />
		</mesh>
	);
};

export default Highlight;
