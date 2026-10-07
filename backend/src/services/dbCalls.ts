import pool from "../db";
import type { EntryFormData } from "../../types/types";
import bcrypt from "bcrypt";


//##############################################################################



export async function queryGraphData(userId: string, filter: string) {

  try{

    const response = await pool.query(
        `SELECT time_entries.*, companies.name AS company_name
        FROM time_entries
        JOIN companies ON time_entries.company_id = companies.id
        WHERE time_entries.user_id = $1
        AND time_entries.work_date >= CASE $2
        WHEN 'week'  THEN DATE_TRUNC('week', NOW() AT TIME ZONE 'Europe/Stockholm')
        WHEN 'month' THEN DATE_TRUNC('month', NOW() AT TIME ZONE 'Europe/Stockholm')
        WHEN 'year'  THEN DATE_TRUNC('year', NOW() AT TIME ZONE 'Europe/Stockholm')
        END`,
        [userId, filter],
      );

      // console.log(response.rows)
      return response.rows;

  }catch(err){
    console.log(err)
    return console.log(err)
  }

}



//##############################################################################



// Returnerar endast företag som användaren är tilldelad via user_companies
export async function queryCompanyData(userId: string) {
  const response = await pool.query(
    `SELECT companies.name, companies.id, companies.is_active
     FROM companies
     JOIN user_companies ON user_companies.company_id = companies.id
     WHERE user_companies.user_id = $1
     ORDER BY companies.name ASC`,
    [userId],
  );
  return response.rows;
}



//##############################################################################



// Admin: alla företag, används vid tilldelning av företag till ny användare
export async function queryAllCompanies() {
  const response = await pool.query(
    `SELECT name, id, is_active FROM companies ORDER BY name ASC`,
  );
  return response.rows;
}



//##############################################################################



export async function queryCompanyHours(userId: string) {
  // console.log("User id in fetchCompanyHours: ", userId);
  const response = await pool.query(`SELECT hours_worked FROM time_entries WHERE user_id = $1`, [userId]);

  return response.rows;
}



//##############################################################################



export async function querySpecificCompanyData(companyId: string) {
  console.log("REQUEST ID IN DBCALLS: ",companyId)
  try {
    const response = await pool.query(`SELECT * FROM companies WHERE id = $1`, [companyId]);
    console.log("RESPONSE ROWS: ",response.rows)
    return response.rows;
  } catch (error) {
    console.error("Error fetching specific company data: ", error);
    throw error;
  }
}



//##############################################################################



export async function queryaddNewEntry(userId: string, EntryFormData: EntryFormData) {
  console.log("User id: ", userId);
  console.log("Form data: ", EntryFormData);

        await pool.query(
         `INSERT INTO time_entries (user_id, company_id, work_date, hours_worked, description) VALUES ($1, $2, $3, $4, $5)`,
         [
           userId,
           EntryFormData.id,
           EntryFormData.date,
           EntryFormData.hours,
           EntryFormData.description,
         ],
       );

       return { success: true, message: "entry created" };
      }




//##############################################################################



export async function queryupdatePassword(userId: string, currentPassword: string, newPassword: string) {

  try {
    const response = await pool.query(
      `SELECT password_hash FROM users WHERE id = $1`,
      [userId]);

const validatePassword = await bcrypt.compare(currentPassword, response.rows[0].password_hash);

      if (!validatePassword) {

        return { success: false, message: "Current password is incorrect" };
      }else if(validatePassword){

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await pool.query(
          `UPDATE users SET password_hash = $1 WHERE id = $2`,
          [hashedNewPassword, userId]
        );
        return { success: true, message: "Password updated successfully" };
      }
    } catch (error) {
      console.error("Error setting new password: ", error);
      throw error;
    };
  }



  //##############################################################################



  export async function queryupdateAvatar(userId: string, avatar: string) {
  await pool.query(
    `UPDATE users SET avatar = $1 WHERE id = $2`,
    [avatar, userId]

  );
  return { success: true, message: "Avatar updated successfully" };
}



//##############################################################################



export async function queryDraftEntriesByUser(userId: string) {
 const response = await pool.query(
    `SELECT * FROM time_entries WHERE user_id = $1 AND status = 'draft' AND DATE_TRUNC('month', work_date) = DATE_TRUNC('month', NOW())`,
    [userId]

  );
  return response.rows;
}



//##############################################################################



