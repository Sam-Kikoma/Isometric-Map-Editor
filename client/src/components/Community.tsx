import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";

interface MapData {
	id: string;
	title: string;
	description: string;
	createdAt: string;
	updatedAt: string;
	isPublic: boolean;
	user?: {
		username: string;
	};
}

interface RatingData {
	average: number;
	count: number;
	userRating: number | null;
}

const StarRating = ({
	rating,
	onRate,
	interactive = true,
}: {
	rating: number;
	onRate?: (value: number) => void;
	interactive?: boolean;
}) => {
	const [hovered, setHovered] = useState(0);

	return (
		<div className="flex gap-1">
			{[1, 2, 3, 4, 5].map((star) => (
				<button
					key={star}
					className={`text-xl ${
						interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
					} transition-transform`}
					onMouseEnter={() => interactive && setHovered(star)}
					onMouseLeave={() => interactive && setHovered(0)}
					onClick={() => interactive && onRate?.(star)}
					disabled={!interactive}
				>
					<span className={hovered >= star || rating >= star ? "text-yellow-400" : "text-gray-500"}>★</span>
				</button>
			))}
		</div>
	);
};

const MapCard = ({
	map,
	onRatingChange,
	isAuthenticated,
}: {
	map: MapData;
	onRatingChange: () => void;
	isAuthenticated: boolean;
}) => {
	const [ratingData, setRatingData] = useState<RatingData | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		fetchRating();
	}, [map.id]);

	const fetchRating = async () => {
		try {
			const token = localStorage.getItem("token");
			const isAuth = token !== null;

			// Use public endpoint if not authenticated, protected endpoint if authenticated
			const url = isAuth
				? `${API_URL}/api/maps/${map.id}/rating`
				: `${API_URL}/api/public/maps/${map.id}/rating`;

			const headers: Record<string, string> = {};
			if (isAuth) {
				headers.Authorization = `Bearer ${token}`;
			}

			const response = await fetch(url, { headers });
			if (response.ok) {
				const data = await response.json();
				setRatingData(data.data);
			}
		} catch (error) {
			console.error("Error fetching rating:", error);
		}
	};

	const handleRate = async (value: number) => {
		if (!isAuthenticated) return;
		setLoading(true);
		try {
			const token = localStorage.getItem("token");
			const response = await fetch(`${API_URL}/api/maps/${map.id}/rate`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ value }),
			});

			if (response.ok) {
				await fetchRating();
				onRatingChange();
			}
		} catch (error) {
			console.error("Error rating map:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="card bg-base-100 shadow-xl">
			<div className="card-body">
				<h2 className="card-title">{map.title}</h2>
				<p className="text-sm text-gray-500">by {map.user?.username || "Unknown"}</p>
				<p className="text-sm">{map.description || "No description"}</p>

				<div className="flex items-center gap-2 mt-2">
					{isAuthenticated ? (
						<StarRating rating={ratingData?.userRating || 0} onRate={handleRate} interactive={!loading} />
					) : (
						<StarRating rating={ratingData?.average || 0} interactive={false} />
					)}
					<span className="text-sm text-gray-500">
						{ratingData?.average.toFixed(1) || "0"} ({ratingData?.count || 0} ratings)
					</span>
				</div>

				{!isAuthenticated && (
					<Link to="/login" className="text-xs text-primary hover:underline">
						Login to rate this map
					</Link>
				)}

				<div className="card-actions justify-end mt-4">
					<Link to={`/editor?load=${map.id}`} className="btn btn-primary btn-sm">
						View Map
					</Link>
				</div>
			</div>
		</div>
	);
};

const Community = () => {
	const [maps, setMaps] = useState<MapData[]>([]);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();
	const isAuthenticated = localStorage.getItem("token") !== null;

	useEffect(() => {
		fetchPublicMaps();
	}, []);

	const fetchPublicMaps = async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem("token");
			const isAuth = token !== null;

			// Use public endpoint if not authenticated
			const url = isAuth ? `${API_URL}/api/maps` : `${API_URL}/api/public/maps`;

			const headers: Record<string, string> = {};
			if (isAuth) {
				headers.Authorization = `Bearer ${token}`;
			}

			const response = await fetch(url, { headers });

			if (!response.ok) {
				throw new Error("Failed to fetch maps");
			}

			const data = await response.json();
			// Filter to only show public maps (for authenticated users who also see their own)
			const publicMaps = (data.data || []).filter((map: MapData) => map.isPublic);
			setMaps(publicMaps);
		} catch (error) {
			console.error("Error fetching maps:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		navigate("/");
	};

	return (
		<div className="min-h-screen bg-base-200">
			{/* Navbar */}
			<div className="navbar bg-base-100 shadow-lg">
				<div className="flex-1">
					<Link to="/" className="btn btn-ghost text-xl">
						IsoEdit
					</Link>
				</div>
				<div className="flex-none gap-2">
					{isAuthenticated ? (
						<>
							<Link to="/editor" className="btn btn-primary btn-sm">
								Open Editor
							</Link>
							<button className="btn btn-outline btn-sm" onClick={handleLogout}>
								Logout
							</button>
						</>
					) : (
						<>
							<Link to="/login" className="btn btn-primary btn-sm">
								Login
							</Link>
							<Link to="/signup" className="btn btn-outline btn-sm">
								Sign Up
							</Link>
						</>
					)}
				</div>
			</div>

			{/* Content */}
			<div className="container mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold mb-2">Community Maps</h1>
				<p className="text-gray-500 mb-6">Browse and rate maps shared by the community</p>

				{loading ? (
					<div className="flex justify-center py-12">
						<span className="loading loading-spinner loading-lg"></span>
					</div>
				) : maps.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-lg">No public maps yet</p>
						<p className="text-gray-500">Be the first to share a map!</p>
						<Link to="/editor" className="btn btn-primary mt-4">
							Create a Map
						</Link>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{maps.map((map) => (
							<MapCard key={map.id} map={map} onRatingChange={fetchPublicMaps} isAuthenticated={isAuthenticated} />
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default Community;
