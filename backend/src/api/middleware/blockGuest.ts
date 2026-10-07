//BlockGuest-Middleware stoppar gästkontot från att ändra eller ta bort data.
//Frontend inaktiverar knapparna, men backend får aldrig lita på det.

import { Request, Response, NextFunction } from "express";

const GUEST_EMAIL = "guest@ts.com";

export function blockGuest(req: Request, res: Response, next: NextFunction) {
  if (req.userEmail?.toLowerCase() === GUEST_EMAIL) {
    return res.status(403).json({ success: false, message: "Guest account cannot modify data" });
  }
  next();
}
