import prisma from "../db";

/**
 * Create or update a rating for a map
 */
export const rateMap = async (req, res) => {
	try {
		const userId = req.user?.id;
		const mapId = req.params.id;
		const { value } = req.body;

		if (!userId) {
			return res.status(401).json({ message: "Not authenticated" });
		}

		// Validate rating value (1-5)
		if (!value || value < 1 || value > 5) {
			return res.status(400).json({ message: "Rating must be between 1 and 5" });
		}

		// Check if map exists and is public (can't rate your own private maps)
		const map = await prisma.map.findUnique({
			where: { id: mapId },
		});

		if (!map) {
			return res.status(404).json({ message: "Map not found" });
		}

		if (!map.isPublic && map.userId !== userId) {
			return res.status(403).json({ message: "Cannot rate a private map" });
		}

		// Upsert the rating (create or update)
		const rating = await prisma.rating.upsert({
			where: {
				userId_mapId: {
					userId,
					mapId,
				},
			},
			update: {
				value,
			},
			create: {
				value,
				userId,
				mapId,
			},
		});

		res.json({ data: rating });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error rating map" });
	}
};

/**
 * Get rating stats for a map (average and count)
 */
export const getMapRating = async (req, res) => {
	try {
		const mapId = req.params.id;
		const userId = req.user?.id;

		// Get aggregate rating data
		const stats = await prisma.rating.aggregate({
			where: { mapId },
			_avg: { value: true },
			_count: { value: true },
		});

		// Get user's own rating if logged in
		let userRating = null;
		if (userId) {
			const existing = await prisma.rating.findUnique({
				where: {
					userId_mapId: {
						userId,
						mapId,
					},
				},
			});
			userRating = existing?.value || null;
		}

		res.json({
			data: {
				average: stats._avg.value ? Math.round(stats._avg.value * 10) / 10 : 0,
				count: stats._count.value,
				userRating,
			},
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error getting rating" });
	}
};

/**
 * Delete user's rating for a map
 */
export const deleteRating = async (req, res) => {
	try {
		const userId = req.user?.id;
		const mapId = req.params.id;

		if (!userId) {
			return res.status(401).json({ message: "Not authenticated" });
		}

		await prisma.rating.delete({
			where: {
				userId_mapId: {
					userId,
					mapId,
				},
			},
		});

		res.json({ message: "Rating deleted" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error deleting rating" });
	}
};
