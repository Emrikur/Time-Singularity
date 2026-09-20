import {queryAddNewUser, getAllUsers, queryAdminEntries, queryAdminTS, querySubmittedEntries, querySetTimesheetApproval, querySetTimesheetRejection, querySetTimesheetForEdit} from "../../services/dbCalls"
import { Request, Response } from "express";



//##############################################################################



export async function getAdminTS(req:Request, res:Response){
const data = await queryAdminTS()

console.log("Here is data in admincontroller: ", data)
res.json(data)
}



//##############################################################################


//GET ALL ENTRIES

export async function getPendingEntries(req:Request, res:Response){
const data = await queryAdminEntries()

console.log("Here is data in admincontroller: ", data)
res.json(data)
}



//##############################################################################



export async function getSubmittedEntries(req:Request, res:Response){
const data = await querySubmittedEntries()

console.log("Here is data in admincontroller: ", data)
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
   await queryAddNewUser( fullName, email, password, role, salary, status );
  res.json({ success: true, message: "User created successfully" });
}
}
