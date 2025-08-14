import cors from "cors";
import express, { Request, Response, type Express } from "express";
import { ResponseHelper } from "./utils/ResponseHelper";
import { authRouter } from "./routers/authRoutes";
import { activeUsersMiddleware, exposeMetrics, requestMetricsCaptureMiddleware } from "./monitoring";

const app: Express = express();

app.use(express.json());
app.use(cors());
app.use(requestMetricsCaptureMiddleware);
app.use(activeUsersMiddleware);
app.get("/metrics", exposeMetrics);

app.get("/health-check", (_req: Request, res: Response) => {
  ResponseHelper.handleSuccess(res, "healthy");
});

app.use("/", authRouter);

export { app };
