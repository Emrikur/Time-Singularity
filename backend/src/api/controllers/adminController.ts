import {queryAddNewUser, queryEmailExists, queryAdminTS, querySubmittedEntries, querySetTimesheetApproval, querySetTimesheetRejection, querySetTimesheetForEdit, queryAllCompanies, queryAssignUserCompanies} from "../../services/dbCalls"
import { ALLOWED_ROLES, isEmail, isUuid, isValidPassword, parseNumberInRange } from "../validation";
import { Request, Response } from "express";



//##############################################################################



export async function getAdminTS(req:Request, res:Response){
try {
  const data = await queryAdminTS()
  res.json(data)
} catch (error) {
  console.error("Error fetching pending timesheets: ", error);
  res.status(500).json({ success: false, message: "Could not fetch timesheets" });
}
}



//##############################################################################


export async function getSubmittedEntries(req:Request, res:Response){
try {
  const data = await querySubmittedEntries()
  res.json(data)
} catch (error) {
  console.error("Error fetching submitted entries: ", error);
  res.status(500).json({ success: false, message: "Could not fetch entries" });
}
}



//##############################################################################



const TIMESHEET_ACTIONS = {
  approve: querySetTimesheetApproval,
  reject: querySetTimesheetRejection,
  edit: querySetTimesheetForEdit,
};

export async function setTimesheetApproval(req:Request, res:Response){
const { timesheetId, action } = req.body;

if (!isUuid(timesheetId)) {
  return res.status(400).json({ success: false, message: "Invalid timesheet" });
}
if (!Object.prototype.hasOwnProperty.call(TIMESHEET_ACTIONS, action)) {
  return res.status(400).json({ success: false, message: "Invalid action" });
}

try {
  const response = await TIMESHEET_ACTIONS[action as keyof typeof TIMESHEET_ACTIONS](timesheetId);
  res.json(response)
} catch (error) {
  if (error instanceof Error && error.message === "Timesheet not found") {
    return res.status(400).json({ success: false, message: "Timesheet not found" });
  }
  console.error("Error updating timesheet status: ", error);
  res.status(500).json({ success: false, message: "Could not update timesheet" });
}
}



//##############################################################################



const MAX_NAME_LENGTH = 100;
const MAX_HOURLY_RATE = 10000;
const MAX_COMPANIES_PER_REQUEST = 100;

// Returnerar en unik lista med företags-id, eller null om listan är ogiltig
function parseCompanyIds(companyIds: unknown, allowEmpty: boolean) {
  if (companyIds === undefined && allowEmpty) return [];
  if (
    !Array.isArray(companyIds) ||
    (!allowEmpty && companyIds.length === 0) ||
    companyIds.length > MAX_COMPANIES_PER_REQUEST ||
    !companyIds.every(isUuid)
  ) {
    return null;
  }
  return [...new Set(companyIds as string[])];
}

export async function addNewUser(req:Request, res:Response){
const { fullName, email, password, role, salary, status } = req.body;

if (typeof fullName !== "string" || fullName.trim() === "" || fullName.length > MAX_NAME_LENGTH) {
  return res.status(400).json({ success: false, message: "Name is required (max 100 characters)" });
}
if (!isEmail(email)) {
  return res.status(400).json({ success: false, message: "Invalid email" });
}
if (!isValidPassword(password)) {
  return res.status(400).json({ success: false, message: "Password must be 8-72 characters" });
}
if (!ALLOWED_ROLES.includes(role)) {
  return res.status(400).json({ success: false, message: "Invalid role" });
}
const hourlyRate = parseNumberInRange(salary, 0, MAX_HOURLY_RATE);
if (hourlyRate === null) {
  return res.status(400).json({ success: false, message: "Invalid hourly rate" });
}
if (typeof status !== "boolean") {
  return res.status(400).json({ success: false, message: "Invalid status" });
}
const companyIds = parseCompanyIds(req.body.companyIds, true);
if (companyIds === null) {
  return res.status(400).json({ success: false, message: "Invalid company list" });
}

try {
  const normalizedEmail = email.trim().toLowerCase();
  if (await queryEmailExists(normalizedEmail)) {
    return res.json({ success: false, message: "Email already exists" });
  }

  const userId = await queryAddNewUser(fullName.trim(), normalizedEmail, password, role, hourlyRate, status, companyIds);
  res.json({ success: true, message: "User created successfully", userId });
} catch (error) {
  console.error("Error creating user: ", error);
  res.status(500).json({ success: false, message: "Could not create user" });
}
}



//##############################################################################



export async function getAllCompanies(req:Request, res:Response){
try {
  const data = await queryAllCompanies()
  res.json(data)
} catch (error) {
  console.error("Error fetching companies: ", error);
  res.status(500).json({ success: false, message: "Could not fetch companies" });
}
}



//##############################################################################



// Målanvändaren kommer från URL:en (admin agerar på en annan användare),
// den inloggade adminens id kommer alltid från token via authMiddleware.
export async function assignUserCompanies(req:Request, res:Response){
const targetUserId = req.params.id;

if (!isUuid(targetUserId)) {
  return res.status(400).json({ success: false, message: "Invalid user id" });
}

const companyIds = parseCompanyIds(req.body.companyIds, false);
if (companyIds === null) {
  return res.status(400).json({ success: false, message: "Invalid company list" });
}

try {
  const response = await queryAssignUserCompanies(targetUserId, companyIds);
  res.json(response);
} catch (error) {
  if (error instanceof Error && error.message === "User not found") {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  console.error("Error assigning companies to user");
  res.status(500).json({ success: false, message: "Could not assign companies" });
}
}
