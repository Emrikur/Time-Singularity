import Login from "../components/login";
import logo from "../assets/images/navbar-square-logo.png";
import "../assets/styles/loginPage.css";
export default function LoginPage() {
  return (
    <>
      <main className="login-main">
        {/* <div className="language-toggle-container">

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
        <div className="login-wrapper">
          <img id="login-logo" src={logo} alt="Logo" />
          <Login />
        </div>
      </main>
    </>
  );
}
