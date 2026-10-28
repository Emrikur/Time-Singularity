import "../assets/styles/dashboard.css";
import QuickLogModal from "../components/QuickLogModal";
import LayoutWrapper from "../components/LayoutWrapper";
import { useAuth } from "../hooks/useAuth";
import TimeRegisterGraph from "../components/TimeRegisterGraph";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { closeOnBackdrop } from "../lib/dialog";


export default function Dashboard() {
  const { username } = useAuth();

  // const [modalOpen, setModalOpen] = useState(false);
const [refresh, setRefresh] = useState(false)



function onEntryCreation(){
  setRefresh((prev) => !prev)
}

  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  //Scroll to top on view refresh
  //###############################

  function ScrollUp() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    ScrollUp();
  }, []);

  return (
    <LayoutWrapper>
      <section className="dashboard-section-wrapper">
        <dialog // Fick nos om command/commandfor via Kevin Powell på instagram, väldigt smidigt sätt att hantera modaler på!
          id="log-modal"
          className="sheet"
          aria-labelledby="log-modal-title"
          // closedby="any" closes on a backdrop tap natively; onClick covers browsers without it
          {...({ closedby: "any" } as React.DialogHTMLAttributes<HTMLDialogElement>)}
          onClick={closeOnBackdrop}
        >
          <span className="sheet-handle" aria-hidden="true" />
          <div className="sheet-header">
            <h2 id="log-modal-title" className="sheet-title">Log time</h2>
            <button
              type="button"
              className="sheet-close press"
              aria-label="Close"
              {...({
                command: "close",
                commandfor: "log-modal",
              } as React.HTMLAttributes<HTMLButtonElement>)}
            >
              <X width={20} height={20} aria-hidden="true" />
            </button>
          </div>
          <p className="sheet-intro">
            Log your hours quickly by selecting a company, entering the date
            and number of hours worked. For more detailed reporting, visit the
            full report page.
          </p>
          <QuickLogModal onNewEntry={onEntryCreation} />
        </dialog>


        {/* .enter plays once when these mount; --i staggers them */}
        <div className="dashboard-header enter" style={{ "--i": 0 } as React.CSSProperties}>
          <h1>Dashboard</h1>
        </div>
        <div className="dashboard-hero grain grain--soft enter" style={{ "--i": 1 } as React.CSSProperties}>
          <div className="welcome-message">
            <p className="hero-date">{today}</p>
            <p className="hero-greeting">Good day, {username}</p>
          </div>
          <div className="log-entry">
            <button
              className="log-entry-btn press"
              type="button"
              aria-label="Log entry"
              {...({
                command: "show-modal",
                commandfor: "log-modal",
              } as React.HTMLAttributes<HTMLButtonElement>)}
            >
              <Plus width={24} height={24} strokeWidth={2.4} aria-hidden="true" />
            </button>
            <span className="log-entry-label" aria-hidden="true">Log entry</span>
          </div>
        </div>
        <section>
          <TimeRegisterGraph refresh={refresh} />
        </section>
      </section>
    </LayoutWrapper>
  );
}
