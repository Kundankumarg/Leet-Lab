import jwt from "jsonwebtoken";
import { db } from "../libs/db.js";


export const authMiddleware = async (req, res, next) => {

    try {
        const token = req.cookies.jwt || req.cookies.token;

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized-No token provided"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );


        const user = await db.user.findUnique({
            where: {
                id: decoded.id
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                image: true
            }
        });

        if (!user) {
            return res.status(401).json({
                message: "Unauthorized-User not found"
            });
        }
        req.user = user;
        next();


    } catch (error) {
        console.error("Error authenticating token:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }

};


export const checkAdmin = async (req, res, next) => {

    try {
        const userId = req.user.id;
        const user = await db.user.findUnique({
            where: {
                id: userId
            },
            select: {
                role: true
            }
        })

        if (!user || user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Access denied-Admin role required"
            })
        }

        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}