export async function querySubmittedEntries() {
 const response = await pool.query(
    `SELECT time_entries.*, companies.name AS company_name, users.hourly_rate
FROM time_entries
JOIN companies ON time_entries.company_id = companies.id
JOIN users ON time_entries.user_id = users.id
WHERE time_entries.status = 'submitted'
ORDER BY time_entries.work_date ASC`

  );
  return response.rows;
}



//##############################################################################



export async function TimesheetHoursByMonth(userId: string, filter:string) {
 const response = await pool.query(
    `SELECT worked_hours FROM time_entries WHERE user_id = $1 AND status = 'draft' AND DATE_TRUNC('month', work_date) = DATE_TRUNC('month', $2::DATE)`,
    [userId, filter]

  );
  return response.rows;
}



//##############################################################################



// Hämtar de månader där det finns en draft
export async function queryTimesheetMonthByName(userId: string) {
 const response = await pool.query(
    `SELECT DISTINCT DATE_TRUNC('month', work_date) as month
      FROM time_entries
      WHERE user_id = $1
      AND status = 'draft'
      ORDER BY month DESC`,
    [userId]

  );
  console.log(response.rows)
  return response.rows;
}



//##############################################################################



export async function queryTimesheetEntriesByMonth(userId: string, date:string) {
  const formatDate = date.split("-")
  const formattedDate = formatDate[0]+"-"+formatDate[1]
  console.log(formattedDate)
  const response = await pool.query(
    `SELECT time_entries.*, companies.name AS company_name
   FROM time_entries
   JOIN companies ON time_entries.company_id = companies.id
   WHERE time_entries.user_id = $1
   AND time_entries.status = 'draft'
   AND DATE_TRUNC('month', time_entries.work_date) = DATE_TRUNC('month', $2::DATE)`,
  [userId, date]

  );
  console.log("Response.rows: ", response.rows)
  return response.rows;
}



//##############################################################################



export async function querydeleteSingleEntry(userId: string, entryID:string) {
 console.log("USER ID IN DBCALLS: ",userId, "ENTRY ID IN DBCALLS: ",entryID)
  await pool.query(
    `DELETE FROM time_entries WHERE id=$1 AND user_id=$2`,
  [entryID, userId]

  );
  // console.log("Response.rows: ", response.rows)
  return "Entry deleted";
}

export async function queryUpdateDraftEntry(
  userId: string,
  entryId: string,
  entry: {
    companyId: string;
    date: string;
    hours: string;
    mileage?: string;
    expense?: string;
    description: string;
  },
) {
  const response = await pool.query(
    `UPDATE time_entries
     SET company_id = $1,
         work_date = $2,
         hours_worked = $3,
         mileage = NULLIF($4, ''),
         expense = NULLIF($5, ''),
         description = $6
     WHERE id = $7 AND user_id = $8 AND status = 'draft'
     RETURNING id`,
    [
      entry.companyId,
      entry.date,
      entry.hours,
      entry.mileage || "",
      entry.expense || "",
      entry.description,
      entryId,
      userId,
    ],
  );

  if (response.rowCount !== 1) {
    throw new Error("Draft entry not found");
  }

  return { success: true, message: "Entry updated" };
}



//##############################################################################



export async function querySignoff(userId: string, month:string) {
  const client = await pool.connect()
 console.log("USER ID IN DBCALLS: ",userId, "ENTRY ID IN DBCALLS: ",month)

try{
await client.query("BEGIN");

const exisitingTimesheet = await client.query(
    `SELECT id FROM timesheets
     WHERE user_id = $1
     AND status = 'pending'
     AND DATE_TRUNC('month', month) = DATE_TRUNC('month', $2::DATE)`,
    [userId, month]
  );

  let timesheetId;

  if(exisitingTimesheet.rows.length > 0){
    timesheetId = exisitingTimesheet.rows[0].id
  }else {

    const newTimesheet = await client.query(
      `INSERT INTO timesheets
      (user_id, status, month, submitted_at)
      VALUES ($1, 'pending', DATE_TRUNC('month', $2::DATE), NOW())
      RETURNING id`,
    [userId, month]
    );
    timesheetId = newTimesheet.rows[0].id;
  }


await client.query(`UPDATE time_entries
  SET status='submitted', timesheet_id = $1
  WHERE user_id=$2
  AND status='draft'
  AND DATE_TRUNC('month', work_date) = DATE_TRUNC('month', $3::DATE)`,
  [timesheetId, userId, month])

  await client.query("COMMIT");
  return {success: true, message:`Signoff complete for ${month}`};

}catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}



//##############################################################################



