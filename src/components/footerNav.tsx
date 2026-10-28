import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import "../assets/styles/footerNav.css";
import { CalendarClock, ChartColumnDecreasing, ClipboardClock, GalleryHorizontalEnd } from "lucide-react";
import { useNavIndicator } from "../hooks/useNavIndicator";

const links = ["/time-report", "/history", "/statistics", "/timesheets"];

export default function FooterNav() {

  const linkSelected = window.location.pathname;
  const activeIndex = useNavIndicator(links.indexOf(linkSelected));


  return (
    <footer className="footerNav" style={{ "--active-index": activeIndex, "--count": links.length } as CSSProperties}>
      <span className="nav-indicator" aria-hidden="true" />
      <div>
        <Link className={linkSelected === "/time-report" ? "nav-link selected" : "nav-link"} to="/time-report"><CalendarClock />Time Report</Link>
      </div>
      <div>
        <Link className={linkSelected === "/history" ? "nav-link selected" : "nav-link"} to="/history"><GalleryHorizontalEnd />History</Link>
      </div>
      <div>
        <Link className={linkSelected === "/statistics" ? "nav-link selected" : "nav-link"} to="/statistics"><ChartColumnDecreasing />Statistics</Link>
      </div>
      <div>
        <Link className={linkSelected === "/timesheets" ? "nav-link selected" : "nav-link"} to="/timesheets"><ClipboardClock />Timesheets</Link>
      </div>
    </footer>
  );
}
