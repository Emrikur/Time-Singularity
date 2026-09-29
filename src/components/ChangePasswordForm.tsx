import { useState } from "react";
import "../assets/styles/changePassword.css";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
export default function ChangePasswordForm() {



const [errorMsg, setErrorMsg] = useState("")
const [successMsg, setSuccessMsg] = useState("")
const {token, email} = useAuth()
const isGuest = email === "guest@ts.com";


  async function handleForm(event: React.FormEvent<HTMLFormElement>) {
    setErrorMsg("")
    setSuccessMsg("")
    event.preventDefault();
    const form = event.currentTarget;

    const newPassword = form["new-password"].value;
    const confirmPassword = form["confirm-password"].value;
    const currentPassword = form["current-password"].value;



    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please try again.");

      setTimeout(() => {
        setErrorMsg("")
      }, 3000);
      return;
    }else if (newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");

      setTimeout(() => {
        setErrorMsg("")
      }, 3000);
    }else if(newPassword === currentPassword){
      setErrorMsg("New password cannot be the same as the current password.");

      setTimeout(() => {
        setErrorMsg("")
      }, 3000);
    } else {

      try {

        const response = await axios({
          method: "put",
          url: `${import.meta.env.VITE_API_URL}/user/change-password`,
          headers: { Authorization: `Bearer ${token}` },
          data: {
            current_password: currentPassword,
            new_password: newPassword,
          }
        });

        const data = response.data;
        if(data.success){
          setSuccessMsg(data.message);
          setErrorMsg("");
          setTimeout(() => {
            setSuccessMsg("")
          }, 3000);
          console.log("Password changed successfully!");
          (document.getElementById("new-password") as HTMLInputElement).value = "";
          (document.getElementById("confirm-password") as HTMLInputElement).value = "";
          (document.getElementById("current-password") as HTMLInputElement).value = "";
        } else
        if (!data.success) {
          setErrorMsg(data.message || "Failed to change password. Please try again.");
          setSuccessMsg("");
          setTimeout(() => {
            setErrorMsg("")
          }, 3000);
          (document.getElementById("new-password") as HTMLInputElement).value = "";
          (document.getElementById("confirm-password") as HTMLInputElement).value = "";
          (document.getElementById("current-password") as HTMLInputElement).value = "";
          return;
        }
      } catch (error) {
        setErrorMsg("An error occurred while changing the password. Please try again.");
        setSuccessMsg("");
        setTimeout(() => {
          setErrorMsg("")
        }, 3000);
        (document.getElementById("new-password") as HTMLInputElement).value = "";
        (document.getElementById("confirm-password") as HTMLInputElement).value = "";
        (document.getElementById("current-password") as HTMLInputElement).value = "";
        console.error("Error changing password: ", error);
      }
    }
  }



  return (
    <form onSubmit={handleForm} className="change-password-form">
      <div className="form-input-group">
        <label htmlFor="new-password">New Password:</label>
        <input
          type="password"
          id="new-password"
          name="new-password"
          required
          placeholder="Enter new password"
        />

        <label htmlFor="confirm-password">Confirm Password:</label>
        <input
          type="password"
          id="confirm-password"
          name="confirm-password"
          required
          placeholder="Confirm new password"
        />

        <label htmlFor="current-password">Current Password:</label>
        <input
          type="password"
          id="current-password"
          name="current-password"
          required
          placeholder="Enter current password"
        />

      </div>

      {errorMsg ? <p className="error">{errorMsg}</p> : null}
      {successMsg ? <p className="success">{successMsg}</p> : null}

      <button disabled={isGuest} type="submit" className="default-Btn">
        Change Password
      </button>
    </form>
  );
}
