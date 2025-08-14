import "./monitoring/instrumentations";
import { MongoDbConnection } from "./database/Connection";
import { globalErrorHandler } from "./middlewares/errorHandler";
import { app } from "./server";
import config from "config";

const host = config.get<string>("host");
const port = config.get<number>("port");
const environment = config.get<string>("environment");

app.use(globalErrorHandler);

MongoDbConnection.connect()
  .then(() => {
    const server = app.listen(port, () => {
      console.info(`Connected to Database`);
      console.info(
        `Server (${environment}) running on port http://${host}:${port}`
      );
    });

    const onCloseSignal = () => {
      console.info("sigint received, shutting down");
      server.close(() => {
        console.info("server closed");
        process.exit();
      });
      setTimeout(() => process.exit(1), 10000).unref();
    };

    process.on("SIGINT", onCloseSignal);
    process.on("SIGTERM", onCloseSignal);
  })
  .catch((e) => {
    console.error(e, "Failed to connect to database");
  });
