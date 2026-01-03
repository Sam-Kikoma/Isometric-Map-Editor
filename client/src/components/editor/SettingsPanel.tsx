import { useState } from "react";
import { TEXTURES, MODELS } from "./types";

interface SettingsPanelProps {
	blockColor: string;
	setBlockColor: (color: string) => void;
	gridColor: string;
	setGridColor: (color: string) => void;
	selectedTexture: string | null;
	setSelectedTexture: (texture: string | null) => void;
	deleteMode: boolean;
	setDeleteMode: (mode: boolean) => void;
	// New props for models
	placementMode: 'cube' | 'model';
	setPlacementMode: (mode: 'cube' | 'model') => void;
	selectedModel: string | null;
	setSelectedModel: (modelId: string | null) => void;
	modelRotation: number;
	setModelRotation: (rotation: number) => void;
	gridSize: number;
	setGridSize: (size: number) => void;
}

// Group textures by category
const texturesByCategory = Object.values(TEXTURES).reduce((acc, texture) => {
	if (!acc[texture.category]) {
		acc[texture.category] = [];
	}
	acc[texture.category].push(texture);
	return acc;
}, {} as Record<string, typeof TEXTURES[keyof typeof TEXTURES][]>);

// Group models by category
const modelsByCategory = Object.values(MODELS).reduce((acc, model) => {
	if (!acc[model.category]) {
		acc[model.category] = [];
	}
	acc[model.category].push(model);
	return acc;
}, {} as Record<string, typeof MODELS[keyof typeof MODELS][]>);

