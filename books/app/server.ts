import cors from "cors";
import express, { Request, Response, type Express } from "express";
import { ResponseHelper } from "./utils/ResponseHelper";
import { bookRouter } from "./routers/bookRoutes";
import { exposeMetrics, requestMetricsCaptureMiddleware } from "./monitoring";

const app: Express = express();

app.use(express.json());
app.use(cors());
app.use(requestMetricsCaptureMiddleware);
app.get("/metrics", exposeMetrics);

app.get("/health-check", (_req: Request, res: Response) => {
  ResponseHelper.handleSuccess(res, "healthy");
});

app.use("/", bookRouter);

export { app };
