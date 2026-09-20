import { useEffect, useState } from "react";
import "../assets/styles/timesheet.css";
// import { toast } from "react-toastify";
import LayoutWrapper from "../components/LayoutWrapper";
import {
  ClipboardCheck,
  ArrowRight,
  ArrowDown,
  Building2,
  Clock,
  CircleDollarSign,
} from "lucide-react";
import {
  fetchAdminTimesheets,
  fetchSubmittedEntries,
  formatEventDateTime,
  handleApproval,
} from "../lib/functions";
import type { EntryTypes, TimesheetTypes } from "../lib/types";
import { useAuth } from "../hooks/useAuth";
export default function Approvals() {

  const { token } = useAuth();
  const [entries, setEntries] = useState<EntryTypes[]>([]);
  const [timesheets, setTimesheets] = useState<TimesheetTypes[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [expandedtoggleId, setExpandedToggleId] = useState<number | null>(null);

  const companyColors = [
    "#2563EB",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#14B8A6",
    "#F97316",
    "#06B6D4",
    "#84CC16",
    "#6366F1",
    "#F43F5E",
    "#0EA5E9",
    "#A855F7",
    "#22C55E",
    "#EAB308",
    "#3B82F6",
    "#EC4899",
    "#10B981",
    "#F97316",
    "#8B5CF6",
    "#06B6D4",
    "#EF4444",
    "#84CC16",
    "#6366F1",
    "#0EA5E9",
    "#A855F7",
    "#22C55E",
    "#F59E0B",
    "#2563EB",
  ];
  const avatarURL = "../avatars/";
  const uniqueUsers = new Set(timesheets.map((user) => user.user_id)).size;
  console.log("Number of users: ", uniqueUsers);
  const sumofTimesheets = timesheets.length;

  // console.log("Sum of timesheets: ", sumofTimesheets);


  function handleRefresh() {
    setRefresh(!refresh);
  }

  useEffect(() => {
    fetchAdminTimesheets(token).then((response) => {
      setTimesheets(response);
    });

    fetchSubmittedEntries(token).then((response) => {
      setEntries(response);
    });
  }, [refresh,token]);

  return (
    <>
      <LayoutWrapper>
        <section style={{ minHeight: "70vh" }}>
          <h1>Approvals</h1>

          <div className="timesheets-summary-admin-wrapper">
            <div className="summary-icon-wrapper">
              <ClipboardCheck height={44} width={44} />
            </div>
            <div className="timesheet-summary-title-admin">
              <p>Submitted timesheets: {sumofTimesheets}</p>
              <p>Across {uniqueUsers} users</p>
            </div>
          </div>
          <div className="summary-list-timesheet-wrapper">
            {timesheets &&
              entries &&
              timesheets.map((timesheet) => (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                  }}
                  key={timesheet.id}
                >
                  <div className="timesheet-entry-wrapper">
                    <div className="timesheet-entry-icon-container">
                      <img
                        className="avatar-icon"
                        src={`${avatarURL}${timesheet.user_avatar}.png`}
                        alt="Icon of the user-avatar"
                      />
                    </div>
                    <div className="timesheet-list-info">
                      <h4>{timesheet.user_name}</h4>
                      <p>
                        {formatEventDateTime(timesheet.month, {
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="timesheet-list-status-toggle">
                      <p>{timesheet.status}</p>
                      {expandedtoggleId === Number(timesheet.id) ? (
                        <ArrowDown
                          onClick={() =>
                            setExpandedToggleId(
                              expandedtoggleId === Number(timesheet.id)
                                ? null
                                : Number(timesheet.id),
                            )
                          }
                        />
                      ) : (
                        <ArrowRight
                          onClick={() =>
                            setExpandedToggleId(
                              expandedtoggleId === Number(timesheet.id)
                                ? null
                                : Number(timesheet.id),
                            )
                          }
                        />
                      )}
                    </div>
                  </div>
                  {expandedtoggleId === Number(timesheet.id) && (
                    <div className="entries-container">
                      {entries
                        .filter(
                          (userEntry) =>
                            userEntry.user_id === timesheet.user_id &&
                            formatEventDateTime(userEntry.work_date, {
                              month: "short",
                            }) ===
                              formatEventDateTime(timesheet.month, {
                                month: "short",
                              }),
                        )
                        .map((entry, index) => (
                          <div className="entry-list-container">
                            <div
                              style={{
                                backgroundColor:
                                  companyColors[index % companyColors.length],
                              }}
                              className="entries-icon-container"
                            >
                              <Building2 className="draft-building-icon" />
                            </div>
                            <div className="entry-list-user-specifics">
                              <h4>{entry.company_name}</h4>
                              <p>
                                {formatEventDateTime(entry.work_date, {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                              <p style={{ width: "80%" }}>
                                {entry.description}
                              </p>
                            </div>
                            <div className="entry-list-specifics">
                              <p style={{ textWrap: "nowrap" }}>
                                {entry.hours_worked} h
                              </p>
                              <p>€{entry.hourly_rate.split(".00")}/h</p>
                              <p>
                                €
                                {Number(entry.hourly_rate) *
                                  Number(entry.hours_worked)}{" "}
                              </p>
                            </div>
                          </div>
                        ))}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          width: "100%",
                          justifyContent: "space-evenly",
                          paddingTop: "1rem",
                        }}
                        key="approve"
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                          key="hours"
                        >
                          <div
                            style={{ backgroundColor: "rgb(232, 240, 252)" }}
                            className="summary-icon-wrapper"
                          >
                            <Clock
                              style={{ color: "rgb(67, 150, 196)" }}
                              height={34}
                              width={34}
                            />
                          </div>
                          <div className="total-hours-container">
                            <p className="total-hours-title">Total Hours:</p>
                            <p>
                              {entries
                                .filter(
                                  (entry) =>
                                    entry.user_id === timesheet.user_id &&
                                    formatEventDateTime(entry.work_date, {
                                      month: "short",
                                    }) ===
                                      formatEventDateTime(timesheet.month, {
                                        month: "short",
                                      }),
                                )
                                .reduce(
                                  (total, entry) =>
                                    total + Number(entry.hours_worked),
                                  0,
                                )}
                              h
                            </p>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                          key="salary"
                        >
                          <div
                            style={{ backgroundColor: "rgb(232, 240, 252)" }}
                            className="summary-icon-wrapper"
                          >
                            <CircleDollarSign
                              style={{ color: "rgb(67, 150, 196)" }}
                              height={34}
                              width={34}
                            />
                          </div>
                          <div className="total-salary-container">
                            <p className="total-salary-title">Total Cost:</p>
                            <p>
                              €
                              {entries
                                .filter(
                                  (entry) =>
                                    entry.user_id === timesheet.user_id &&
                                    formatEventDateTime(entry.work_date, {
                                      month: "short",
                                    }) ===
                                      formatEventDateTime(timesheet.month, {
                                        month: "short",
                                      }),
                                )
                                .reduce(
                                  (total, entry) =>
                                    total +
                                    Number(entry.hourly_rate) *
                                      Number(entry.hours_worked),
                                  0,
                                )
                                .toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: ".5rem",
                          width: "100%",
                          marginTop: ".5rem",
                          borderTop: "1px solid #ccc",
                        }}
                        key="judgement"
                      >
                        <button
                          className="reject-button"
                          onClick={async() => {
                            const response = await handleApproval(timesheet.id, token, "reject");
                            if (response) {
                              handleRefresh();
                            }
                          }}
                        >
                          Reject
                        </button>
                        <button
                          className="edit-button"
                          onClick={async() => {
                            const response = await handleApproval(timesheet.id, token, "edit");
                            if (response) {
                              handleRefresh();
                            }
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="approve-button"
                          onClick={async() => {
                            const response = await handleApproval(timesheet.id, token, "approve");
                            if (response) {
                              handleRefresh();
                            }
                          }}
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </section>
      </LayoutWrapper>
    </>
  );
}
