import bcrypt from "bcryptjs";
import { db } from "../libs/db.js";
import { UserRole } from "../generated/prisma/index.js";
import jwt from "jsonwebtoken";



export const register = async (req, res) => {

    const { email, password, name } = req.body;

    try {

        if (!email || !password || !name) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        const existingUser = await db.user.findUnique({
            where: {
                email
            }
        })

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await db.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: UserRole.USER
            }
        })

        const token = jwt.sign(
            { id: newUser.id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "development",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
                image: newUser.image
            }
        })


    } catch (error) {
        console.error("Error in register user:", error);
        res.status(500).json({
            error: "register user failed"
        })


    }

}

export const login = async (req, res) => {
    const{email,password} = req.body;
    try {
        const user = await db.user.findUnique({
            where:{
                email
            }
        })

        if(!user){
                return res.status(400).json({
                    message:"User not found"
                })
        }

        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.status(400).json({
                message:"Invalid password"
            })
        }

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET, 
            { expiresIn: "7d" }
        );
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "development",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })

        res.status(200).json({
            success:true,
            message: "Login successful",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                image: user.image
            }
        })

    } catch (error) {
        console.error("Error creating user:",error);
        res.status(500).json({
            error:"Error login user"
        })
        
    }

}

export const logout = async (req, res) => {
    try{
        res.clearCookie("token",{
            httpOnly:true,
            sameSite:"strict",
            secure:process.env.NODE_ENV !== "development"
        })

        res.status(200).json({
            success:true,
            message:"Logout successful"
        })

    }catch(error){
        console.error("Error logging out user:",error);
        res.status(500).json({
            error:"Error logging out user"
        })
    }

}

export const check = async (req, res) => {
    try {
        const user = req.user;
        res.status(200).json({  
            success: true,
            user: {
                id: user.id,    
                email: user.email,
                name: user.name,
                role: user.role,        
                image: user.image
            },
            message: "User is authenticated"
        })
    } catch (error) {
        console.error("Error checking auth status:", error);
        res.status(500).json({
            error: "Error checking auth status"
        })
    }   
}
