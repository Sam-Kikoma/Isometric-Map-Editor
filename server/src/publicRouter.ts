import { Router } from "express";
import { getPublicMaps, getPublicMapRating } from "./handlers/public";

const publicRouter = Router();

// Public routes - no authentication required
publicRouter.get("/maps", getPublicMaps);
publicRouter.get("/maps/:id/rating", getPublicMapRating);

export default publicRouter;
