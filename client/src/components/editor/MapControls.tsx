import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { CubeData } from "./types";

interface MapControlsProps {
	cubes: CubeData[];
	blockColor: string;
	handleLoadMap: (cubes: CubeData[], color: string) => void;
	deleteMode: boolean;
	setDeleteMode: (mode: boolean) => void;
}

interface MapData {
	id: string;
	title: string;
	description: string;
	isPublic: boolean;
}

const MapControls = ({ cubes, blockColor, handleLoadMap, deleteMode, setDeleteMode }: MapControlsProps) => {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [isPublic, setIsPublic] = useState(true);
	const [saving, setSaving] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);
	const [saveError, setError] = useState("");
	const [maps, setMaps] = useState<MapData[]>([]);
	const [loading, setLoading] = useState(false);
	const [showLoadDialog, setShowLoadDialog] = useState(false);

	// Navigate hook for redirecting after logout
	const navigate = useNavigate();

	// Fetch user's maps when component mounts
	useEffect(() => {
		fetchMaps();
	}, []);

	const fetchMaps = async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem("token");

			const response = await fetch("http://localhost:3001/api/maps", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error("Failed to fetch maps");
			}

			const data = await response.json();
			setMaps(data.data || []);
		} catch (error) {
			console.error("Error fetching maps:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSaveMap = async () => {
		if (!title.trim()) {
			setError("Title is required");
			return;
		}

		try {
			setSaving(true);
			setError("");

			// Prepare map data with current cubes and color
			const mapData = {
				title,
				description,
				isPublic,
				data: {
					cubes,
					blockColor,
				},
			};

			const token = localStorage.getItem("token");

			const response = await fetch("http://localhost:3001/api/maps", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(mapData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to save map");
			}

			setSaveSuccess(true);

			// Reset form after successful save
			setTimeout(() => {
				setSaveSuccess(false);
				setTitle("");
				setDescription("");
			}, 2000);

			// Refresh maps list
			fetchMaps();
		} catch (error) {
			console.error("Error saving map:", error);
			setError(error instanceof Error ? error.message : "An error occurred");
		} finally {
			setSaving(false);
		}
	};

	const loadMap = async (mapId: string) => {
		try {
			setLoading(true);
			const token = localStorage.getItem("token");

			const response = await fetch(`http://localhost:3001/api/maps/${mapId}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error("Failed to load map");
			}

			const mapData = await response.json();
			console.log("Loaded map data:", mapData);

			if (mapData.data) {
				let cubes, blockColor;
				if (mapData.data.data) {
					// Structure: mapData.data.data.{cubes, blockColor}
					cubes = mapData.data.data.cubes;
					blockColor = mapData.data.data.blockColor;
				} else {
					// Structure: mapData.data.{cubes, blockColor}
					cubes = mapData.data.cubes;
					blockColor = mapData.data.blockColor;
				}

				// Validate the data before using it
				if (Array.isArray(cubes) && typeof blockColor === "string") {
					console.log("Loading cubes:", cubes, "color:", blockColor);
					handleLoadMap(cubes, blockColor);
				} else {
					console.error("Invalid map data format:", mapData);
					throw new Error("Invalid map data format");
				}
			} else {
				throw new Error("Map data not found");
			}

			setShowLoadDialog(false);
		} catch (error) {
			console.error("Error loading map:", error);
		} finally {
			setLoading(false);
		}
	};

	const deleteMap = async (mapId: string) => {
		try {
			const token = localStorage.getItem("token");

			const response = await fetch(`http://localhost:3001/api/maps/${mapId}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error("Failed to delete map");
			}

			fetchMaps();
		} catch (error) {
			console.error("Error deleting map:", error);
		}
	};

	// Handle logout function
	const handleLogout = () => {
		localStorage.removeItem("token");
		navigate("/");
	};

	// Toggle delete mode
	const toggleDeleteMode = () => {
		setDeleteMode(!deleteMode);
	};

	return (
		<>
			{/* Navbar */}
			<div className="navbar bg-base-100 shadow-lg fixed top-0 left-0 right-0 z-20">
				<div className="flex-1">
					<Link to="/" className="btn btn-ghost text-xl">
						IsoEdit
					</Link>
				</div>
				<div className="flex-none gap-2">
					<Link to="/community" className="btn btn-ghost btn-sm">
						Community
					</Link>
					<button
						className="btn btn-primary btn-sm"
						onClick={() => (document.getElementById("save-map-modal") as HTMLDialogElement)?.showModal()}
					>
						Save Map
					</button>
					<button
						className="btn btn-secondary btn-sm"
						onClick={() => {
							fetchMaps();
							setShowLoadDialog(true);
						}}
					>
						Load Map
					</button>
					<button className="btn btn-outline btn-sm" onClick={handleLogout}>
						Logout
					</button>
				</div>
			</div>

			{/* Toolbar - Left side */}
			<div className="absolute top-20 left-4 z-10">
				<div className="flex flex-col gap-2">
					{/* Delete Mode Toggle */}
					<button className={`btn ${deleteMode ? "btn-error" : "btn-outline"}`} onClick={toggleDeleteMode}>
						{deleteMode ? "Exit Delete Mode" : "Delete Blocks"}
					</button>
				</div>
			</div>

			{/* Save Modal */}
			<dialog id="save-map-modal" className="modal">
				<div className="modal-box">
					<h3 className="font-bold text-lg">Save Map</h3>

					{saveSuccess && <div className="alert alert-success mt-2">Map saved successfully!</div>}

					{saveError && <div className="alert alert-error mt-2">{saveError}</div>}

					<div className="form-control mt-4">
						<label className="label">
							<span className="label-text">Title</span>
						</label>
						<input
							type="text"
							placeholder="Map title"
							className="input input-bordered"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
						/>
					</div>

					<div className="form-control mt-2">
						<label className="label">
							<span className="label-text">Description</span>
						</label>
						<textarea
							placeholder="Map description"
							className="textarea textarea-bordered"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>

					<div className="form-control mt-2">
						<label className="label cursor-pointer">
							<span className="label-text">Public</span>
							<input
								type="checkbox"
								className="toggle toggle-primary"
								checked={isPublic}
								onChange={(e) => setIsPublic(e.target.checked)}
							/>
						</label>
					</div>

					<div className="modal-action">
						<form method="dialog">
							<button className="btn btn-outline mr-2">Cancel</button>
						</form>
						<button className={`btn btn-primary ${saving ? "loading" : ""}`} onClick={handleSaveMap} disabled={saving}>
							{saving ? "Saving..." : "Save Map"}
						</button>
					</div>
				</div>
			</dialog>

			{/* Load Dialog */}
			{showLoadDialog && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-base-200 p-6 rounded-lg w-full max-w-md">
						<h2 className="text-xl font-bold mb-4">Load Map</h2>

						{loading ? (
							<div className="flex justify-center py-8">
								<span className="loading loading-spinner loading-lg"></span>
							</div>
						) : maps.length === 0 ? (
							<div className="text-center py-4">
								<p>No saved maps found</p>
							</div>
						) : (
							<div className="max-h-64 overflow-y-auto">
								{maps.map((map) => (
									<div key={map.id} className="card bg-base-100 mb-2">
										<div className="card-body p-4">
											<h3 className="card-title text-base">{map.title}</h3>
											<p className="text-sm">{map.description}</p>
											<div className="card-actions justify-end mt-2">
												<button className="btn btn-primary btn-sm" onClick={() => loadMap(map.id)}>
													Load
												</button>
												<button className="btn btn-error btn-sm" onClick={() => deleteMap(map.id)}>
													Delete
												</button>
											</div>
										</div>
									</div>
								))}
							</div>
						)}

						<div className="flex justify-end mt-4">
							<button className="btn btn-outline" onClick={() => setShowLoadDialog(false)}>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default MapControls;
