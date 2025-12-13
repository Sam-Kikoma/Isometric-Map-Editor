// Shared types and constants for the editor

// Legacy cube-only type (for backward compatibility)
export interface CubeData {
	position: [number, number, number];
	color: string;
	texture: string | null;
}

// New unified asset type
export interface AssetData {
	position: [number, number, number];
	type: 'cube' | 'model';
	// For cubes
	color?: string;
	texture?: string | null;
	// For models
	modelId?: string;
	rotation?: number; // Y-axis rotation in degrees (0, 90, 180, 270)
	scale?: number;
}

// Texture definitions
export interface TextureInfo {
	id: string;
	name: string;
	path: string;
	category: 'brick' | 'fabric' | 'metal' | 'paper' | 'stone' | 'wood' | 'soil' | 'other';
}

export const TEXTURES: Record<string, TextureInfo> = {
	// Brick
	brick_123: { id: 'brick_123', name: 'Brick Light', path: '/textures/Texturelabs_Brick_123L.jpg', category: 'brick' },
	brick_124: { id: 'brick_124', name: 'Brick Medium', path: '/textures/Texturelabs_Brick_124M.jpg', category: 'brick' },
	brick_158: { id: 'brick_158', name: 'Brick Dark', path: '/textures/Texturelabs_Brick_158M.jpg', category: 'brick' },
	// Fabric
	fabric_120: { id: 'fabric_120', name: 'Fabric', path: '/textures/Texturelabs_Fabric_120M.jpg', category: 'fabric' },
	fabric_155: { id: 'fabric_155', name: 'Fabric Alt', path: '/textures/Texturelabs_Fabric_155M.jpg', category: 'fabric' },
	// Metal
	metal_122: { id: 'metal_122', name: 'Metal', path: '/textures/Texturelabs_Metal_122M.jpg', category: 'metal' },
	metal_282: { id: 'metal_282', name: 'Metal Alt', path: '/textures/Texturelabs_Metal_282M.jpg', category: 'metal' },
	// Paper
	paper_278: { id: 'paper_278', name: 'Paper', path: '/textures/Texturelabs_Paper_278M.jpg', category: 'paper' },
	paper_361: { id: 'paper_361', name: 'Paper Alt', path: '/textures/Texturelabs_Paper_361M.jpg', category: 'paper' },
	// Stone
	stone_125: { id: 'stone_125', name: 'Stone', path: '/textures/Texturelabs_Stone_125M.jpg', category: 'stone' },
	stone_160: { id: 'stone_160', name: 'Stone Alt', path: '/textures/Texturelabs_Stone_160M.jpg', category: 'stone' },
	// Wood
	wood_145: { id: 'wood_145', name: 'Wood', path: '/textures/Texturelabs_Wood_145M.jpg', category: 'wood' },
	wood_260: { id: 'wood_260', name: 'Wood Alt', path: '/textures/Texturelabs_Wood_260M.jpg', category: 'wood' },
	// Soil
	soil_120: { id: 'soil_120', name: 'Soil', path: '/textures/Texturelabs_Soil_120M.jpg', category: 'soil' },
	soil_121: { id: 'soil_121', name: 'Soil Alt', path: '/textures/Texturelabs_Soil_121M.jpg', category: 'soil' },
	// Other
	grunge_200: { id: 'grunge_200', name: 'Grunge', path: '/textures/Texturelabs_Grunge_200M.jpg', category: 'other' },
	inkpaint_394: { id: 'inkpaint_394', name: 'Ink Paint', path: '/textures/Texturelabs_InkPaint_394M.jpg', category: 'other' },
};

// Model definitions
export interface ModelInfo {
	id: string;
	name: string;
	path: string;
	category: 'building' | 'vehicle' | 'prop' | 'nature' | 'character';
	scale?: number; // default scale adjustment to fit grid
}

