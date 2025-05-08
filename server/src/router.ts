import { Router } from "express";
import { createMap, deleteMap, getMap, getMaps, updateMap } from "./handlers/map";

const router = Router();

// Maps routes
router.get("/maps", getMaps);
router.get("/maps/:id", getMap);
router.post("/maps", createMap);
router.put("/maps/:id", updateMap);
router.delete("/maps/:id", deleteMap);

export default router;
