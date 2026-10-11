import { queryCompanyStatistics, queryStatisticsEntries } from "../../services/dbCalls";
import { Request, Response } from "express";



//##############################################################################



export async function getStatisticsEntries(req: Request, res: Response) {
  const userId = req.userId;

  try {
    const data = await queryStatisticsEntries(userId);
    res.json(data);
  } catch (error) {
    console.error("Error fetching statistics entries: ", error);
    res.status(500).json({ success: false, message: "Could not fetch statistics" });
  }
}



//##############################################################################



export async function getCompanyStatistics(req: Request, res: Response) {
  const userId = req.userId;

  try {
    const data = await queryCompanyStatistics(userId);
    res.json(data);
  } catch (error) {
    console.error("Error fetching company statistics: ", error);
    res.status(500).json({ success: false, message: "Could not fetch company statistics" });
  }
}
