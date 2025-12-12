// Shared types and constants for the editor

export interface CubeData {
	position: [number, number, number];
	color: string;
	texture: string | null;
}

export const TEXTURES = {
	none: null,
	brick: "/Texturelabs_Brick_158M.jpg",
	fabric: "/Texturelabs_Fabric_120M.jpg",
	metal: "/Texturelabs_Metal_282M.jpg",
	paper: "/Texturelabs_Paper_361M.jpg",
};
