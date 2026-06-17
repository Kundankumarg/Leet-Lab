import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoute from "./routes/auth.routes.js";



dotenv.config();

const app = express();
app.use(cookieParser());
app.use(express.json());



app.get("/", (req, res) => {
    res.json({ message: "Hello, World! ❤️" });
});

app.use("/api/v1/auth",authRoute);


app.listen(process.env.PORT,()=>{
    console.log("Server is running on port 8080");
})