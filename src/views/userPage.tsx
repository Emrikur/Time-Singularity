import { useAuth } from "../hooks/useAuth";
import "../assets/styles/userPage.css"
import LogoutBtn from "../components/LogoutBtn";
import LayoutWrapper from "../components/LayoutWrapper";
import AvatarDisplay from "../components/avatarDisplay";
import { Settings, Clock5, Images } from "lucide-react";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { AVATARS } from "../lib/avatars";

import axios from "axios";


export default function UserPage() {

  const navigate = useNavigate()



  const [avatarToggle, setavatarToggle] = useState(false)
  const [totalHours, setTotalHours] = useState(0)
  const { username, role, email, token, avatar, updateAvatar } = useAuth();
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const isGuest = email === "guest@ts.com";
  const hasNewAvatar = previewAvatar !== null && previewAvatar !== avatar;


  function toggleAvatarPicker() {
    // Closing the picker throws away an unsaved preview
    setPreviewAvatar(null);
    setavatarToggle(!avatarToggle);
  }

  // First tap previews the avatar, tapping the previewed one again saves it
  function handleAvatarClick(selectedAvatar: string) {
    if (selectedAvatar === previewAvatar && hasNewAvatar) {
      saveAvatar();
    } else {
      setPreviewAvatar(selectedAvatar);
    }
  }

  async function saveAvatar() {
    if (!previewAvatar || !hasNewAvatar || isGuest || savingAvatar) return;

    setSavingAvatar(true);
    try {
      await axios({
        method: "put",
        url: `${import.meta.env.VITE_API_URL}/user/avatar`,
        headers: { Authorization: `Bearer ${token}`},
        data:{
          avatarURL:previewAvatar
        }
      });

      // Only update context and sessionStorage once the backend has saved it
      updateAvatar(previewAvatar);
      setPreviewAvatar(null);
      setavatarToggle(false);
      toast.success("Avatar updated");
    } catch (error) {
      console.error("Could not update avatar", error);
      toast.error("Could not update avatar");
    } finally {
      setSavingAvatar(false);
    }
  }

  useEffect(() => {

    async function fetchUserHours() {
      try {
        const response = await axios(`${import.meta.env.VITE_API_URL}/company/total-hours`, {
          method:"get",
          headers: {
            Authorization: `Bearer ${token}`,
          }
        })
        const hoursArray = response.data.map((entry: { hours_worked: string }) => entry.hours_worked);
        const totalHours = hoursArray.reduce((acc: string, hours: string) => acc + Number(hours), 0);
        setTotalHours(totalHours);
      } catch (error) {
        console.error("Could not load total hours", error);
      }
    // console.log("Total hours: ", hoursArray);
}
fetchUserHours()
},[])







  return (
    <LayoutWrapper>
     <section className="userpage-section">

        <div className="title-wrapper">
          <div>
          <AvatarDisplay previewAvatar={previewAvatar} />
          <button
            type="button"
            className="change-avatar"
            onClick={toggleAvatarPicker}
            aria-label="Change avatar"
            aria-expanded={avatarToggle}
            aria-controls="avatar-picker"
          >
            <Images style={{color:"black"}}/>
          </button>
          </div>
          <p className="user-name">{username}</p>
          <p className="user-email">{email}</p>
          <p className="user-role">{role}</p>
        </div>

        {avatarToggle && (
          <div className="avatar-picker" id="avatar-picker">
            <p className="avatar-picker-hint">
              {isGuest ? "Guest accounts can preview avatars but not save them" : "Tap to preview, tap again to save"}
            </p>
            <div className="avatar-grid">
              {AVATARS.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  className={[
                    "avatar-option",
                    option.value === avatar ? "current" : "",
                    option.value === previewAvatar ? "previewing" : "",
                  ].join(" ").trim()}
                  onClick={() => handleAvatarClick(option.value)}
                  aria-pressed={option.value === previewAvatar}
                  aria-label={option.value === avatar ? `${option.label} (current avatar)` : option.label}
                  disabled={savingAvatar}
                >
                  <img src={`/avatars/${option.value}.png`} alt="" width={64} height={64} />
                </button>
              ))}
            </div>
            <div className="avatar-picker-actions">
              <button type="button" className="avatar-cancel-btn" onClick={toggleAvatarPicker} disabled={savingAvatar}>
                Cancel
              </button>
              <button type="button" className="avatar-save-btn" onClick={saveAvatar} disabled={!hasNewAvatar || isGuest || savingAvatar}>
                {savingAvatar ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}

        <div className="userpage-hour-summary">
          <Clock5 className="calendar-clock" />
          <h2>Total logged hours</h2>
          <p style={{fontSize:"32px"}}>{totalHours}hrs</p>
          <p>All time</p>

        </div>

        <div className="userpage-btn-wrapper">
          <div onClick={() => navigate("/settings")} className="default-Btn" >
            <Settings/>
            <p style={{fontSize:"16px", padding:"0", margin:"0"}}>Settings</p>
          </div>
          <LogoutBtn/>
        </div>

      </section>
    </LayoutWrapper>
  );
}
