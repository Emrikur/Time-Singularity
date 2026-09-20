import { useEffect, useRef, useState } from "react";
import "../assets/styles/graphs.css";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { formatDoughnutData, formatGraphData, weekRange } from "../lib/functions";
import type { Filter } from "../lib/types";
import { Bar, Doughnut } from "react-chartjs-2";
import { formatEventDateTime } from "../lib/functions";
// import { formatWeekTime } from "../lib/functions";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { X } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
);

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
  const [currentWeek, setCurrentWeek] = useState<GraphType[]>([])
  const [selectedEntry, setSelectedEntry] = useState<GraphType | null>(null);
  const entryModalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (selectedEntry && entryModalRef.current && !entryModalRef.current.open) {
      entryModalRef.current.showModal();
    }
  }, [selectedEntry]);

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
const offset = circumference * (1 - percentage)

const barOptions = {
  responsive:true,
  maintainAspectRatio:true,
  aspectRatio:1.2,
  plugins: {
    legend:{
      labels: {
        font:{size:16, weight:"bold" as const},
        size: 16,
        padding: 10,
       boxWidth:14
      },
      position:"bottom" as const
    },
    datalabels: {
      color: "black" as const,
      font: {
        size: 20,
        weight: "normal" as const,
      }
    }
  }
}
const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 1.0,
  plugins: {
    legend:{
      labels: {
        font:{size:16, weight:"bold" as const},
        size: 16,
        padding: 10,
       boxWidth:14
      },
      position:"bottom" as const
    },
    datalabels: {
      color: "black" as const,
      font: {
        size: 18,
        weight: "normal" as const,
      }
    }
  }
}

// console.log(`Current flex: ${excessHours}hrs`,)
  return (
    <>
      <div className="graph-section-wrapper">
        <div className="week-hour-summary" >

          <div className="week-summary-data">
          <h4 style={{margin:"0", fontWeight:"500"}}>This week</h4>
          {/* <p>{formatWeekTime(currentDate)}</p> */}
          <p style={{marginTop:".5rem"}}>{weekRange(new Date())} {currentMonth} {new Date().getFullYear()}</p>

          {currentHours ? <p className="week-sum">{currentHours} <span style={{fontWeight:"500", fontSize:"16px"}}>hrs</span></p>  : <p className="week-sum">0<span style={{fontWeight:"500", fontSize:"16px"}}>hrs</span></p> }
          <p>out of 40 hrs</p>
          </div>
          <div className="week-summary-chart">
            <svg width="125" height="125" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="60" fill="none" stroke="#477beb" strokeWidth="16" opacity=".9" />
              <circle cx="80" cy="80" r="60" fill="none" stroke={currentHours >= weekTarget ? "#34B567" : "#e5e7eb"} strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 80 80)"
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
              <text x="80" y="86" textAnchor="middle" fontSize="22" fontWeight="500" fill="currentColor">
                {Math.round(percentage * 100)}%
              </text>
            </svg>
          </div>
        </div>

        <p className="reg-hour-title">Registered Hours</p>
        <div className="timegraph-wrapper">
          <div onClick={() => setGraphFilter("week")} className={
              filter === "week"
                ? "graph-week-selected"
                : "graph-week-unselected"
            }>
          <p style={{margin:"0", padding:"0"}}


          >
            Week
          </p>
          <p style={{margin:"0", padding:"0", fontSize:"13px"}}>( {weekRange(new Date())} )</p>

          </div>
          <div onClick={() => setGraphFilter("month")} className={
              filter === "month"
                ? "graph-month-selected"
                : "graph-month-unselected"
            }>
          <p style={{margin:"0", padding:"0"}}
          >
            Month
          </p>
          <p style={{fontSize:"13px", margin:"0", padding:"0"}}>( {currentMonth} )</p>
          </div>
          <div onClick={() => setGraphFilter("year")} className={
              filter === "year"
                ? "graph-year-selected"
                : "graph-year-unselected"
            }>
          <p
style={{margin:"0", padding:"0"}}

          >
            Year
          </p>
          <p style={{fontSize:"13px", margin:"0", padding:"0"}}>( {new Date().getFullYear()} )</p>

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

          {responseData && responseData.length > 0 ? (
            <div >
              <div style={{marginBottom:"2rem"}}>

                {filter ==="month" ?

                    <Doughnut
                    className="donut-graph"

                      data={formatDoughnutData(responseData)}
                      options={doughnutOptions}
                    />


                :
                <Bar
                  style={{width:"90vw", height:"auto"}}
                  data={formatGraphData(responseData, filter)}
                  options={barOptions}/>}

              </div>
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
                      <tr key={p.id} style={{ cursor: "pointer" }}
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
            </div>
          ) : (

              <p className="missing-graph-data">No hours logged at these dates, report at <a href="/time-report">Time-report</a></p>


          )}
        </div>
      </div>
    </>
  );
}
