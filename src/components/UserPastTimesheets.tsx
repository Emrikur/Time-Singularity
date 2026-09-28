import { useEffect, useState } from "react"
import "../assets/styles/UserPastTimesheets.css"
import {fetchTimesheets, fetchUserTimesheetEntries, formatEventDateTime} from "../lib/functions"
import { useAuth } from "../hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { ChevronDown, Download } from "lucide-react";
import type { EntryTypes, TimesheetTypes } from "../lib/types";
import { toast } from "react-toastify";

function parseNumericValue(value: string | null | undefined) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function formatPdfNumber(value: number, minimumFractionDigits = 2) {
  return new Intl.NumberFormat("sv-SE", {
    minimumFractionDigits,
    maximumFractionDigits: 2,
  })
    .format(value)
    .replace(/[\u00a0\u202f]/g, " ");
}

function formatPdfDate(
  value: string,
  options: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat("sv-SE", {
    ...options,
    timeZone: "UTC",
  }).format(new Date(value));
}

async function downloadTimesheetPdf(
  timesheet: TimesheetTypes,
  entries: EntryTypes[],
) {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const autoTable = autoTableModule.default;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const monthDate = new Date(timesheet.month);
  const monthYear = formatPdfDate(timesheet.month, {
    month: "long",
    year: "numeric",
  });

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Time Singularity", 14, 18);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(monthYear, 14, 26);
  doc.setFontSize(10);
  doc.text(`User: ${timesheet.user_name}`, 14, 38);
  doc.text(
    `Approved: ${
      timesheet.approved_at
        ? formatPdfDate(timesheet.approved_at, {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "Approval date not recorded"
    }`,
    14,
    45,
  );

  const mileageEntries = entries.filter(
    (entry) => entry.mileage !== null && entry.mileage !== "",
  );
  const expenseEntries = entries.filter(
    (entry) => entry.expense !== null && entry.expense !== "",
  );
  const totalHours = entries.reduce(
    (total, entry) => total + parseNumericValue(entry.hours_worked),
    0,
  );
  const hourlyRate = entries.length
    ? parseNumericValue(entries[0].hourly_rate)
    : null;
  const totalEarnings = entries.reduce(
    (total, entry) =>
      total +
      parseNumericValue(entry.hours_worked) *
        parseNumericValue(entry.hourly_rate),
    0,
  );
  const totalMileage = mileageEntries.reduce(
    (total, entry) => total + parseNumericValue(entry.mileage),
    0,
  );
  const totalExpenses = expenseEntries.reduce(
    (total, entry) => total + parseNumericValue(entry.expense),
    0,
  );

  let tableFinalY = 54;
  autoTable(doc, {
    startY: 54,
    head: [["Company", "Date", "Hours", "Description", "Mileage", "Expense"]],
    body: entries.map((entry) => [
      entry.company_name,
      formatPdfDate(entry.work_date, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      `${formatPdfNumber(parseNumericValue(entry.hours_worked))} hrs`,
      entry.description ?? "",
      entry.mileage === null || entry.mileage === ""
        ? "-"
        : `${formatPdfNumber(parseNumericValue(entry.mileage), 0)} km`,
      entry.expense === null || entry.expense === ""
        ? "-"
        : `${formatPdfNumber(parseNumericValue(entry.expense))} SEK`,
    ]),
    margin: { left: 14, right: 14 },
    styles: { font: "helvetica", fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [47, 76, 229] },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 26 },
      2: { cellWidth: 18 },
      3: { cellWidth: 59 },
      4: { cellWidth: 22 },
      5: { cellWidth: 24 },
    },
    didDrawCell: (data) => {
      if (
        data.cursor &&
        data.column.index === 5 &&
        ((data.section === "body" && data.row.index === entries.length - 1) ||
          (entries.length === 0 && data.section === "head"))
      ) {
        tableFinalY = data.cursor.y;
      }
    },
  });

  const summaryItems = [
    ["Total hours", `${formatPdfNumber(totalHours)} hrs`],
    ...(hourlyRate !== null
      ? [
          [
            "Hourly rate",
            `${formatPdfNumber(hourlyRate, hourlyRate % 1 === 0 ? 0 : 2)} SEK/h`,
          ],
        ]
      : []),
    ["Total earnings", `${formatPdfNumber(totalEarnings)} SEK`],
    ...(mileageEntries.length > 0
      ? [["Total mileage", `${formatPdfNumber(totalMileage, 0)} km`]]
      : []),
    ...(expenseEntries.length > 0
      ? [["Total expenses", `${formatPdfNumber(totalExpenses)} SEK`]]
      : []),
  ];
  const summaryHeight = 12 + summaryItems.length * 7;
  let summaryY = tableFinalY + 12;
  if (summaryY + summaryHeight > doc.internal.pageSize.getHeight() - 14) {
    doc.addPage();
    summaryY = 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Summary", 14, summaryY);
  doc.setFontSize(10);
  summaryItems.forEach(([label, value], index) => {
    const y = summaryY + 8 + index * 7;
    doc.setFont("helvetica", "normal");
    doc.text(label, 14, y);
    doc.setFont("helvetica", "bold");
    doc.text(value, pageWidth - 14, y, { align: "right" });
  });

  const month = String(monthDate.getUTCMonth() + 1).padStart(2, "0");
  const year = monthDate.getUTCFullYear();
  doc.save(`timesheet-${month}-${year}.pdf`);
}

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
    Promise.allSettled([
      fetchTimesheets(token),
      fetchUserTimesheetEntries(token),
    ]).then(([timesheetResult, entryResult]) => {
      if (timesheetResult.status === "fulfilled") {
        setTimesheets(timesheetResult.value);
      } else {
        console.error("Could not load timesheets", timesheetResult.reason);
        toast.error("Could not load timesheets");
      }

      if (entryResult.status === "fulfilled") {
        setEntries(entryResult.value);
        setEntriesLoaded(true);
      } else {
        console.error("Could not load timesheet entries", entryResult.reason);
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
        <span>Download PDF</span>
      </button>
    )}
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
