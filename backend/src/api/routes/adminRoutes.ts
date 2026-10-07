import { Router } from "express";
import {addNewUser, assignUserCompanies, getAdminTS, getAllCompanies, getPendingEntries, getSubmittedEntries, setTimesheetApproval} from "../controllers/adminController";
import authMiddleware from "../middleware/authMiddleware"
import { isAdmin } from "../middleware/idAdmin";

const router = Router();

router.get("/pendingtimesheet/fetch", authMiddleware, isAdmin, getAdminTS)
router.get("/pendingentries/fetch", authMiddleware, isAdmin, getPendingEntries)
router.get("/submittedentries/fetch", authMiddleware, isAdmin, getSubmittedEntries)
router.put("/timesheet/approval", authMiddleware, isAdmin, setTimesheetApproval)
router.post("/user/create", authMiddleware, isAdmin, addNewUser)
router.get("/companies/fetch", authMiddleware, isAdmin, getAllCompanies)
router.post("/user/:id/companies", authMiddleware, isAdmin, assignUserCompanies)



export default router