export async function queryTimesheets(userId:string){

const response = await pool.query(
  `SELECT timesheets.*, users.full_name AS user_name
   FROM timesheets
   JOIN users ON timesheets.user_id = users.id
   WHERE timesheets.user_id = $1`,
  [userId],
);

  return response.rows
}

export async function queryUserTimesheetEntries(userId: string) {
  const response = await pool.query(
    `SELECT time_entries.id,
            time_entries.timesheet_id,
    time_entries.user_id,
    time_entries.company_id,
    companies.name AS company_name,
    time_entries.work_date,
    time_entries.hours_worked,
    time_entries.status,
    time_entries.description,
    time_entries.mileage,
    time_entries.expense,
    users.hourly_rate,
    users.full_name AS user_name
     FROM time_entries
     JOIN companies ON time_entries.company_id = companies.id
     JOIN timesheets ON time_entries.timesheet_id = timesheets.id
     JOIN users ON time_entries.user_id = users.id
     WHERE time_entries.user_id = $1
       AND timesheets.user_id = $1
       AND time_entries.timesheet_id IS NOT NULL
       AND time_entries.status IN ('submitted', 'approved', 'rejected')
     ORDER BY time_entries.work_date ASC`,
    [userId],
  );

  return response.rows;
}



//##############################################################################



export async function queryAdminTS(){

const response =await pool.query(`
  SELECT timesheets.*, users.full_name AS user_name, users.avatar AS user_avatar
    FROM timesheets
    JOIN users ON timesheets.user_id = users.id
    WHERE timesheets.status = 'pending'
    ORDER BY timesheets.submitted_at DESC`)

  return response.rows
}




export async function queryAdminEntries(){

// const response =await pool.query("SELECT * FROM timesheets WHERE status='pending'")

  // return response.rows
}

export async function querySetTimesheetApproval(timesheetId: string){
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const response = await client.query(
      `UPDATE timesheets
       SET status = 'approved', approved_at = COALESCE(approved_at, NOW())
       WHERE id = $1
       RETURNING id`,
      [timesheetId],
    );

    if (response.rowCount !== 1) {
      throw new Error("Timesheet not found");
    }

    await client.query(
      "UPDATE time_entries SET status = 'approved' WHERE timesheet_id = $1",
      [timesheetId],
    );
    await client.query("COMMIT");
    return response.rows;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function querySetTimesheetRejection(timesheetId: string){

const response =await pool.query("UPDATE timesheets SET status='rejected' WHERE id=$1", [timesheetId])
 await pool.query(`UPDATE time_entries SET status = 'rejected' WHERE timesheet_id = $1`, [timesheetId])
  return response.rows
}

export async function querySetTimesheetForEdit(timesheetId: string){
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const response = await client.query(
      "UPDATE timesheets SET status='edit' WHERE id=$1 RETURNING id",
      [timesheetId],
    );

    if (response.rowCount !== 1) {
      throw new Error("Timesheet not found");
    }

    await client.query(
      `UPDATE time_entries
       SET status = 'draft', timesheet_id = NULL
       WHERE timesheet_id = $1`,
      [timesheetId],
    );

    await client.query("COMMIT");
    return response.rows;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}


export async function getAllUsers(){

  const response = await pool.query("SELECT * FROM users")
  return response.rows
}

export async function queryAddNewUser(fullName:string, email:string, password:string, role:string, salary:string, status:string){

const hashedPassword = await bcrypt.hash(password, 10);

const response = await pool.query(
  `INSERT INTO users (full_name, email, password_hash, role, hourly_rate, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
  [fullName, email, hashedPassword, role, salary, status]
);

return response.rows;

}



//##############################################################################



export async function queryAssignUserCompanies(userId: string, companyIds: string[]) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userExists = await client.query(`SELECT id FROM users WHERE id = $1`, [userId]);
    if (userExists.rowCount !== 1) {
      throw new Error("User not found");
    }

    // Endast befintliga företag infogas, och redan tilldelade hoppas över
    const response = await client.query(
      `INSERT INTO user_companies (user_id, company_id)
       SELECT $1, companies.id
       FROM companies
       WHERE companies.id = ANY($2::uuid[])
       AND NOT EXISTS (
         SELECT 1 FROM user_companies
         WHERE user_companies.user_id = $1
         AND user_companies.company_id = companies.id
       )
       ON CONFLICT DO NOTHING
       RETURNING company_id`,
      [userId, companyIds],
    );

    await client.query("COMMIT");
    return { success: true, message: "Companies assigned", assigned: response.rowCount };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
