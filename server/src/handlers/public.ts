import prisma from "../db";

/**
 * Get all public maps (no authentication required)
 */
export const getPublicMaps = async (req, res) => {
	try {
		const maps = await prisma.map.findMany({
			where: {
				isPublic: true,
			},
			include: {
				user: {
					select: {
						username: true,
					},
				},
			},
			orderBy: {
				updatedAt: "desc",
			},
		});

		res.json({ data: maps });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error retrieving public maps" });
	}
};

/**
 * Get rating stats for a public map (no authentication required)
 */
export const getPublicMapRating = async (req, res) => {
	try {
		const mapId = req.params.id;

		// Verify map is public
		const map = await prisma.map.findUnique({
			where: { id: mapId },
		});

		if (!map) {
			return res.status(404).json({ message: "Map not found" });
		}

		if (!map.isPublic) {
			return res.status(403).json({ message: "Map is not public" });
		}

		// Get aggregate rating data
		const stats = await prisma.rating.aggregate({
			where: { mapId },
			_avg: { value: true },
			_count: { value: true },
		});

		res.json({
			data: {
				average: stats._avg.value ? Math.round(stats._avg.value * 10) / 10 : 0,
				count: stats._count.value,
				userRating: null, // No user rating for unauthenticated requests
			},
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error getting rating" });
	}
};
