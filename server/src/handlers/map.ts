import prisma from "../db";

/**
 * Handler to get all maps (public and owned by user)
 */
export const getMaps = async (req, res) => {
	try {
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({ message: "Not authenticated" });
		}

		const maps = await prisma.map.findMany({
			where: {
				OR: [{ userId: userId }, { isPublic: true }],
			},
			orderBy: {
				updatedAt: "desc",
			},
		});

		res.json({ data: maps });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error retrieving maps" });
	}
};

/**
 * Handler to get a specific map by ID
 */
export const getMap = async (req, res) => {
	try {
		const mapId = req.params.id;
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({ message: "Not authenticated" });
		}

		const map = await prisma.map.findUnique({
			where: {
				id: mapId,
			},
		});

		if (!map) {
			return res.status(404).json({ message: "Map not found" });
		}

		// Only allow access if the map is public or belongs to the user
		if (!map.isPublic && map.userId !== userId) {
			return res.status(403).json({ message: "Not authorized to access this map" });
		}

		res.json({ data: map });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error retrieving map" });
	}
};

/**
 * Handler to create a new map
 */
export const createMap = async (req, res) => {
	try {
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({ message: "Not authenticated" });
		}

		const { title, description, isPublic, data } = req.body;

		if (!title) {
			return res.status(400).json({ message: "Title is required" });
		}

		const map = await prisma.map.create({
			data: {
				title,
				description: description || "",
				isPublic: isPublic !== undefined ? isPublic : true,
				data: data || {},
				userId,
			},
		});

		res.status(201).json({ data: map });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error creating map" });
	}
};

/**
 * Handler to update an existing map
 */
export const updateMap = async (req, res) => {
	try {
		const mapId = req.params.id;
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({ message: "Not authenticated" });
		}

		const { title, description, isPublic, data } = req.body;

		// First, check if the map exists and belongs to the user
		const existingMap = await prisma.map.findUnique({
			where: {
				id: mapId,
			},
		});

		if (!existingMap) {
			return res.status(404).json({ message: "Map not found" });
		}

		if (existingMap.userId !== userId) {
			return res.status(403).json({ message: "Not authorized to edit this map" });
		}

		// Update the map
		const updatedMap = await prisma.map.update({
			where: {
				id: mapId,
			},
			data: {
				title: title !== undefined ? title : existingMap.title,
				description: description !== undefined ? description : existingMap.description,
				isPublic: isPublic !== undefined ? isPublic : existingMap.isPublic,
				data: data !== undefined ? data : existingMap.data,
			},
		});

		res.json({ data: updatedMap });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error updating map" });
	}
};

/**
 * Handler to delete a map
 */
export const deleteMap = async (req, res) => {
	try {
		const mapId = req.params.id;
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({ message: "Not authenticated" });
		}

		// First, check if the map exists and belongs to the user
		const existingMap = await prisma.map.findUnique({
			where: {
				id: mapId,
			},
		});

		if (!existingMap) {
			return res.status(404).json({ message: "Map not found" });
		}

		if (existingMap.userId !== userId) {
			return res.status(403).json({ message: "Not authorized to delete this map" });
		}

		// Delete the map
		await prisma.map.delete({
			where: {
				id: mapId,
			},
		});

		res.status(200).json({ message: "Map deleted successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error deleting map" });
	}
};
