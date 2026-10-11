import { Router } from "express";
import { getCompanyStatistics, getStatisticsEntries } from "../controllers/statisticsController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

router.get("/entries", authMiddleware, getStatisticsEntries);
router.get("/companies", authMiddleware, getCompanyStatistics);

export default router;
