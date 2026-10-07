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

// bcrypt-hash av ett slumpat värde, används när e-posten inte finns
const DUMMY_HASH = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8.Ah3x8V0dHcQkY1t3dIXX0tGgG1Ce";

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

  if (!DB_URL || !env.JWT_SECRET) {
    console.error("Database url or JWT secret is not set in the env-file");
    return res
      .status(500)
      .json({ success: false, message: "Server configuration error" });
  }

  // Validera innan något används, så att saknade fält inte kraschar servern
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    email.trim() === "" ||
    password.trim() === ""
  ) {
    return res.status(400).json({
      success: false,
      message: "email and password are required",
    });
  }

  try {
    //Get user which match with email and check if it validates
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email.trim().toLowerCase(),
    ]);
    const user = result.rows[0];

    // Jämför alltid mot en hash så att svarstiden inte avslöjar om e-posten finns
    const passwordIsValid = await bcrypt.compare(
      password,
      user ? user.password_hash : DUMMY_HASH,
    );

    // Samma generiska meddelande oavsett om e-posten eller lösenordet är fel
    if (!user || !passwordIsValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        avatar: user.avatar
      },
      env.JWT_SECRET,
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
    console.error("Login failed: ", err);
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
