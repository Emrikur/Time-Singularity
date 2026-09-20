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



export async function queryCompanyData() {
  const response = await pool.query(`SELECT name, id, is_active FROM companies`);
  // console.log("RESPONSE ROWS: ",response.rows)
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

  console.log("the current password in DBCALLS: ",currentPassword,"The new password in DBCALLS: ", newPassword)


  try {
    const response = await pool.query(
      `SELECT password_hash FROM users WHERE id = $1`,
      [userId]);

const validatePassword = await bcrypt.compare(currentPassword, response.rows[0].password_hash);
console.log("validate password: ", validatePassword)

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

const response =await pool.query("SELECT * FROM timesheets WHERE user_id = $1",[userId])

  return response.rows
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

  const response =await pool.query("UPDATE timesheets SET status='approved' WHERE id=$1", [timesheetId])
  await pool.query(`UPDATE time_entries SET status = 'approved' WHERE timesheet_id = $1`, [timesheetId])


  return response.rows
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
  `INSERT INTO users (full_name, email, password_hash, role, hourly_rate, is_active) VALUES ($1, $2, $3, $4, $5, $6)`,
  [fullName, email, hashedPassword, role, salary, status]
);

return response.rows;

}
