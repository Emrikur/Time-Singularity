import bcrypt from "bcryptjs";
import type { ChartData } from "chart.js";
import type { Filter } from "./types";
import axios from "axios";



interface GraphEntry{
  company_name:string,
  hours_worked:string,
  work_date:string,
  filter:string
}



//##############################################################################

//! Create Hash-function

export async function createHash(password: string) {
  if(password.length < 20){
    const newHash = await bcrypt.hash(`${password}`, 10);
    return newHash;
  }else{
    return "Password too long"
  }
}



//##############################################################################



export function formatEventDateTime(dateTime: string | Date, option?:Intl.DateTimeFormatOptions) {
const dateObj = new Date(dateTime)

  if(!option){
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "2-digit",
    })

}
return dateObj.toLocaleDateString("en-US", option) /* lägga till önskad formatering, ex: {year:"numeric", month:"2-digit", day:"short"} */
}



//##############################################################################



export function formatWeekTime(dateTime: string | Date) {
  const date = new Date(dateTime);
  const dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${dateStr}`;
}



//##############################################################################



export function formatEventDateDayTime(dateTime: string | Date) {

  const date = new Date(dateTime);
  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "short",
  });
  return `${dateStr}`;
}



//##############################################################################

//! Format data for graph rendering

export function formatGraphData(responseData: GraphEntry[], filter:Filter): ChartData<"bar", (number | null)[], string> {

  if (filter === "year") {
    const sortedData = [...responseData].sort(
      (a, b) => new Date(a.work_date).getTime() - new Date(b.work_date).getTime()
    );
    const months = [...new Set(sortedData.map((entry) =>
      new Date(entry.work_date).toLocaleString("en-US", { month: "long" })
    ))];


  return {
    labels: months,
    datasets: [{
      label: "Hours",
      data: months.map((month) =>
        responseData
          .filter((e) => new Date(e.work_date).toLocaleString("en-US", { month: "long" }) === month)
          .reduce((sum, e) => sum + Number(e.hours_worked), 0)
      ),
      backgroundColor: "rgba(53, 162, 235, 0.5)",
    }],
  };
}

const companies = [...new Set(responseData.reverse().map((company) => company.company_name))]

const dates = [...new Set(responseData.map((entry) => entry.work_date))].sort((a,b) => new Date(a).getTime() - new Date(b).getTime())

  const formattedDates = dates.map((date) =>
    filter === "week" ? formatEventDateDayTime(date):
    formatEventDateTime(date))

  const datasets = companies.map((company) => {
    const companyHours = dates.map((date) => {
      const dateEntry = responseData.find((e) => e.company_name === company && e.work_date === date)
      return dateEntry ? Number(dateEntry.hours_worked) : null
    })
    return {
      label:company,
      data:companyHours,
      backgroundColor:`rgba(${Math.random() * 255}, ${Math.random() * 255}, 235, 0.5)`,
      skipNull: true,
    }

  });

  return {
    labels: formattedDates,
    datasets,
  };

}



//##############################################################################


//! Format doughnut chart data

export function formatDoughnutData(responseData: GraphEntry[]): ChartData<"doughnut", (number | null)[], string> {


  try {
  const companyHours: { [key: string]: number } = {}; //Tomt objekt med nycklar som alltid är av typen sträng, värdet är alltid nummer

  responseData.forEach((entry) => {

    //If the company does NOT have a key in the object,
    //then it creates one with 0 as value and adds the worked hours to that.
    if (!companyHours[entry.company_name]) {
      companyHours[entry.company_name] = 0;
    }
    companyHours[entry.company_name] += Number(entry.hours_worked);
  });

  const companies = Object.keys(companyHours);
  const hours = Object.values(companyHours);

  // Random colors for each company label
  const colors = companies.map(() =>
    `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`
  );

  return {

    labels: companies,
    datasets: [{
      data: hours,
      backgroundColor: colors,
      borderColor: colors.map(color => color.replace('0.7', '1')),
      borderWidth: 2,
    }],
  };}catch (error) {
    console.error("Error formatting doughnut data:", error);
    return {
      labels: [],
      datasets: [{
        data: []
      }]
    };
  }
}



//##############################################################################

//! Calculates week range for given date

export function weekRange(date: Date): string {
  const firstDayOfWeek = new Date(date);
  firstDayOfWeek.setDate(date.getDate() - date.getDay() + 1);
  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 4);

  const firstDay = firstDayOfWeek.toLocaleDateString("en-US", { day: "numeric" });
  const lastDay = lastDayOfWeek.toLocaleDateString("en-US", { day: "numeric" });

  return `${firstDay} - ${lastDay}`;
}



//##############################################################################



export async function deleteEntry(id:string, token:string) {
  // console.log("TOKEN",token, "ID",id)
      const removeEntry = await axios({
        method: "delete",
        url: `${import.meta.env.VITE_API_URL}/user/timesheet/deleteEntry`,
        headers: { Authorization: `Bearer ${token}` },
        data:{entryID:id}
      });

      const response = removeEntry.data;
      // console.log("HERE IS THE DELETE RESPONSE IN functions: ",response)

return {message:response}

    }

export async function updateDraftEntry(
  entryId: string,
  token: string,
  data: {
    companyId: string;
    date: string;
    hours: string;
    mileage: string;
    expense: string;
    description: string;
  },
) {
  const response = await axios({
    method: "put",
    url: `${import.meta.env.VITE_API_URL}/user/timesheet/updateEntry`,
    headers: { Authorization: "Bearer " + token },
    data: { entryId, ...data },
  });

  return response.data;
}



//##############################################################################



export async function getdraftMonthNames(token:string) {

      const getMonthNames = await axios({
        method: "get",
        url: `${import.meta.env.VITE_API_URL}/dashboard/draftmonths`,
        headers: { Authorization: `Bearer ${token}` },
      });
      const response = getMonthNames.data.data;

      return response;

    }



//##############################################################################



export async function signoffTimesheet(month:string, token:string | null) {
  // console.log("TOKEN i signoff",token, "month in signoff",month)
      const signoffEntry = await axios({
        method: "post",
        url: `${import.meta.env.VITE_API_URL}/user/timesheet/signoff`,
        headers: { Authorization: `Bearer ${token}` },
        data:{signoffMonth:month}
      });

      const response = signoffEntry.data;


return {message:response}

    }



//##############################################################################


//Get all the timesheets for the specific user
export async function fetchTimesheets(token:string) {


    const timesheets = await axios({
      method: "get",
      url: `${import.meta.env.VITE_API_URL}/user/timesheet/fetch`,
      headers: { Authorization: `Bearer ${token}` }
    });

    const response = timesheets.data;

return response

    }

export async function fetchUserTimesheetEntries(token: string) {
  const entries = await axios({
    method: "get",
    url: `${import.meta.env.VITE_API_URL}/user/timesheet/entries`,
    headers: { Authorization: "Bearer " + token },
  });

  return entries.data;
}



//##############################################################################


//Get the timesheets from all users, to admin
export async function fetchAdminTimesheets(token:string | null) {
  // console.log("TOKEN i signoff",token)

    const timesheets = await axios({
      method: "get",
      url: `${import.meta.env.VITE_API_URL}/admin/pendingtimesheet/fetch`,
      headers: { Authorization: `Bearer ${token}` }
    });

    const response = timesheets.data;
    // console.log("HERE IS THE DELETE RESPONSE IN functions: ",response)

return response

    }



//##############################################################################



export async function fetchSubmittedEntries(token:string | null) {
  // console.log("TOKEN i signoff",token)

    const entries = await axios({
      method: "get",
      url: `${import.meta.env.VITE_API_URL}/admin/submittedentries/fetch`,
      headers: { Authorization: `Bearer ${token}` }
    });

    const response = entries.data;
    // console.log("HERE IS THE GET ENTRIES RESPONSE IN functions: ",response)

return response

    }


    export async function handleApproval(timesheetId:string, token:string | null, action:"approve" | "reject" | "edit") {

      if (!token) {
        throw new Error("No token provided");
      }
      if (!timesheetId) {
        throw new Error("No timesheet ID provided");
      }
      if (action !== "approve" && action !== "reject" && action !== "edit") {
        throw new Error("Invalid action provided");
      }
      if (action === "approve") {
        if (!window.confirm("Are you sure you want to approve this timesheet?")) {
          console.log("Approval cancelled by user");
          return;
        }

      // console.log("Timesheet ID: ", timesheetId, "Action: ", action, "Token: ", token)
             const response = await axios({
                method: "put",
                url: `${import.meta.env.VITE_API_URL}/admin/timesheet/approval`,
                headers: { Authorization: `Bearer ${token}` },
                data:{timesheetId, action}
              })

              return response;



      }else if (action === "reject") {
        if (!window.confirm("Are you sure you want to reject this timesheet?")) {
          console.log("Rejection cancelled by user");
          return;
        }

      // console.log("Timesheet ID: ", timesheetId, "Action: ", action, "Token: ", token)
       const response = await axios({
          method: "put",
          url: `${import.meta.env.VITE_API_URL}/user/timesheet/history`,
          headers: { Authorization: `Bearer ${token}` },
          data:{timesheetId, action}
        })
console.log("Response from handleApproval: ", response)
        return response;

      } else {
if (!window.confirm("Are you sure you want to send this timesheet back for editing?")) {
  console.log("Edit request cancelled by user");
  return;
}

const response = await axios({
  method: "put",
  url: `${import.meta.env.VITE_API_URL}/admin/timesheet/approval`,
  headers: { Authorization: "Bearer " + token },
  data: { timesheetId, action },
});

return response;
      }
    }

    /* export async function  fetchPastTimesheets(token:string){

      console.log("The token", token)
      const response = await axios({
        method:"get",
        url:`${import.meta.env.VITE_API_URL}/user/timesheet/history`,
        headers:{ Authorization: `Bearer ${token}`},
      })
      return response


    } */
