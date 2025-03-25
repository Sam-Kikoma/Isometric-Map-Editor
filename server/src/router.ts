import { Router } from "express";

const router = Router();

// Maps
router.get("/maps", (req, res) => {
	res.json({ data: "List of all maps" });
});

router.get("/maps/:id", (req, res) => {
	res.json({ data: "One map" });
});

router.post("/maps", (req, res) => {
	res.json({ data: "Map created" });
});

router.put("/maps/:id", (req, res) => {
	res.json({ data: "Map edited" });
});

export default router;
