require("dotenv").config({ quiet: true });
import express from "express";
import { taskRouter } from "./routes/task.route";
import { globalErrorHandler } from "./controllers/error.controller";
import AppError from "./lib/AppError";
import { userRouter } from "./routes/user.route";
import { workspaceRouter } from "./routes/workspace.route";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import cookieParser from 'cookie-parser';

const app = express();

const limiter = rateLimit({
	windowMs: 60 * 60 * 1000,
	limit: 200,
	message: "Too many request from this IP Address, Please try again in an hour!",
});

// Helemt sets HTTP security headers
app.use(helmet());
app.use(cors());
app.use("/api", limiter);
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  //   console.log(req.cookies);
  next();
});

// Resouces Routing
app.use("/api/v1/task", taskRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/workspace", workspaceRouter);

app.get('/{*splat/}', async (req, res, next) => {
  next(new AppError(`can't find the ${req.originalUrl} on the this server`, 404));
});

app.use(globalErrorHandler);

export default app;
