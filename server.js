const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 4173);
const ROOT = __dirname;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};

function resolveRequestPath(urlPath) {
  const cleaned = decodeURIComponent(urlPath.split("?")[0]).replace(/^\/+/, "");
  const candidate = cleaned === "" ? "index.html" : cleaned;
  const fullPath = path.join(ROOT, candidate);
  const normalized = path.normalize(fullPath);

  if (!normalized.startsWith(ROOT)) {
    return null;
  }
  return normalized;
}

const server = http.createServer((req, res) => {
  const rawUrl = req.url || "/";
  const resolved = resolveRequestPath(rawUrl);
  if (!resolved) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad request");
    return;
  }

  fs.stat(resolved, (statErr, stats) => {
    if ((statErr || !stats.isFile()) && rawUrl.split("?")[0] === "/favicon.ico") {
      const svgFallback = path.join(ROOT, "favicon.svg");
      fs.stat(svgFallback, (fallbackErr, fallbackStats) => {
        if (fallbackErr || !fallbackStats.isFile()) {
          res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Not found");
          return;
        }
        res.writeHead(200, { "Content-Type": MIME[".svg"] });
        fs.createReadStream(svgFallback).pipe(res);
      });
      return;
    }

    if (statErr || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const ext = path.extname(resolved).toLowerCase();
    const contentType = MIME[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(resolved).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Personal homepage is running on http://localhost:${PORT}`);
});
