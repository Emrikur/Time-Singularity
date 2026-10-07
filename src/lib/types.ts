export type Filter = "week" | "month" | "year";

export interface EntryFormData {
  id:string,
  date:string,
  hours:string,
  hourRate:string,
  description:string,
  success:boolean,
  message:string
};

export interface UserFormData {
  firstName: string;
  lastName: string;
  email:string;
  password:string;
  role:string;
  salary:string;
  status:string;
}

export interface EntryTypes{
      id: string;
      timesheet_id?: string;
      company_id: string;
      company_name: string;
      work_date: string;
      hours_worked: string;
      status:string;
      mileage:string | null;
      expense:string | null;
      user_id:string;
      user_name:string
      description:string | null;
      hourly_rate:string;
}

export interface CompanyTypes{
      id:string;
      name:string;
      is_active:boolean;
}

export interface MonthTypes{
      month:string
}
export interface TimesheetTypes{
      id:string;
      month:string;
      status:string;
      user_name:string
      user_id:string;
      user_avatar:string;
      work_date:string;
      submitted_at:string
      approved_at?:string | null;
}
