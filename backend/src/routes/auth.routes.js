import express from "express"
import { register,login,logout,check } from "../controllers/auth.controller.js"
import { authMiddleware } from "../middleware/middleware.js"

const authRoute = express.Router()

authRoute.post("/register",register)

authRoute.post("/login",login)

authRoute.post("/logout",authMiddleware,logout)

authRoute.get("/check",authMiddleware,check)

export default authRoute;