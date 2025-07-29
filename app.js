import { configDotenv } from "dotenv";
configDotenv({ path: "./.env" });

import express from "express";
import cors from "cors";
import directoryRouter from "./Routes/directoryRouter.js";
import filesRouter from "./Routes/filesRouter.js";
import authRouter from "./Routes/authRouter.js";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/databaseConfig.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

try {
  const db = await connectDB();

  app.use("/", (req, res, next) => {
    req.db = db;
    next();
  });

  app.use("/", authRouter);
  app.use("/", directoryRouter);
  app.use("/", filesRouter);

  app.listen(5000, () => {
    console.log("Server started at port 5000");
  });
} catch (error) {}
