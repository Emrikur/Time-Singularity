import { Router } from "express";
import { getCompanies} from "../controllers/modalcontroller";
import { addEntry} from "../controllers/modalcontroller";
import authMiddleware from "../middleware/authMiddleware"
import { blockGuest } from "../middleware/blockGuest";

const router = Router();

router.get("/companies", authMiddleware, getCompanies)
router.post("/create", authMiddleware, blockGuest, addEntry)



export default router
