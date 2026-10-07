import "../assets/styles/login.css";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { toast } from 'react-toastify';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); // I Auth Provider (Frontendet)
  const [answer, setAnswer] = useState("");


  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;



    try {
      event.preventDefault();


      const checkLogin = await axios({
        method: "post",
        url: `${import.meta.env.VITE_API_URL}/auth/login`,
        data: {
          email: form.email.value,
          password: form.password.value,
        },
      });

      if (checkLogin.data.success === true) {
        const response = checkLogin.data;
        setAnswer(response.message);
        setTimeout(() => {
          login(response.token, response.email, response.full_name, response.role, response.avatar);
          navigate("/dashboard");

        }, 3000);


      } else if(checkLogin.data.success === false) {
        const response = checkLogin.data;

        toast(response.message);
      }
    } catch (error) {
      // 400/401/429 skickar ett meddelande från backend, visa det om det finns
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast(error.response.data.message);
      } else {
        console.error(error);
        toast("An error occurred during login");
      }
    }
  }

  return (
    <>
      <div className="login-container">
        {/* <h1 style={{fontFamily:"var(--TimeburnerBold)"}}>Time Singularity</h1> */}
        <form className="login-form" onSubmit={submitForm}>
          <input
            name="email"
            className="login-input"
            type="email"
            placeholder="Email"
          />
          <input
            name="password"
            className="login-input"
            type="password"
            placeholder="Password"
          />

          {!answer ? (
            <button className="login-button" type="submit">
              Login
            </button>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <p>{answer}</p>
              <div className="loader"></div>
            </div>
          )}

        </form>

        <div className="guestBox">
          <p>Guest account:</p>
          <p>Email: Guest@ts.com</p>
          <p>Password: guest</p>
        </div>
      </div>
    </>
  );
}
