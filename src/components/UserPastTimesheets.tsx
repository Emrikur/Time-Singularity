import { useEffect, useState } from "react"
import "../assets/styles/UserPastTimesheets.css"
import {fetchTimesheets, fetchUserTimesheetEntries, formatEventDateTime} from "../lib/functions"
import { useAuth } from "../hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { ChevronDown, Download } from "lucide-react";
import type { EntryTypes, TimesheetTypes } from "../lib/types";
import { toast } from "react-toastify";
import { downloadTimesheetPdf } from "../lib/timesheetPdf";

const filterOptions = [
  { value: "", label: "All" },
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
];

export default function UserPastTimesheets(){
const {token} = useAuth()
const navigate = useNavigate()
const [timesheets, setTimesheets] = useState<TimesheetTypes[]>([]);
const [entries, setEntries] = useState<EntryTypes[]>([]);
const [entriesLoaded, setEntriesLoaded] = useState(false);
const [filterToggle,setFilterToggle] = useState("")
const [expandedId, setExpandedId] = useState<string | null>(null);
  useEffect(() => {
if(!token){
  navigate("/")
  return;
}
    // Loaded separately so the timesheet list still shows if the entries fail
    Promise.allSettled([
      fetchTimesheets(token),
      fetchUserTimesheetEntries(token),
    ]).then(([timesheetResult, entryResult]) => {
      if (timesheetResult.status === "fulfilled") {
        setTimesheets(timesheetResult.value);
      } else {
        toast.error("Could not load timesheets");
      }

      if (entryResult.status === "fulfilled") {
        setEntries(entryResult.value);
        setEntriesLoaded(true);
      } else {
        toast.error("Could not load timesheet entries");
      }
    });

  },[navigate, token])

  async function handleDownload(timesheet: TimesheetTypes) {
    try {
      const timesheetEntries = entries.filter(
        (entry) => entry.timesheet_id === timesheet.id,
      );
      await downloadTimesheetPdf(timesheet, timesheetEntries);
    } catch (error) {
      console.error("Could not generate timesheet PDF", error);
      toast.error("Could not generate timesheet PDF");
    }
  }

  return (
  <>
<div >{/* Modal */}</div>
<div className="timesheet-container">
<h2>Timesheets overview</h2>
<div className="timesheet-content">
  <div
    className="filterToggles"
    style={{
      "--active-index": filterOptions.findIndex((option) => option.value === filterToggle),
      "--option-count": filterOptions.length,
    } as React.CSSProperties}
  >
    <span className="filter-indicator" aria-hidden="true" />
    {filterOptions.map((option) => (
      <button
        type="button"
        key={option.value}
        className={filterToggle === option.value ? "active" : undefined}
        aria-pressed={filterToggle === option.value}
        onClick={() => setFilterToggle(option.value)}
      >
        {option.label}
      </button>
    ))}
  </div>
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
      <p className="timesheet-month">{formatEventDateTime(e.month, {year:"numeric", month:"long"})}</p>
      <p className={`timesheet-status ${e.status === "pending"
                            ? "timesheet-status-pending"
                            : e.status === "approved"
                              ? "timesheet-status-approved"
                              : "timesheet-status-rejected"
                        }`}>{e.status}</p>
      <p className="timesheet-submitted">
        <span className="timesheet-submitted-label">Submitted </span>
        {formatEventDateTime(e.submitted_at, {month:"2-digit", day:"2-digit", year:"numeric"})}
      </p>
      <ChevronDown
        className={expandedId === e.id ? "timesheet-chevron expanded" : "timesheet-chevron"}
        aria-hidden="true"
      />
    </button>
    {e.status === "approved" && (
      <button
        type="button"
        className="timesheet-download-button"
        onClick={() => handleDownload(e)}
        disabled={!entriesLoaded}
        title={entriesLoaded ? undefined : "Timesheet entries are unavailable"}
        aria-label={`Download ${formatEventDateTime(e.month, {year:"numeric", month:"long"})} timesheet as PDF`}
      >
        <Download size={18} aria-hidden="true" />
        <span className="timesheet-download-label">PDF</span>
      </button>
    )}
    {expandedId === e.id && (
      <div className="timesheet-entry-details">
        {e.status === "edit" && <p>Entries awaiting editing</p>}
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
