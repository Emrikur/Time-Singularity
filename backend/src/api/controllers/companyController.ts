import {  queryCompanyHours,querySpecificCompanyData } from "../../services/dbCalls";



//##############################################################################



import { Request, Response } from "express";

export async function getCompanies(req: Request, res: Response) {
  const userId = req.userId;
  const data = await querySpecificCompanyData(req.params.id, userId);

  res.json(data);
}
export async function getCompanyHours(req: Request, res: Response) {
  const userId = req.userId;
  const data = await queryCompanyHours(userId);

  res.json(data);
}



//##############################################################################
