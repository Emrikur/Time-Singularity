import { queryCompanyData, queryaddNewEntry, queryUserHasCompany } from "../../services/dbCalls";
import { MAX_HOURS_PER_ENTRY, parseNumberInRange, validateEntry } from "../validation";
import { Request, Response } from "express";



//##############################################################################



export async function getCompanies(req:Request, res:Response){
const userId = req.userId

try {
  const data = await queryCompanyData(userId)
  res.json(data)
} catch (error) {
  console.error("Error fetching companies: ", error)
  res.status(500).json({ success: false, message: "Could not fetch companies" })
}
}
export async function addEntry(req:Request, res:Response){
    const userId = req.userId
    const { id, date, hours, description } = req.body

  const validationError = validateEntry({ companyId: id, date, hours, description })
  if (validationError) {
    return res.status(400).json({ success: false, message: validationError })
  }

  try {
    // Användaren får bara logga timmar på företag den är tilldelad
    const hasCompany = await queryUserHasCompany(userId, id)
    if (!hasCompany) {
      return res.status(403).json({ success: false, message: "Company not assigned to user" })
    }

    // Skickar bara vidare validerade fält, med decimalkomma normaliserat
    const data = await queryaddNewEntry(userId, {
      ...req.body,
      id,
      date,
      hours: String(parseNumberInRange(hours, 0.01, MAX_HOURS_PER_ENTRY)),
      description: description ?? "",
    })
    res.json(data)
  } catch (error) {
    console.error("Error creating entry: ", error)
    res.status(500).json({ success: false, message: "Could not create entry" })
  }
}



//##############################################################################
