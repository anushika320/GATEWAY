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

app.use((req, res, next) => {
  const tokenString = req.header("Authorization");
  if (tokenString != null) {
    const token = tokenString.replace("Bearer ", "");
    jwt.verify(token, "gate-pass-secret-key", (err, decodedToken) => {
      if (decodedToken != null) {
        req.user = decodedToken;
        next();
      } else {
        res.status(401).json({
          message: "Unauthorized access",
        });
      }
    });
  } else {
    req.user = null; // Add this line to avoid undefined
    next();
  }
});
/*
app.use((req,res,next)=>{
    const tokenString = req.header('Authorization');
    if(tokenString!= null){
        const token = tokenString.replace('Bearer ','');

        jwt.verify(token,"gate-pass-secret-key",
        (err,decodedToken)=>{
            if(decodedToken!= null){
                console.log(decodedToken);
                req.user = decodedToken;    
                next();
            }
            else{
                console.log("invalid token");
                res.status(401).json({
                    message:"Unauthorized access"
                })
            }
    })
    }
    
})
    */

// ...existing code...
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
// ...existing code...

app.use("/user", UserRoute);
app.use("/gatepass", gatepassRouter);
app.use("/vehicleRecord", vehicleRecordRouter);

mongoose.connect("mongodb://localhost:27017/gatePass").then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.log("Failed to connect to MongoDB", err.message);
});

app.listen(port, () => {
  console.log(`The server is running on port ${port}`);
});