const SettingsPanel = ({
	blockColor,
	setBlockColor,
	gridColor,
	setGridColor,
	selectedTexture,
	setSelectedTexture,
	deleteMode,
	setDeleteMode,
	placementMode: _placementMode,
	setPlacementMode,
	selectedModel,
	setSelectedModel,
	modelRotation,
	setModelRotation,
	gridSize: _gridSize,
	setGridSize: _setGridSize,
}: SettingsPanelProps) => {
	const [isOpen, setIsOpen] = useState(true);
	const [activeTab, setActiveTab] = useState<'cube' | 'model'>('cube');

	const handleTabChange = (tab: 'cube' | 'model') => {
		setActiveTab(tab);
		setPlacementMode(tab);
	};

	const rotateModel = (direction: 'left' | 'right') => {
		const newRotation = direction === 'right' 
			? (modelRotation + 90) % 360 
			: (modelRotation - 90 + 360) % 360;
		setModelRotation(newRotation);
	};

	return (
		<div className="fixed top-20 right-4 z-10 flex items-start gap-2">
			{/* Toggle Button */}
			<button className="btn btn-circle btn-sm shadow-lg bg-base-200" onClick={() => setIsOpen(!isOpen)}>
				{isOpen ? "→" : "←"}
			</button>

			{/* Panel */}
			{isOpen && (
				<div className="card bg-base-200 shadow-xl w-80 max-h-[calc(100vh-120px)] overflow-hidden flex flex-col">
					<div className="card-body p-4 gap-4 overflow-y-auto">
						<h2 className="card-title text-lg">Settings</h2>

						{/* Mode Tabs */}
						<div className="tabs tabs-boxed">
							<button 
								className={`tab flex-1 ${activeTab === 'cube' ? 'tab-active' : ''}`}
								onClick={() => handleTabChange('cube')}
							>
								🧱 Cubes
							</button>
							<button 
								className={`tab flex-1 ${activeTab === 'model' ? 'tab-active' : ''}`}
								onClick={() => handleTabChange('model')}
							>
								🏠 Models
							</button>
						</div>

						{/* Cube Settings */}
						{activeTab === 'cube' && (
							<>
								{/* Block Color */}
								<div className="form-control">
									<label className="label">
										<span className="label-text font-medium">Block Color</span>
									</label>
									<div className="flex gap-2 items-center">
										<input
											type="color"
											value={blockColor}
											onChange={(e) => setBlockColor(e.target.value)}
											className="w-12 h-10 rounded cursor-pointer border-0"
										/>
										<input
											type="text"
											value={blockColor}
											onChange={(e) => setBlockColor(e.target.value)}
											className="input input-bordered input-sm flex-1"
										/>
									</div>
								</div>

								{/* Quick Color Presets */}
								<div className="form-control">
									<label className="label">
										<span className="label-text font-medium">Quick Colors</span>
									</label>
									<div className="flex flex-wrap gap-2">
										{["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff", "#ffffff", "#333333"].map(
											(color) => (
												<button
													key={color}
													className={`w-8 h-8 rounded border-2 ${
														blockColor === color ? "border-primary" : "border-transparent"
													}`}
													style={{ backgroundColor: color }}
													onClick={() => setBlockColor(color)}
												/>
											)
										)}
									</div>
								</div>

								{/* Texture Selection */}
								<div className="form-control">
									<label className="label">
										<span className="label-text font-medium">Block Texture</span>
									</label>
									<div className="space-y-2">
										{/* No texture option */}
										<button
											className={`btn btn-sm w-full justify-start ${!selectedTexture ? 'btn-primary' : 'btn-ghost'}`}
											onClick={() => setSelectedTexture(null)}
										>
											None (Solid Color)
										</button>
										
										{/* Textures by category */}
										{Object.entries(texturesByCategory).map(([category, textures]) => (
											<div key={category} className="collapse collapse-arrow bg-base-100 rounded-lg">
												<input type="checkbox" className="peer" />
												<div className="collapse-title font-medium capitalize py-2 min-h-0">
													{category}
												</div>
												<div className="collapse-content">
													<div className="grid grid-cols-3 gap-1 pt-2">
														{textures.map((texture) => (
															<button
																key={texture.id}
																className={`aspect-square rounded border-2 overflow-hidden ${
																	selectedTexture === texture.path ? 'border-primary' : 'border-transparent'
																}`}
																onClick={() => setSelectedTexture(texture.path)}
																title={texture.name}
															>
																<img 
																	src={texture.path} 
																	alt={texture.name}
																	className="w-full h-full object-cover"
																/>
															</button>
														))}
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							</>
						)}

						{/* Model Settings */}
						{activeTab === 'model' && (
							<>
								{/* Rotation Control */}
								<div className="form-control">
									<label className="label">
										<span className="label-text font-medium">Rotation: {modelRotation}°</span>
									</label>
									<div className="flex gap-2">
										<button 
											className="btn btn-sm flex-1"
											onClick={() => rotateModel('left')}
										>
											↶ -90°
										</button>
										<button 
											className="btn btn-sm flex-1"
											onClick={() => rotateModel('right')}
										>
											↷ +90°
										</button>
									</div>
									<span className="text-xs text-gray-500 mt-1">Press 'R' to rotate while placing</span>
								</div>

								{/* Model Selection */}
								<div className="form-control">
									<label className="label">
										<span className="label-text font-medium">Select Model</span>
									</label>
									<div className="space-y-2">
										{Object.entries(modelsByCategory).map(([category, models]) => (
											<div key={category} className="collapse collapse-arrow bg-base-100 rounded-lg">
												<input type="checkbox" defaultChecked={category === 'building'} className="peer" />
												<div className="collapse-title font-medium capitalize py-2 min-h-0">
													{category} ({models.length})
												</div>
												<div className="collapse-content">
													<div className="grid grid-cols-2 gap-1 pt-2">
														{models.map((model) => (
															<button
																key={model.id}
																className={`btn btn-sm justify-start text-xs ${
																	selectedModel === model.id ? 'btn-primary' : 'btn-ghost'
																}`}
																onClick={() => setSelectedModel(model.id)}
															>
																{model.name}
															</button>
														))}
													</div>
												</div>
											</div>
										))}
									</div>
								</div>

								{selectedModel && (
									<div className="alert alert-info text-sm">
										<span>Selected: <strong>{MODELS[selectedModel]?.name}</strong></span>
									</div>
								)}
							</>
						)}

						{/* Grid Color - Always visible */}
						<div className="divider my-1"></div>
						
						<div className="form-control">
							<label className="label">
								<span className="label-text font-medium">Grid Color</span>
							</label>
							<div className="flex gap-2 items-center">
								<input
									type="color"
									value={gridColor}
									onChange={(e) => setGridColor(e.target.value)}
									className="w-12 h-10 rounded cursor-pointer border-0"
								/>
								<input
									type="text"
									value={gridColor}
									onChange={(e) => setGridColor(e.target.value)}
									className="input input-bordered input-sm flex-1"
								/>
							</div>
						</div>

						{/* Delete Mode Toggle */}
						<div className="form-control">
							<label className="label cursor-pointer">
								<span className="label-text font-medium">Delete Mode</span>
								<input
									type="checkbox"
									className={`toggle ${deleteMode ? "toggle-error" : "toggle-primary"}`}
									checked={deleteMode}
									onChange={(e) => setDeleteMode(e.target.checked)}
								/>
							</label>
							<span className="text-xs text-gray-500">Press 'D' to toggle</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default SettingsPanel;
