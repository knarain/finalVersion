import next from "next";
import http from "http";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

await app.prepare();

const server = http.createServer((req, res) => {
  handle(req, res);
});

server.listen(port, () => {
  console.log(`> Ready on http://localhost:${port}`);
});
