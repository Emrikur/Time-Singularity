import { queryGraphData, queryTimesheetEntriesByMonth, queryTimesheetMonthByName } from "../../services/dbCalls";
import { Request, Response } from "express";
import { isValidDate } from "../validation";



//##############################################################################


export async function getGraphsData(req: Request, res: Response) {
  const allowedFilter = ["week", "month", "year"];
  type Filter = "week" | "month" | "year";
  if (!allowedFilter.includes(req.params.filterCat)) {
    return res.status(400).send("Invalid Filter");
  }
  const userId = req.userId;
  const filter = req.params.filterCat as Filter;

  try {
    const data = await queryGraphData(userId, filter);
    res.json({ data });
  } catch (error) {
    console.error("Error fetching graph data: ", error);
    res.status(500).json({ success: false, message: "Could not fetch graph data" });
  }
}



//##############################################################################



export async function getAllTimeData(req: Request, res: Response) {

  const userId = req.userId;
  const filter = req.params.filterCategory;

  if (!isValidDate(filter)) {
    return res.status(400).json({ success: false, message: "Invalid month" });
  }

  try {
    const data = await queryTimesheetEntriesByMonth(userId, filter);
    res.json({ data });
  } catch (error) {
    console.error("Error fetching entries by month: ", error);
    res.status(500).json({ success: false, message: "Could not fetch entries" });
  }
}



// Hämtar månader från entries med draft (För select-options)
export async function getdraftMonths(req: Request, res: Response) {

  const userId = req.userId;

  try {
    const data = await queryTimesheetMonthByName(userId);
    res.json({ data });
  } catch (error) {
    console.error("Error fetching draft months: ", error);
    res.status(500).json({ success: false, message: "Could not fetch months" });
  }
}
