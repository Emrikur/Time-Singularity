import {queryDraftEntriesByUser, queryupdateAvatar, queryupdatePassword, querydeleteSingleEntry, querySignoff, queryTimesheets, queryUpdateDraftEntry, queryUserTimesheetEntries, queryUserHasCompany } from "../../services/dbCalls";
import { isAvatarName, isUuid, isValidDate, isValidPassword, MAX_HOURS_PER_ENTRY, parseNumberInRange, validateEntry } from "../validation";



//##############################################################################



import { Request, Response } from "express";

export async function updatePasswordController(req: Request, res: Response) {
//? id from my authcontroller, which is added from the authMiddleware.

  const id = req.userId;
  const {current_password, new_password} = req.body;

  if (typeof current_password !== "string" || current_password === "") {
    return res.status(400).json({ success: false, message: "Current password is required" });
  }
  if (!isValidPassword(new_password)) {
    return res.status(400).json({ success: false, message: "New password must be 8-72 characters" });
  }

  try {
    const data = await queryupdatePassword(id, current_password, new_password);
    res.json(data);
  } catch (error) {
    console.error("Error changing password: ", error);
    res.status(500).json({ success: false, message: "Could not change password" });
  }
}



//##############################################################################



export async function updateAvatarController(req: Request, res: Response) {
const {avatarURL} = req.body;

// Avatar är ett filnamn i /avatars, inte en URL
if (!isAvatarName(avatarURL)) {
  return res.status(400).json({ success: false, message: "Invalid avatar" });
}

try {
  const data = await queryupdateAvatar(req.userId, avatarURL);
  res.json(data)
} catch (error) {
  console.error("Error updating avatar: ", error);
  res.status(500).json({ success: false, message: "Could not update avatar" });
}

}


// get the user time entries for timesheet display
export async function getUserEntries(req: Request, res: Response) {
const id = req.userId;

try {
  const data = await queryDraftEntriesByUser(id);
  res.json(data)
} catch (error) {
  console.error("Error fetching draft entries: ", error);
  res.status(500).json({ success: false, message: "Could not fetch entries" });
}

}
export async function deleteUserEntries(req: Request, res: Response) {
const userId = req.userId;
const {entryID} = req.body;

if (!isUuid(entryID)) {
  return res.status(400).json({ success: false, message: "Invalid entry" });
}

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

  if (!isUuid(entryId)) {
    return res.status(400).json({ success: false, message: "Invalid entry" });
  }
  const validationError = validateEntry({ companyId, date, hours, description, mileage, expense });
  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  try {
    // Användaren får bara flytta en entry till ett företag den är tilldelad
    const hasCompany = await queryUserHasCompany(userId, companyId);
    if (!hasCompany) {
      return res.status(403).json({ success: false, message: "Company not assigned to user" });
    }

    // Normaliserar decimalkomma så att databasen får ett giltigt tal
    const normalize = (value: string | undefined) =>
      value === undefined || value === null || value === "" ? "" : String(value).trim().replace(",", ".");

    const data = await queryUpdateDraftEntry(userId, entryId, {
      companyId,
      date,
      hours: String(parseNumberInRange(hours, 0.01, MAX_HOURS_PER_ENTRY)),
      mileage: normalize(mileage),
      expense: normalize(expense),
      description: description ?? "",
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
const userId = req.userId;
const {signoffMonth} = req.body;

if (!isValidDate(signoffMonth)) {
  return res.status(400).json({ success: false, message: "Invalid month" });
}

try {
  const data = await querySignoff(userId,signoffMonth);
  res.json(data)
} catch (error) {
  console.error("Error signing off timesheet: ", error);
  res.status(500).json({ success: false, message: "Could not sign off timesheet" });
}

}
export async function getAllTimesheets(req: Request, res: Response) {
const userId = req.userId;

try {
  const data = await queryTimesheets(userId);
  res.json(data)
} catch (error) {
  console.error("Error fetching timesheets: ", error);
  res.status(500).json({ success: false, message: "Could not fetch timesheets" });
}

}

export async function getUserTimesheetEntries(req: Request, res: Response) {
  try {
    const data = await queryUserTimesheetEntries(req.userId);
    res.json(data);
  } catch (error) {
    console.error("Error fetching timesheet entries: ", error);
    res.status(500).json({ success: false, message: "Could not fetch entries" });
  }
}
