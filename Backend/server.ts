import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import compression from "compression";

import router from "./routes/payment.routes.ts";
import mongoDB from "./config/mongoDB.ts";

import { errorHandler } from "./middlewares/errorHandler.ts"; 

dotenv.config();
const app = express();

app.use(morgan("dev"));

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(compression());
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

mongoDB();

app.use(errorHandler); 

app.listen(5000, () => console.log("🚀 Payment Server running at http://localhost:5000 ✔"));