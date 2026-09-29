import '../assets/styles/settings.css'
import LayoutWrapper from "../components/LayoutWrapper";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LogOut, X, RectangleEllipsis } from "lucide-react";
import ChangePasswordForm from '../components/ChangePasswordForm';




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
          style={{ display: "flex", flexDirection: "column" }}
        >
          <button
            type="button"
            style={{
              background: "transparent",
              border: "none",
              padding: "0",
              cursor: "none",
              display: "flex",
            }}
            className="close-modal"
            {...({
              command: "close",
              commandfor: "password-modal",
            } as React.HTMLAttributes<HTMLButtonElement>)}
          >
            <X
              style={{ marginLeft: "auto" }}

              width={32}
              height={32}
            />
          </button>
          <div className="modal-form-container">
            <p style={{ width: "90%", fontWeight:"300" }}>
              Here you can change your password. Just enter a new password and confirm it by entering it again. <br />Make sure to choose a strong password with at least <strong>8 characters</strong>  that you haven't used before for better security.
            </p>
          </div>
          <ChangePasswordForm/>
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
          <div className='default-Btn'>
          <button

          type="button"
          style={{
              background: "transparent",
              border: "none",
              padding: "0",
              cursor: "none",
              display: "flex",
              color:"white",
              fontSize:"16px",
              gap:"5px"
            , alignItems:"center"
            }}


            {...({
              command: "show-modal",
              commandfor: "password-modal",
            } as React.HTMLAttributes<HTMLButtonElement>)} >
            <RectangleEllipsis name='change-password' />
           <label htmlFor="change-password">Change Password</label>
          </button>

          </div>

          <div onClick={handleLogout} className="default-Btn" >
            {<LogOut name="logoutButton"  />}
            <label htmlFor="logoutbutton">Log out</label>
          </div>
        </div>
      </section>
    </LayoutWrapper>
  );
}
