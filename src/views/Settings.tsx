import '../assets/styles/settings.css'
import LayoutWrapper from "../components/LayoutWrapper";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LogOut, X, RectangleEllipsis, Percent } from "lucide-react";
import ChangePasswordForm from '../components/ChangePasswordForm';
import TaxSettingsForm from '../components/TaxSettingsForm';
import { closeOnBackdrop } from "../lib/dialog";




export default function Settings() {


  const navigate = useNavigate();

  const { logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <LayoutWrapper>
      <section style={{minHeight:"70vh"}}>

        <h1 style={{textAlign:"center"}} >Settings</h1>
        <dialog // Fick nos om command/commandfor via Kevin Powell på instagram, väldigt smidigt sätt att hantera modaler på!
          id="password-modal"
          className="sheet"
          aria-labelledby="password-modal-title"
          {...({ closedby: "any" } as React.DialogHTMLAttributes<HTMLDialogElement>)}
          onClick={closeOnBackdrop}
        >
          <span className="sheet-handle" aria-hidden="true" />
          <div className="sheet-header">
            <h2 id="password-modal-title" className="sheet-title">Change password</h2>
            <button
              type="button"
              className="sheet-close press"
              aria-label="Close"
              {...({
                command: "close",
                commandfor: "password-modal",
              } as React.HTMLAttributes<HTMLButtonElement>)}
            >
              <X width={20} height={20} aria-hidden="true" />
            </button>
          </div>
          <p className="sheet-intro">
            Here you can change your password. Just enter a new password and confirm it by entering it again. Make sure to choose a strong password with at least <strong>8 characters</strong> that you haven't used before for better security.
          </p>
          <ChangePasswordForm/>
        </dialog>
        <dialog
          id="tax-modal"
          className="sheet"
          aria-labelledby="tax-modal-title"
          {...({ closedby: "any" } as React.DialogHTMLAttributes<HTMLDialogElement>)}
          onClick={closeOnBackdrop}
        >
          <span className="sheet-handle" aria-hidden="true" />
          <div className="sheet-header">
            <h2 id="tax-modal-title" className="sheet-title">Tax estimate</h2>
            <button
              type="button"
              className="sheet-close press"
              aria-label="Close"
              {...({
                command: "close",
                commandfor: "tax-modal",
              } as React.HTMLAttributes<HTMLButtonElement>)}
            >
              <X width={20} height={20} aria-hidden="true" />
            </button>
          </div>
          <p className="sheet-intro">
            Choose the tax rate used to estimate your net earnings in Statistics and on timesheet PDFs. It's only an estimate, your actual tax can differ.
          </p>
          <TaxSettingsForm/>
        </dialog>
      {/* <div style={{marginLeft:"auto"}} className="language-toggle-container">

          <div className="checkbox-wrapper-10">
            <input type="checkbox" id="cb5" className="tgl tgl-flip" />
            <label
              htmlFor="cb5"
              data-tg-on="Sv"
              data-tg-off="En"
              className="tgl-btn"
            ></label>
          </div>
        </div> */}
        <div className='settings-btn-wrapper'>
          <button
            type="button"
            className="default-Btn press"
            {...({
              command: "show-modal",
              commandfor: "password-modal",
            } as React.HTMLAttributes<HTMLButtonElement>)} >
            <RectangleEllipsis aria-hidden="true" />
            Change Password
          </button>

          <button
            type="button"
            className="default-Btn press"
            {...({
              command: "show-modal",
              commandfor: "tax-modal",
            } as React.HTMLAttributes<HTMLButtonElement>)} >
            <Percent aria-hidden="true" />
            Tax Estimate
          </button>

          <button type="button" onClick={handleLogout} className="default-Btn press">
            <LogOut aria-hidden="true" />
            Log out
          </button>
        </div>
      </section>
    </LayoutWrapper>
  );
}
