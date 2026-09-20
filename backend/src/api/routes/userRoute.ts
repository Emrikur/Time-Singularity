import { Router } from "express";
import {getUserEntries, updateAvatarController, updatePasswordController, deleteUserEntries, updateUserEntry, signoff, getAllTimesheets} from "../controllers/usercontroller";
import authMiddleware from "../middleware/authMiddleware"

const router = Router();

router.put("/change-password", authMiddleware, updatePasswordController)
router.put("/avatar", authMiddleware, updateAvatarController)
router.get("/timesheet/draft-entries", authMiddleware, getUserEntries)
router.delete("/timesheet/deleteEntry", authMiddleware, deleteUserEntries)
router.put("/timesheet/updateEntry", authMiddleware, updateUserEntry)
router.post("/timesheet/signoff", authMiddleware, signoff)
router.get("/timesheet/fetch", authMiddleware, getAllTimesheets)

export default router
