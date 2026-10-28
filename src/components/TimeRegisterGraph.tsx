import { useEffect, useRef, useState } from "react";
import "../assets/styles/filterToggles.css";
import "../assets/styles/graphs.css";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { formatDoughnutData, formatGraphData, weekRange } from "../lib/functions";
import type { Filter } from "../lib/types";
import { Bar, Doughnut } from "react-chartjs-2";
import { formatEventDateTime } from "../lib/functions";
// import { formatWeekTime } from "../lib/functions";
import { barOptions, doughnutOptions } from "../lib/chartConfig";
import { X } from "lucide-react";
import { useCountUp } from "../hooks/useCountUp";

interface RefreshProps{
  refresh:boolean
}

export default function TimeRegisterGraph({refresh}: RefreshProps) {


  interface GraphType {
    id: string;
    company_id: string;
    company_name: string;
    work_date: string;
    hours_worked: string;
    filter:Filter
    description?: string;
    mileage?: string;
    expense?: string;
    status?: string;
  }


  const navigate = useNavigate()
  const { token } = useAuth();
  const [filter, setGraphFilter] = useState<Filter>("week");
  const [responseData, setResponseData] = useState<GraphType[]>([]);
  // The filter responseData was fetched for; the chart is keyed on it so the bars
  // replay once the new data is in, not with the previous filter's data first
  const [loadedFilter, setLoadedFilter] = useState<Filter>("week");
  const [ringDrawn, setRingDrawn] = useState(false);
  const [currentWeek, setCurrentWeek] = useState<GraphType[]>([])
  const [selectedEntry, setSelectedEntry] = useState<GraphType | null>(null);
  const entryModalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (selectedEntry && entryModalRef.current && !entryModalRef.current.open) {
      entryModalRef.current.showModal();
    }
  }, [selectedEntry]);

  // Start the ring empty and let it draw to its value on the next frame
  useEffect(() => {
    const frame = requestAnimationFrame(() => setRingDrawn(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  function closeEntryModal() {
    entryModalRef.current?.close();
    setSelectedEntry(null);
  }

  useEffect(() => {
    async function getGraph() {
      const checkGraph = await axios({
        method: "get",
        url: `${import.meta.env.VITE_API_URL}/dashboard/graph/${filter}`,
        headers: { Authorization: `Bearer ${token}` },
        data: { filterData: filter },
      });

      const response = checkGraph.data.data;
      setResponseData(response);
      setLoadedFilter(filter);
    }


    getGraph();
  }, [filter, refresh, token]);

  useEffect(() => {
  async function fetchWeekTotal() {
    const response = await axios({
      method: "get",
      url: `${import.meta.env.VITE_API_URL}/dashboard/graph/week`,
      headers: { Authorization: `Bearer ${token}` }
    });


    setCurrentWeek(response.data.data);
  }

  fetchWeekTotal();
}, [token]);

const sortedData = [...responseData].sort(
    (a, b) => new Date(a.work_date).getTime() - new Date(b.work_date).getTime()
  );



const currentHours = currentWeek.reduce((sum, entry) => sum + Number(entry.hours_worked), 0)
const weekTarget = 40;
const currentMonth = new Date().toLocaleDateString("en-US", { month: "short" })
const circumference = 2 * Math.PI * 60
const percentage = Math.min(currentHours / weekTarget, 1)
const offset = ringDrawn ? circumference * (1 - percentage) : circumference
const shownHours = useCountUp(currentHours, 1100)
const totalHours = responseData.reduce((sum, entry) => sum + Number(entry.hours_worked), 0)

const filterOptions: { value: Filter; label: string; range: string }[] = [
  { value: "week", label: "Week", range: weekRange(new Date()) },
  { value: "month", label: "Month", range: currentMonth },
  { value: "year", label: "Year", range: String(new Date().getFullYear()) },
];

// console.log(`Current flex: ${excessHours}hrs`,)
  return (
    <>
      <div className="graph-section-wrapper">
        <div className="week-hour-summary surface-drift grain enter" style={{ "--i": 2 } as React.CSSProperties}>

          <div className="week-summary-data">
          <h4 className="week-summary-title">This week</h4>
          {/* <p>{formatWeekTime(currentDate)}</p> */}
          <p className="week-summary-range">{weekRange(new Date())} {currentMonth} {new Date().getFullYear()}</p>

          <p className="week-sum">{shownHours} <span className="week-sum-unit">hrs</span></p>
          <p className="week-summary-goal">of {weekTarget} hrs</p>
          </div>
          <div className="week-summary-chart">
            <svg width="120" height="120" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="60" fill="none" stroke="rgba(255, 255, 255, .22)" strokeWidth="12" />
              <circle cx="80" cy="80" r="60" fill="none" strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 80 80)"
                style={{
                  stroke: currentHours >= weekTarget ? "var(--live-dot)" : "#fff",
                  transition: "stroke-dashoffset 1.1s var(--ease-out)",
                }}
              />
              {/* 26.7 viewBox units = 20px at the 120px rendered size */}
              <text className="week-summary-percent" x="80" y="89" textAnchor="middle" fontSize="26.7" fill="currentColor">
                {Math.round(percentage * 100)}%
              </text>
            </svg>
          </div>
        </div>

        <div className="filter-section enter" style={{ "--i": 3 } as React.CSSProperties}>
        <p className="reg-hour-title">Registered Hours</p>
        <div
          className="filterToggles timegraph-wrapper"
          style={{
            "--active-index": filterOptions.findIndex((option) => option.value === filter),
            "--option-count": filterOptions.length,
          } as React.CSSProperties}
        >
          <span className="filter-indicator" aria-hidden="true" />
          {filterOptions.map((option) => (
            <button
              type="button"
              key={option.value}
              className={filter === option.value ? "active" : undefined}
              aria-pressed={filter === option.value}
              onClick={() => setGraphFilter(option.value)}
            >
              {option.label}
              <span className="filter-range">{option.range}</span>
            </button>
          ))}
        </div>
        </div>
        {/* Graphs */}
        <div>
          <dialog
            ref={entryModalRef}
            id="entry-detail-modal"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                closeEntryModal();
              }
            }}
            onClose={() => setSelectedEntry(null)}
          >
            <button
              type="button"
              className="close-modal"
              aria-label="Close entry details"
              onClick={closeEntryModal}
            >
              <X width={28} height={28} />
            </button>
            {selectedEntry && (
              <div className="entry-detail-content">
                <h2>Entry details</h2>
                <dl>
                  <div><dt>Company</dt><dd>{selectedEntry.company_name}</dd></div>
                  <div><dt>Date</dt><dd>{formatEventDateTime(selectedEntry.work_date, { year: "numeric", month: "long", day: "numeric" })}</dd></div>
                  <div><dt>Hours worked</dt><dd>{selectedEntry.hours_worked} h</dd></div>
                  <div><dt>Description</dt><dd>{selectedEntry.description || "—"}</dd></div>
                  {selectedEntry.mileage !== undefined && selectedEntry.mileage !== "" && (
                    <div><dt>Mileage</dt><dd>{selectedEntry.mileage}</dd></div>
                  )}
                  {selectedEntry.expense !== undefined && selectedEntry.expense !== "" && (
                    <div><dt>Expense</dt><dd>{selectedEntry.expense}</dd></div>
                  )}
                  <div><dt>Status</dt><dd>{selectedEntry.status || "—"}</dd></div>
                </dl>
              </div>
            )}
          </dialog>

          <section className="chart-card enter" style={{ "--i": 4 } as React.CSSProperties}>
            <div className="chart-card-header">
              <h3 className="chart-card-title">Hours logged</h3>
              <span className="chart-card-total">{totalHours} hrs</span>
            </div>
            {responseData && responseData.length > 0 ? (
              loadedFilter === "month" ?
                <Doughnut
                  key={loadedFilter}
                  className="donut-graph"
                  data={formatDoughnutData(responseData)}
                  options={doughnutOptions}
                />
              :
                <Bar
                  key={loadedFilter}
                  data={formatGraphData(responseData, loadedFilter)}
                  options={barOptions}/>
            ) : (
              <p className="missing-graph-data">No hours logged at these dates, report at <a href="/time-report">Time-report</a></p>
            )}
          </section>

          {responseData && responseData.length > 0 && (
              <div className="graph-table-container">
                <h3>Recent Entries:</h3>
                <table
                className="graph_data"
                >

                  <thead>
                    <tr className="graph-data-headers">
                      <th>Date</th>
                      <th>Company</th>
                      <th>hours</th>
                    </tr>
                  </thead>


                  <tbody>

                    {responseData && sortedData.slice(-5).reverse().map((p) => (
                      <tr key={p.id} className="entry-row"
                        onClick={() => setSelectedEntry(p)}
                      >

                        <td>{formatEventDateTime(p.work_date)}</td>
                        <td>
                          <a
                            href={`/company/${p.company_name}`}
                            style={{ textDecoration: "underline" }}
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              closeEntryModal();
                              navigate(`/company/${p.company_name}`, { state: { id: p.company_id } });
                            }}
                          >
                            {p.company_name}
                          </a>
                        </td>
                        <td>{p.hours_worked}</td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
          )}
        </div>
      </div>
    </>
  );
}
