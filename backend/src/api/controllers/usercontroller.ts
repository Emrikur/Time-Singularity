import {queryDraftEntriesByUser, queryupdateAvatar, queryupdatePassword, querydeleteSingleEntry, querySignoff, queryTimesheets, queryUpdateDraftEntry, queryUserTimesheetEntries, queryUserHasCompany } from "../../services/dbCalls";



//##############################################################################



import { Request, Response } from "express";

export async function updatePasswordController(req: Request, res: Response) {
//? id from my authcontroller, which is added from the authMiddleware.

  const id = req.userId;
  const {current_password, new_password} = req.body;
  const data = await queryupdatePassword(id, current_password, new_password);

  res.json(data);
}



//##############################################################################



export async function updateAvatarController(req: Request, res: Response) {
const {avatarURL} = req.body;
// console.log("Request data: ",avatarURL)

const data = await queryupdateAvatar(req.userId, avatarURL);

res.json(data)

}


// get the user time entries for timesheet display
export async function getUserEntries(req: Request, res: Response) {
const id = req.userId;
// console.log("Request data: ",avatarURL)

const data = await queryDraftEntriesByUser(id);



res.json(data)

}
export async function deleteUserEntries(req: Request, res: Response) {
const userId = req.userId;
const {entryID} = req.body;

try {
  const data = await querydeleteSingleEntry(userId,entryID);
  res.json(data)
} catch (error) {
  if (error instanceof Error && error.message === "Draft entry not found") {
    return res.status(400).json({ success: false, message: "Only your own draft entries can be deleted" });
  }
  console.error("Error deleting entry: ", error);
  res.status(500).json({ success: false, message: "Could not delete entry" });
}

}

export async function updateUserEntry(req: Request, res: Response) {
  const userId = req.userId;
  const { entryId, companyId, date, hours, mileage, expense, description } = req.body;

  try {
    // Användaren får bara flytta en entry till ett företag den är tilldelad
    const hasCompany = await queryUserHasCompany(userId, companyId);
    if (!hasCompany) {
      return res.status(403).json({ success: false, message: "Company not assigned to user" });
    }

    const data = await queryUpdateDraftEntry(userId, entryId, {
      companyId,
      date,
      hours,
      mileage,
      expense,
      description,
    });

    res.json(data);
  } catch (error) {
    if (error instanceof Error && error.message === "Draft entry not found") {
      return res.status(400).json({ success: false, message: "Only your own draft entries can be edited" });
    }
    console.error("Error updating entry: ", error);
    res.status(500).json({ success: false, message: "Could not update entry" });
  }
}

export async function signoff(req: Request, res: Response) {
  console.log(req.body.signoffMonth)
const userId = req.userId;
const {signoffMonth} = req.body;
// console.log("THE USER ID: ",userId, "THE ENTRY ID: ",entryID)

const data = await querySignoff(userId,signoffMonth);



res.json(data)

}
export async function getAllTimesheets(req: Request, res: Response) {
  // console.log(req.body.signoffMonth)
const userId = req.userId;
// console.log("THE USER ID: ",userId, "THE ENTRY ID: ",entryID)

const data = await queryTimesheets(userId);



res.json(data)

}

export async function getUserTimesheetEntries(req: Request, res: Response) {
  const data = await queryUserTimesheetEntries(req.userId);

  res.json(data);
}
