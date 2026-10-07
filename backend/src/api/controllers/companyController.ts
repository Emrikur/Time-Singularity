import {  queryCompanyHours,querySpecificCompanyData } from "../../services/dbCalls";
import { isUuid } from "../validation";



//##############################################################################



import { Request, Response } from "express";

export async function getCompanies(req: Request, res: Response) {
  const userId = req.userId;

  if (!isUuid(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid company" });
  }

  try {
    const data = await querySpecificCompanyData(req.params.id, userId);
    res.json(data);
  } catch (error) {
    console.error("Error fetching company: ", error);
    res.status(500).json({ success: false, message: "Could not fetch company" });
  }
}
export async function getCompanyHours(req: Request, res: Response) {
  const userId = req.userId;

  try {
    const data = await queryCompanyHours(userId);
    res.json(data);
  } catch (error) {
    console.error("Error fetching company hours: ", error);
    res.status(500).json({ success: false, message: "Could not fetch hours" });
  }
}



//##############################################################################
