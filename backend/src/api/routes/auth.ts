import { logout, login } from "../controllers/authcontroller";
import { Router } from "express";
import { loginLimiter } from "../middleware/rateLimiters";
const router = Router();


router.post("/login", loginLimiter, login);
router.post("/logout", /* authMiddleware, */ logout);
export default router;
