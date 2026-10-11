// import { use } from 'react';
import "../assets/styles/header.css";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { avatarSrc } from "../lib/avatars";
// import logo from "../assets/images/navbar-square-logo.png"

export default function Header() {
  const { username, avatar } = useAuth();
  const navigate = useNavigate();
  function toUserPage() {
    navigate(`/${username}`);
  }

  const currentAvatar = avatarSrc(avatar)
  function toDashboard() {
    navigate(`/dashboard`);
  }
  return (
    <>
      <header className="header">
        <div className="mobile-logo-header">

            <h1 id="logo-company-header">Time Singularity</h1>

        </div>
        <div className="userHub">
          <h2 onClick={toDashboard} style={{fontSize:"1rem", margin:"0", padding:"0", fontFamily: "'Manrope', sans-serif" }}>Dashboard</h2>{/* <House  height={35} width={35} onClick={toDashboard}/> */}
          <img id="user-avatar" onClick={toUserPage} src={currentAvatar} alt="an image-link to the user page of a oil painted bear, sitting." />
        </div>
      </header>
    </>
  );
}
