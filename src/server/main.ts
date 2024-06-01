import express from "express";
import ViteExpress from "vite-express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import { MONGO_URI } from "./constant";

import { router as UserRouter } from "./routers/user";

const app = express();
app.use(bodyParser.json());

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

app.get("/api/health", (_, res) => {
  res.send("Hello Vite + React + TypeScript!");
});
app.use("/api/user", UserRouter);

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);
