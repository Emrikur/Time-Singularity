import {queryAddNewUser, getAllUsers, queryAdminEntries, queryAdminTS, querySubmittedEntries, querySetTimesheetApproval, querySetTimesheetRejection, querySetTimesheetForEdit, queryAllCompanies, queryAssignUserCompanies} from "../../services/dbCalls"
import { Request, Response } from "express";



//##############################################################################



export async function getAdminTS(req:Request, res:Response){
const data = await queryAdminTS()

res.json(data)
}



//##############################################################################


//GET ALL ENTRIES

export async function getPendingEntries(req:Request, res:Response){
const data = await queryAdminEntries()

res.json(data)
}



//##############################################################################



export async function getSubmittedEntries(req:Request, res:Response){
const data = await querySubmittedEntries()

res.json(data)
}



//##############################################################################



export async function setTimesheetApproval(req:Request, res:Response){
const { timesheetId, action } = req.body;
if(action === "approve"){

 const response = await querySetTimesheetApproval(timesheetId);

 res.json(response)

}else if(action === "reject"){

  const response = await querySetTimesheetRejection(timesheetId);
res.json(response)

}else if(action === "edit"){

  const response = await querySetTimesheetForEdit(timesheetId);
  res.json(response)

}
}



export async function addNewUser(req:Request, res:Response){
const { fullName, email, password, role, salary, status } = req.body;

const checkUsers = await getAllUsers()
const emailExists = checkUsers.some((user: { email: string }) => user.email === email);
if (emailExists) {
  return res.json({ success: false, message: "Email already exists" });
}else{
  const newUser = await queryAddNewUser( fullName, email, password, role, salary, status );
  res.json({ success: true, message: "User created successfully", userId: newUser[0].id });
}
}



//##############################################################################



export async function getAllCompanies(req:Request, res:Response){
const data = await queryAllCompanies()
res.json(data)
}



//##############################################################################



const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_COMPANIES_PER_REQUEST = 100;

// Målanvändaren kommer från URL:en (admin agerar på en annan användare),
// den inloggade adminens id kommer alltid från token via authMiddleware.
export async function assignUserCompanies(req:Request, res:Response){
const targetUserId = req.params.id;
const { companyIds } = req.body;

if (typeof targetUserId !== "string" || !UUID_REGEX.test(targetUserId)) {
  return res.status(400).json({ success: false, message: "Invalid user id" });
}

if (
  !Array.isArray(companyIds) ||
  companyIds.length === 0 ||
  companyIds.length > MAX_COMPANIES_PER_REQUEST ||
  !companyIds.every((id: unknown) => typeof id === "string" && UUID_REGEX.test(id))
) {
  return res.status(400).json({ success: false, message: "Invalid company list" });
}

const uniqueCompanyIds = [...new Set(companyIds as string[])];

try {
  const response = await queryAssignUserCompanies(targetUserId, uniqueCompanyIds);
  res.json(response);
} catch (error) {
  if (error instanceof Error && error.message === "User not found") {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  console.error("Error assigning companies to user");
  res.status(500).json({ success: false, message: "Could not assign companies" });
}
}
