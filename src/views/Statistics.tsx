import "../assets/styles/statistics.css";
import "../assets/styles/graphs.css";
import LayoutWrapper from "../components/LayoutWrapper";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import { Bar, Doughnut } from "react-chartjs-2";
import { barOptions, doughnutOptions } from "../lib/chartConfig";
import {
  fetchCompanyStatistics,
  fetchStatisticsEntries,
  fetchTaxSettings,
  formatDoughnutData,
  formatGraphData,
  formatSEK,
  toLocalDate,
} from "../lib/functions";
import type { CompanyStatisticsTypes, StatisticsEntryTypes, TaxSettings } from "../lib/types";
import { estimateTax, formatTaxLabel } from "../lib/tax";

function formatHours(hours: number) {
  return Number(hours.toFixed(2));
}

export default function Statistics() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<StatisticsEntryTypes[]>([]);
  const [companies, setCompanies] = useState<CompanyStatisticsTypes[]>([]);
  const [taxSettings, setTaxSettings] = useState<TaxSettings | null>(null);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    // Loaded separately so one section still shows if the other request fails
    Promise.allSettled([
      fetchStatisticsEntries(token),
      fetchCompanyStatistics(token),
      fetchTaxSettings(token),
    ]).then(([entryResult, companyResult, taxResult]) => {
      if (entryResult.status === "fulfilled") {
        setEntries(entryResult.value);
      } else {
        toast.error("Could not load statistics");
      }

      if (companyResult.status === "fulfilled") {
        setCompanies(companyResult.value);
      } else {
        toast.error("Could not load company statistics");
      }

      // Without tax settings the net estimate is just hidden
      if (taxResult.status === "fulfilled") {
        setTaxSettings(taxResult.value);
      }
    });
  }, [navigate, token]);

  const totalHours = entries.reduce((sum, entry) => sum + Number(entry.hours_worked), 0);
  // hourly_rate comes from the users table via the backend, the same on every row
  const hourlyRate = entries.length > 0 ? Number(entries[0].hourly_rate) : 0;
  const totalEarnings = totalHours * hourlyRate;
  const taxEstimate = taxSettings ? estimateTax(totalEarnings, taxSettings) : null;

  const currentYear = new Date().getFullYear();
  const currentYearEntries = entries.filter(
    (entry) => toLocalDate(entry.work_date).getFullYear() === currentYear,
  );

  return (
    <LayoutWrapper>
      <section className="statistics-wrapper">
        <h1>Statistics</h1>

        <div className="statistics-summary">
          <div className="statistics-card">
            <p className="statistics-card-label">Total hours</p>
            <p className="statistics-card-value">
              {formatHours(totalHours)} <span>hrs</span>
            </p>
          </div>
          <div className="statistics-card">
            <p className="statistics-card-label">Total earnings</p>
            <p className="statistics-card-value">{formatSEK(totalEarnings)}</p>
          </div>
          {taxSettings && taxEstimate ? (
            <div className="statistics-card">
              <p className="statistics-card-label">
                Est. net earnings ({formatTaxLabel(taxSettings)} tax)
              </p>
              <p className="statistics-card-value">{formatSEK(taxEstimate.net)}</p>
            </div>
          ) : null}
          <div className="statistics-card">
            <p className="statistics-card-label">Companies</p>
            <p className="statistics-card-value">{companies.length}</p>
          </div>
        </div>

        <div className="statistics-chart">
          <h2>Hours per month ({currentYear})</h2>
          {currentYearEntries.length > 0 ? (
            <Bar data={formatGraphData(currentYearEntries, "year")} options={barOptions} />
          ) : (
            <p className="missing-graph-data">No hours logged this year</p>
          )}
        </div>

        <div className="statistics-chart">
          <h2>Hours per company</h2>
          {entries.length > 0 ? (
            <Doughnut
              className="donut-graph"
              data={formatDoughnutData(entries)}
              options={doughnutOptions}
            />
          ) : (
            <p className="missing-graph-data">No hours logged yet</p>
          )}
        </div>

        <div className="statistics-companies">
          <h2>My Companies</h2>
          {companies.length > 0 ? (
            <ul className="statistics-company-list">
              {companies.map((company) => {
                const companyHours = Number(company.total_hours);
                const percentage = totalHours > 0 ? (companyHours / totalHours) * 100 : 0;

                return (
                  <li className="statistics-company" key={company.id}>
                    <div className="statistics-company-header">
                      <a
                        href={`/company/${company.company_name}`}
                        onClick={(event) => {
                          event.preventDefault();
                          navigate(`/company/${company.company_name}`, { state: { id: company.id } });
                        }}
                      >
                        {company.company_name}
                      </a>
                      <span>{Math.round(percentage)}%</span>
                    </div>
                    <div className="statistics-company-bar" aria-hidden="true">
                      <div style={{ width: `${percentage}%` }} />
                    </div>
                    <div className="statistics-company-details">
                      <span>{formatHours(companyHours)} hrs</span>
                      <span>{formatSEK(Number(company.total_earnings))}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="missing-graph-data">You are not assigned to any companies</p>
          )}
        </div>
      </section>
    </LayoutWrapper>
  );
}
