import { Router } from "express";
import {getUserEntries, updateAvatarController, updatePasswordController, deleteUserEntries, updateUserEntry, signoff, getAllTimesheets, getUserTimesheetEntries} from "../controllers/usercontroller";
import authMiddleware from "../middleware/authMiddleware"
import { blockGuest } from "../middleware/blockGuest";

const router = Router();

router.put("/change-password", authMiddleware, blockGuest, updatePasswordController)
router.put("/avatar", authMiddleware, blockGuest, updateAvatarController)
router.get("/timesheet/draft-entries", authMiddleware, getUserEntries)
router.delete("/timesheet/deleteEntry", authMiddleware, blockGuest, deleteUserEntries)
router.put("/timesheet/updateEntry", authMiddleware, blockGuest, updateUserEntry)
router.post("/timesheet/signoff", authMiddleware, blockGuest, signoff)
router.get("/timesheet/fetch", authMiddleware, getAllTimesheets)
router.get("/timesheet/entries", authMiddleware, getUserTimesheetEntries)

export default router
