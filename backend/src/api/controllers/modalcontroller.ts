import { queryCompanyData, queryaddNewEntry, queryUserHasCompany } from "../../services/dbCalls";
import { Request, Response } from "express";



//##############################################################################



export async function getCompanies(req:Request, res:Response){
const userId = req.userId
const data = await queryCompanyData(userId)

res.json(data)
}
export async function addEntry(req:Request, res:Response){
    const userId = req.userId

  try {
    // Användaren får bara logga timmar på företag den är tilldelad
    const hasCompany = await queryUserHasCompany(userId, req.body.id)
    if (!hasCompany) {
      return res.status(403).json({ success: false, message: "Company not assigned to user" })
    }

    const data = await queryaddNewEntry(userId, req.body)
    res.json(data)
  } catch (error) {
    console.error("Error creating entry: ", error)
    res.status(500).json({ success: false, message: "Could not create entry" })
  }
}



//##############################################################################
