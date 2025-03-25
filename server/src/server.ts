import express from "express";
import cors from "cors";
import router from "./router";

const app = express();
app.use(cors());

app.use("/api", router);

app.post("/user", (req, res) => {
	res.send("Create new user");
});
app.post("/signin", (req, res) => {
	res.send("Create new user");
});

export default app;
