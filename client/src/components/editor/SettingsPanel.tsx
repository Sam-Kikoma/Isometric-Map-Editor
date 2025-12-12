import { useState } from "react";
import { TEXTURES } from "./types";

interface SettingsPanelProps {
	blockColor: string;
	setBlockColor: (color: string) => void;
	gridColor: string;
	setGridColor: (color: string) => void;
	selectedTexture: string | null;
	setSelectedTexture: (texture: string | null) => void;
	deleteMode: boolean;
	setDeleteMode: (mode: boolean) => void;
}

const SettingsPanel = ({
	blockColor,
	setBlockColor,
	gridColor,
	setGridColor,
	selectedTexture,
	setSelectedTexture,
	deleteMode,
	setDeleteMode,
}: SettingsPanelProps) => {
	const [isOpen, setIsOpen] = useState(true);

	return (
		<div className="fixed top-20 right-4 z-10 flex items-start gap-2">
			{/* Toggle Button */}
			<button className="btn btn-circle btn-sm shadow-lg bg-base-200" onClick={() => setIsOpen(!isOpen)}>
				{isOpen ? "→" : "←"}
			</button>

			{/* Panel */}
			{isOpen && (
				<div className="card bg-base-200 shadow-xl w-72">
					<div className="card-body p-4 gap-4">
						<h2 className="card-title text-lg">Settings</h2>

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

						{/* Grid Color */}
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

						{/* Texture Selection */}
						<div className="form-control">
							<label className="label">
								<span className="label-text font-medium">Block Texture</span>
							</label>
							<select
								className="select select-bordered select-sm w-full"
								value={selectedTexture || "none"}
								onChange={(e) => setSelectedTexture(e.target.value === "none" ? null : e.target.value)}
							>
								<option value="none">None (Solid Color)</option>
								<option value={TEXTURES.brick}>Brick</option>
								<option value={TEXTURES.fabric}>Fabric</option>
								<option value={TEXTURES.metal}>Metal</option>
								<option value={TEXTURES.paper}>Paper</option>
							</select>
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
					</div>
				</div>
			)}
		</div>
	);
};

export default SettingsPanel;
