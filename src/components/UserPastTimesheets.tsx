import { useEffect, useState } from "react"
import "../assets/styles/UserPastTimesheets.css"
import {fetchTimesheets, fetchUserTimesheetEntries, formatEventDateTime} from "../lib/functions"
import { useAuth } from "../hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { ChevronDown } from "lucide-react";
import type { EntryTypes, TimesheetTypes } from "../lib/types";
import { toast } from "react-toastify";

export default function UserPastTimesheets(){
const {token} = useAuth()
const navigate = useNavigate()
const [timesheets, setTimesheets] = useState<TimesheetTypes[]>([]);
const [entries, setEntries] = useState<EntryTypes[]>([]);
const [filterToggle,setFilterToggle] = useState("")
const [expandedId, setExpandedId] = useState<string | null>(null);
  useEffect(() => {
if(!token){
  navigate("/")
  return;
}
    Promise.all([fetchTimesheets(token), fetchUserTimesheetEntries(token)]).then(
      ([timesheetResponse, entryResponse]) => {
        setTimesheets(timesheetResponse);
        setEntries(entryResponse);
      },
    ).catch(() => {
      toast.error("Could not load timesheet history");
    });

  },[navigate, token])
  return (
  <>
<div >{/* Modal */}</div>
<div className="timesheet-container">
<h2>Timesheets overview</h2>
<div>
  <div className="filterToggles" ><div onClick={() => setFilterToggle("")}>All</div><div onClick={() => setFilterToggle("approved")}>Approved</div><div onClick={() => setFilterToggle("pending")}>Pending</div><div onClick={() => setFilterToggle("rejected")}>Rejected</div></div>
  <div className="timesheet-card-labels" ><p id="month">Month</p><p id="status">Status</p><p id="sub-at">Submitted at</p></div>
  <div className="timesheet-wrapper">
    {timesheets.filter((f) => !filterToggle || f.status === filterToggle).map((e) =>
  <div className="timesheet-card-wrapper" key={e.id}>
    <button
      type="button"
      className="timesheet-card"
      onClick={() => setExpandedId(expandedId === e.id ? null : e.id)}
      aria-expanded={expandedId === e.id}
    >
      <p>{formatEventDateTime(e.month, {year:"numeric", month:"long"})}</p>
      <p className={e.status === "pending"
                            ? "timesheet-status-pending"
                            : e.status === "approved"
                              ? "timesheet-status-approved"
                              : "timesheet-status-rejected"
                        }>{e.status}</p>
      <p>{formatEventDateTime(e.submitted_at, {month:"2-digit", day:"2-digit", year:"numeric"})}</p>
      <ChevronDown
        className={expandedId === e.id ? "timesheet-chevron expanded" : "timesheet-chevron"}
        aria-hidden="true"
      />
    </button>
    {expandedId === e.id && (
      <div className="timesheet-entry-details">
        {entries.filter((entry) => entry.timesheet_id === e.id).map((entry) => (
          <div className="timesheet-entry-detail" key={entry.id}>
            <div>
              <strong>{entry.company_name}</strong>
              <p>{formatEventDateTime(entry.work_date, {year:"numeric", month:"short", day:"numeric"})}</p>
              <p>{entry.description}</p>
            </div>
            <div className="timesheet-entry-values">
              <p>{entry.hours_worked} hrs</p>
              {entry.mileage && <p>Mileage: {entry.mileage}</p>}
              {entry.expense && <p>Expense: {entry.expense}</p>}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>

  )}
  </div>

</div>
</div>

  </>
  )
}
