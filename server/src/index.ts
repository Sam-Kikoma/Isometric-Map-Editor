import app from "./server";

app.get("/", (req, res) => {
	res.send("<h1>Live</h1>");
});

app.listen(3001, () => {
	console.log("Live: 3001");
});
