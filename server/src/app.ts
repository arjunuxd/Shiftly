import express from "express";
import { corsMiddleware } from "./middleware/cors.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/errorHandler.js";
import routes from "./routes/index.js";

const app = express();

app.use(express.json());
app.use(corsMiddleware);

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
