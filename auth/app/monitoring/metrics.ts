import { NextFunction, Request, Response } from "express";
import client from "prom-client";

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"] as const,
});

const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"] as const,
});

const activeUsersGauge = new client.Gauge({
  name: "active_users_total",
  help: "Total number of active users",
  labelNames: ["status"],
});

const httpResponseCounter = new client.Counter({
  name: "http_response_codes_total",
  help: "Total number of HTTP responses by status code",
  labelNames: ["status_code"],
});

client.collectDefaultMetrics();

export const requestMetricsCaptureMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const end = httpRequestDuration.startTimer();

  res.on("finish", () => {
    end({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode,
    });

    httpResponseCounter.inc({ status_code: String(res.statusCode) });

    httpRequestCounter.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode,
    });
  });

  next();
};

export const exposeMetrics = async (
  req: Request,
  res: Response
): Promise<void> => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
};

export const activeUsersMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.path);
  if (req.method === "POST" && req.path === "/sign-in/") {
    activeUsersGauge.inc({ status: "active" });
  }

  if (req.method === "POST" && req.path === "/sign-out/") {
    activeUsersGauge.dec({ status: "active" });
  }

  next();
};