export const MODELS: Record<string, ModelInfo> = {
	// Buildings (typically larger, need smaller scale)
	big_building: { id: 'big_building', name: 'Big Building', path: '/models/City Pack.undefined-glb/Big Building.glb', category: 'building', scale: 0.15 },
	brown_building: { id: 'brown_building', name: 'Brown Building', path: '/models/City Pack.undefined-glb/Brown Building.glb', category: 'building', scale: 0.15 },
	building_green: { id: 'building_green', name: 'Green Building', path: '/models/City Pack.undefined-glb/Building Green.glb', category: 'building', scale: 0.15 },
	building_red: { id: 'building_red', name: 'Red Building', path: '/models/City Pack.undefined-glb/Building Red.glb', category: 'building', scale: 0.15 },
	building_red_corner: { id: 'building_red_corner', name: 'Red Corner Building', path: '/models/City Pack.undefined-glb/Building Red Corner.glb', category: 'building', scale: 0.15 },
	greenhouse: { id: 'greenhouse', name: 'Greenhouse', path: '/models/City Pack.undefined-glb/Greenhouse.glb', category: 'building', scale: 0.2 },
	pizza_corner: { id: 'pizza_corner', name: 'Pizza Corner', path: '/models/City Pack.undefined-glb/Pizza Corner.glb', category: 'building', scale: 0.15 },
	// Vehicles (medium size)
	car: { id: 'car', name: 'Car', path: '/models/City Pack.undefined-glb/Car.glb', category: 'vehicle', scale: 0.25 },
	bus: { id: 'bus', name: 'Bus', path: '/models/City Pack.undefined-glb/Bus.glb', category: 'vehicle', scale: 0.2 },
	suv: { id: 'suv', name: 'SUV', path: '/models/City Pack.undefined-glb/SUV.glb', category: 'vehicle', scale: 0.25 },
	van: { id: 'van', name: 'Van', path: '/models/City Pack.undefined-glb/Van.glb', category: 'vehicle', scale: 0.25 },
	pickup_truck: { id: 'pickup_truck', name: 'Pickup Truck', path: '/models/City Pack.undefined-glb/Pickup Truck.glb', category: 'vehicle', scale: 0.25 },
	sports_car: { id: 'sports_car', name: 'Sports Car', path: '/models/City Pack.undefined-glb/Sports Car.glb', category: 'vehicle', scale: 0.25 },
	motorcycle: { id: 'motorcycle', name: 'Motorcycle', path: '/models/City Pack.undefined-glb/Motorcycle.glb', category: 'vehicle', scale: 0.3 },
	bicycle: { id: 'bicycle', name: 'Bicycle', path: '/models/City Pack.undefined-glb/Bicycle.glb', category: 'vehicle', scale: 0.3 },
	police_car: { id: 'police_car', name: 'Police Car', path: '/models/City Pack.undefined-glb/Police Car.glb', category: 'vehicle', scale: 0.25 },
	// Props (small items)
	bench: { id: 'bench', name: 'Bench', path: '/models/City Pack.undefined-glb/Bench.glb', category: 'prop', scale: 0.3 },
	trash_can: { id: 'trash_can', name: 'Trash Can', path: '/models/City Pack.undefined-glb/Trash Can.glb', category: 'prop', scale: 0.35 },
	dumpster: { id: 'dumpster', name: 'Dumpster', path: '/models/City Pack.undefined-glb/Dumpster.glb', category: 'prop', scale: 0.3 },
	mailbox: { id: 'mailbox', name: 'Mailbox', path: '/models/City Pack.undefined-glb/Mailbox.glb', category: 'prop', scale: 0.35 },
	fire_hydrant: { id: 'fire_hydrant', name: 'Fire Hydrant', path: '/models/City Pack.undefined-glb/Fire hydrant.glb', category: 'prop', scale: 0.4 },
	traffic_light: { id: 'traffic_light', name: 'Traffic Light', path: '/models/City Pack.undefined-glb/Traffic Light.glb', category: 'prop', scale: 0.25 },
	stop_sign: { id: 'stop_sign', name: 'Stop Sign', path: '/models/City Pack.undefined-glb/Stop sign.glb', category: 'prop', scale: 0.3 },
	bus_stop: { id: 'bus_stop', name: 'Bus Stop', path: '/models/City Pack.undefined-glb/Bus Stop.glb', category: 'prop', scale: 0.25 },
	atm: { id: 'atm', name: 'ATM', path: '/models/City Pack.undefined-glb/ATM.glb', category: 'prop', scale: 0.35 },
	cone: { id: 'cone', name: 'Cone', path: '/models/City Pack.undefined-glb/Cone.glb', category: 'prop', scale: 0.5 },
	box: { id: 'box', name: 'Box', path: '/models/City Pack.undefined-glb/Box.glb', category: 'prop', scale: 0.4 },
	fence: { id: 'fence', name: 'Fence', path: '/models/City Pack.undefined-glb/Fence.glb', category: 'prop', scale: 0.3 },
	fence_piece: { id: 'fence_piece', name: 'Fence Piece', path: '/models/City Pack.undefined-glb/Fence Piece.glb', category: 'prop', scale: 0.3 },
	billboard: { id: 'billboard', name: 'Billboard', path: '/models/City Pack.undefined-glb/Billboard.glb', category: 'prop', scale: 0.2 },
	flower_pot: { id: 'flower_pot', name: 'Flower Pot', path: '/models/City Pack.undefined-glb/Flower Pot.glb', category: 'prop', scale: 0.4 },
	planter: { id: 'planter', name: 'Planter & Bushes', path: '/models/City Pack.undefined-glb/Planter & Bushes.glb', category: 'prop', scale: 0.35 },
	air_conditioner: { id: 'air_conditioner', name: 'Air Conditioner', path: '/models/City Pack.undefined-glb/Air conditioner.glb', category: 'prop', scale: 0.4 },
	power_box: { id: 'power_box', name: 'Power Box', path: '/models/City Pack.undefined-glb/Power Box.glb', category: 'prop', scale: 0.35 },
	// Nature
	tree: { id: 'tree', name: 'Tree', path: '/models/City Pack.undefined-glb/Tree.glb', category: 'nature', scale: 0.25 },
	// Characters
	man: { id: 'man', name: 'Man', path: '/models/City Pack.undefined-glb/Man.glb', category: 'character', scale: 0.35 },
	adventurer: { id: 'adventurer', name: 'Adventurer', path: '/models/City Pack.undefined-glb/Adventurer.glb', category: 'character', scale: 0.35 },
};

// Helper to get all texture paths for preloading
export const getAllTexturePaths = (): string[] => {
	return Object.values(TEXTURES).map(t => t.path);
};

// Helper to convert legacy CubeData to AssetData
export const cubeToAsset = (cube: CubeData): AssetData => ({
	position: cube.position,
	type: 'cube',
	color: cube.color,
	texture: cube.texture,
});

// Helper to convert AssetData to legacy CubeData (for backward compat)
export const assetToCube = (asset: AssetData): CubeData | null => {
	if (asset.type !== 'cube') return null;
	return {
		position: asset.position,
		color: asset.color || '#ff0000',
		texture: asset.texture || null,
	};
};
