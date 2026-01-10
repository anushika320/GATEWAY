import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import UserRoute from "./Router/userRoute.js";
import gatepassRouter from "./Router/gatepassRouter.js";
import vehicleRecordRouter from "./Router/vehicleRecordRouter.js";

const port = 5000;
const app = express();
app.use(express.json());

// JWT Authentication Middleware
app.use((req, res, next) => {
  const tokenString = req.header("Authorization");
  if (tokenString) {
    const token = tokenString.startsWith("Bearer ")
      ? tokenString.slice(7)
      : tokenString;
    jwt.verify(
      token,
      process.env.JWT_KEY || "gate-pass-secret-key",
      (err, decoded) => {
        if (err) {
          console.log("JWT verify error:", err.message);
          return res
            .status(401)
            .json({ message: "Unauthorized access: invalid token" });
        }
        req.user = decoded;
        next();
      }
    );
  } else {
    req.user = null;
    next();
  }
});

app.use("/user", UserRoute);
app.use("/gatepass", gatepassRouter);
app.use("/vehicleRecord", vehicleRecordRouter);

mongoose.connect("mongodb://localhost:27017/gatePass").then(() => {
  console.log("Connected to MongoDB");
});

app.listen(port, () => {
  console.log(`The server is running on port ${port}`);
});
