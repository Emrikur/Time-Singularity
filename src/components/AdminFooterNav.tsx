import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import "../assets/styles/footerNav.css";
import { CalendarClock, ChartColumnDecreasing, ClipboardClock, GalleryHorizontalEnd } from "lucide-react";
import { useNavIndicator } from "../hooks/useNavIndicator";

const links = ["/user-creation", "/users-hub", "/approvals", "/statistics"];

export default function AdminFooterNav() {

  const linkSelected = window.location.pathname;
  const activeIndex = useNavIndicator(links.indexOf(linkSelected));


  return (
    <footer className="footerNav" style={{ "--active-index": activeIndex, "--count": links.length } as CSSProperties}>
      <span className="nav-indicator" aria-hidden="true" />
      <div>
        <Link className={linkSelected === "/user-creation" ? "nav-link selected" : "nav-link"} to="/user-creation"><CalendarClock />Create User</Link>
      </div>
      <div>
        <Link className={linkSelected === "/users-hub" ? "nav-link selected" : "nav-link"} to="/users-hub"><GalleryHorizontalEnd />Users</Link>
      </div>
      <div>
        <Link className={linkSelected === "/approvals" ? "nav-link selected" : "nav-link"} to="/approvals"><ClipboardClock />Approvals</Link>
      </div>
      <div>
        <Link className={linkSelected === "/statistics" ? "nav-link selected" : "nav-link"} to="/statistics"><ChartColumnDecreasing />Statistics</Link>
      </div>
    </footer>
  );
}
