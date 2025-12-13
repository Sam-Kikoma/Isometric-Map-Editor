import express from "express";
import cors from "cors";
import router from "./router";
import publicRouter from "./publicRouter";
import { protect } from "./modules/auth";
import { createUser, signIn } from "./handlers/user";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public routes (no authentication required)
app.use("/api/public", publicRouter);

// Protected routes (authentication required)
app.use("/api", protect, router);

app.post("/user", createUser);
app.post("/signin", signIn);

export default app;
