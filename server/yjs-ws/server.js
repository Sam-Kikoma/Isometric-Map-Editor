const http = require("http");
const WebSocket = require("ws");
const { setupWSConnection } = require("y-websocket/bin/utils");

const port = process.env.PORT || 1234;
const host = process.env.HOST || "0.0.0.0";

const server = http.createServer((req, res) => {
	res.writeHead(200, { "Content-Type": "text/plain" });
	res.end("yjs-ws OK");
});

const wss = new WebSocket.Server({ noServer: true });

server.on("upgrade", (request, socket, head) => {
	wss.handleUpgrade(request, socket, head, (ws) => {
		setupWSConnection(ws, request);
	});
});

server.listen(port, host, () => {
	console.log(`yjs websocket server running on ws://${host}:${port}`);
});
