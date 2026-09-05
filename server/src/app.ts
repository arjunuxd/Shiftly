import express from "express";
import { corsMiddleware } from "./middleware/cors.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/errorHandler.js";
import { rateLimit } from "./middleware/rateLimit.js";
import routes from "./routes/index.js";

const app = express();

app.use(express.json({ limit: "2mb" }));
app.use(corsMiddleware);

app.use("/api", rateLimit({ windowMs: 60_000, max: 300, keyPrefix: "global" }));

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
