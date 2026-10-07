import type { EntryTypes, TimesheetTypes } from "./types";
import { toLocalDate } from "./functions";

function parseNumericValue(value: string | null | undefined) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function hasValue(value: string | null | undefined) {
  return value !== null && value !== undefined && value !== "";
}

// jsPDF's built-in fonts can't render the no-break spaces sv-SE uses as thousand separators
function formatPdfNumber(value: number, minimumFractionDigits = 2) {
  return new Intl.NumberFormat("sv-SE", {
    minimumFractionDigits,
    maximumFractionDigits: 2,
  })
    .format(value)
    .replace(/[\u00a0\u202f]/g, " ");
}

function formatPdfDate(value: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("sv-SE", options).format(toLocalDate(value));
}



//##############################################################################



export async function downloadTimesheetPdf(
  timesheet: TimesheetTypes,
  entries: EntryTypes[],
) {
  // Loaded on demand so the PDF libraries aren't part of the main bundle
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const autoTable = autoTableModule.default;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
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

  const mileageEntries = entries.filter((entry) => hasValue(entry.mileage));
  const expenseEntries = entries.filter((entry) => hasValue(entry.expense));
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
      hasValue(entry.mileage)
        ? `${formatPdfNumber(parseNumericValue(entry.mileage), 0)} km`
        : "-",
      hasValue(entry.expense)
        ? `${formatPdfNumber(parseNumericValue(entry.expense))} SEK`
        : "-",
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

  // Start the summary below the table, on a new page if it doesn't fit
  const tableFinalY =
    (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? 54;
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

  const [year, month] = timesheet.month.slice(0, 10).split("-");
  doc.save(`timesheet-${month}-${year}.pdf`);
}
