import app from "./server";

app.get("/", (req, res) => {
	res.send("<h1>Live</h1>");
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
	console.log(`Live: ${PORT}`);
});
