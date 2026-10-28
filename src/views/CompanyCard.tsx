import { Link, useLocation, useParams } from "react-router-dom";
import "../assets/styles/companyCard.css";
import LayoutWrapper from "../components/LayoutWrapper";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { useTilt } from "../hooks/useTilt";

export default function CompanyCard() {
  const location = useLocation();
  const { id } = location.state;
  const { token } = useAuth();

  interface CompanyType {
    id: string;
    company_name: string;
    phone: string;
    email: string;
    industry: string;
    org_number: string;
    is_active: boolean;
  }
  const [companyResponse, setCompanyResponse] = useState<CompanyType | null>(
    null,
  );

  useEffect(() => {
    async function fetchCompanyData() {
      try {
        const response = await axios({
          method: "get",
          url: `${import.meta.env.VITE_API_URL}/company/user/${id}`,
          headers: { Authorization: `Bearer ${token}` },
        });

        setCompanyResponse(response.data[0]);
      } catch (error) {
        console.error("Could not load company", error);
      }
    }
    fetchCompanyData();
    // console.log("Company response: ", companyResponse);
  }, []);

  const params = useParams();
  const plateRef = useRef<HTMLDivElement>(null);
  const { needsPermission, requestPermission } = useTilt(plateRef, { max: 8 });

  const name = params.companyname ?? companyResponse?.company_name ?? "";
  // First letters of the first two words, skipping symbols like "&"
  const initials = name.split(/\s+/).filter((word) => /^[\p{L}\p{N}]/u.test(word)).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
  const status = companyResponse ? (companyResponse.is_active ? "Active" : "Inactive") : null;

  return (
    <LayoutWrapper>
      <section className="company-card-wrapper">
        <Link className="company-back-link" to="/dashboard">
          <ArrowLeft size={18} aria-hidden="true" />
          Back to dashboard
        </Link>
        {/* The drift/grain sit on .plate-surface: .grain's overflow and isolation
            would flatten the 3D needed for the floating bottom block */}
        <div className="company-plate-scene">
          <div
            ref={plateRef}
            className="company-title-container"
            onClick={needsPermission ? requestPermission : undefined}
          >
            <span className="plate-surface surface-drift grain" aria-hidden="true" />
            <div className="plate-top">
              <span className="plate-monogram" aria-hidden="true">{initials}</span>
              {status && (
                <span className="plate-status">
                  <span className={companyResponse?.is_active ? "status-indicator-green" : "status-indicator-red"} aria-hidden="true" />
                  {status}
                </span>
              )}
            </div>
            <div className="plate-bottom">
              {companyResponse?.industry && <p className="plate-industry">{companyResponse.industry}</p>}
              <h1 className="plate-name">{name}</h1>
              {companyResponse?.org_number && <p className="plate-org">Org. no. {companyResponse.org_number}</p>}
            </div>
            {/* The hint's click bubbles to the plate, which asks for permission */}
            {needsPermission && (
              <button type="button" className="plate-hint">
                Tap to enable tilt
              </button>
            )}
          </div>
        </div>

        <h2 className="company-details-title">Contact and details</h2>
        <dl className="company-details">
          <div className="details">
            <dt>Phone number</dt>
            <dd>
              {companyResponse?.phone ? (
                <a className="details-link" href={`tel:${companyResponse.phone.replace(/[^d+]/g, "")}`}>
                  {companyResponse.phone}
                  <Phone size={20} aria-hidden="true" />
                </a>
              ) : "—"}
            </dd>
          </div>
          <div className="details">
            <dt>Mail address</dt>
            <dd>
              {companyResponse?.email ? (
                <a className="details-link" href={`mailto:${companyResponse.email}`}>
                  {companyResponse.email}
                  <Mail size={20} aria-hidden="true" />
                </a>
              ) : "—"}
            </dd>
          </div>
          <div className="details">
            <dt>Industry</dt>
            <dd>{companyResponse?.industry || "—"}</dd>
          </div>
          <div className="details">
            <dt>Organization number</dt>
            <dd className="details-number">{companyResponse?.org_number || "—"}</dd>
          </div>
        </dl>
      </section>
    </LayoutWrapper>
  );
}
