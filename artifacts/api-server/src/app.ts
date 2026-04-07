import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import path from "path";
import { createReadStream, existsSync } from "fs";
import router from "./routes";
import { logger } from "./lib/logger";
import { sessionMiddleware } from "./lib/auth";
import { authMiddleware } from "./middlewares/authMiddleware";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);
app.use(authMiddleware);

app.use("/api", router);

// Serve the Vite SPA in production
if (process.env.NODE_ENV === "production") {
  const staticDir = path.resolve(
    import.meta.dirname,
    "..",
    "..",
    "gelato-balancer",
    "dist",
    "public",
  );
  if (existsSync(staticDir)) {
    app.use(express.static(staticDir));
    app.get("/{*path}", (_req, res) => {
      const indexPath = path.join(staticDir, "index.html");
      const stream = createReadStream(indexPath);
      stream.pipe(res);
    });
  }
}

export default app;
