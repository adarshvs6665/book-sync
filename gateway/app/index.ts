import cors from "cors";
import express, { Request, Response, type Express } from "express";
import proxy from "express-http-proxy";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", proxy("http://localhost:5000"));
app.use("/books", proxy("http://localhost:5001"));
app.use("/borrow", proxy("http://localhost:5002"));

app.listen(8000, () => {
  console.log("Gateway is Listening to Port 8000");
});
