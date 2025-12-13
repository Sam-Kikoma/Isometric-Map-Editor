import { Router } from "express";
import { createMap, deleteMap, getMap, getMaps, updateMap } from "./handlers/map";
import { rateMap, getMapRating, deleteRating } from "./handlers/rating";

const router = Router();

// Maps routes
router.get("/maps", getMaps);
router.get("/maps/:id", getMap);
router.post("/maps", createMap);
router.put("/maps/:id", updateMap);
router.delete("/maps/:id", deleteMap);

// Rating routes
router.post("/maps/:id/rate", rateMap);
router.get("/maps/:id/rating", getMapRating);
router.delete("/maps/:id/rating", deleteRating);

export default router;
