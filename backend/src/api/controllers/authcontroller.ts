import pool from "../../db";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();
import { getEnv } from "../../config/env";
import { Response } from "express";

interface Request {
  body: {
    email: string;
    password: string;
    userId: string;
  };
}
type LoginResponse =
  | {
      success: true;
      message: string;
      token: string;
      full_name: string;
      email: string;
      role: string;
      avatar: string;
    }
  | { success: false; message: string };



//##############################################################################



export const login = async (req: Request, res: Response<LoginResponse>) => {
  const env = getEnv();
  const { email, password } = req.body;
  const DB_URL = env.DATABASE_URL;

  try {
    //Get user which match with email and check if it validates
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email.toLocaleLowerCase(),
    ]);
    const user = result.rows[0];

    if (!DB_URL) {
      console.error("Database url is not set in the env-file");
      return res
        .status(500)
        .json({ success: false, message: "Server configuration error" });
    }

    if (!email || !password || email.trim() === "" || password.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "email and password are required",
      });
    }

    try {
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid email or password" });
      }
      const passwordIsValid = await bcrypt.compare(password, user.password_hash);

      if (!passwordIsValid) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }

      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          avatar: user.avatar
        },
        env.JWT_SECRET!,
        { expiresIn: "12h" },
      );
      res.json({
        token: token,
        message: `Hello ${user.full_name}, redirecting`,
        full_name: user.full_name,
        success: true,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      });
    } catch (err) {
      console.log("Database call failed:", err);
      res.json({success:false, message:""})
    }
  } catch (err) {
    console.error("DB error: ", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to connect to API" });
  }
};



//##############################################################################



export const logout = (req: Request, res: Response) => {
  if (!req.body.email || req.body.email.trim() === "") {
    return res.status(400).json({
      success: false,
      email: "",
      token: "",
      message: "email is required for logout",
    });
  } else {
    console.log("Logout request received", req.body);

    //TODO: Clear session data and tokens on logout

    res.json({
      success: true,
      email: req.body.email,
      token: "",
      message: "Logout successful",
    });
  }
};



//##############################################################################
