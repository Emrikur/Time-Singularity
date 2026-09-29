import "../assets/styles/timeReport.css";
import LayoutWrapper from "../components/LayoutWrapper";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import {CirclePlus, ClockPlus} from "lucide-react"
import type { EntryFormData } from "../lib/types";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { todayLocalISO } from "../lib/functions";




export default function TimeReport() {


interface GraphType {
    id: string;
    name: string;
    is_active: boolean;
  }

  const {token, email} = useAuth()
  const isGuest = email === "guest@ts.com";
const [dbResponse, setDbResponse] = useState<GraphType[]>([]);
const [formResponse, setFormResponse] = useState<EntryFormData | null>(null);
const [wordcounter, setWordCounter] = useState<number>(0);
const navigate = useNavigate()
async function handleFormSubmit(e:React.FormEvent<HTMLFormElement>){


  try {
    e.preventDefault();
    const form = e.currentTarget

    if(form.description.value.length > 150){
      toast.error("Description can't exceed 150 characters")
      return
    }
    if (new Date(form.date.value) > new Date()) {
  toast.error("You can't log hours for future dates!");
  return;
}
  if(Number(form.hours.value) > 24){
    toast.error("May only log a maximum of 24 hours")
    return;

  }
    console.log("hours value ",form.hours.value)
    console.log("company value ",form.company.value)
    console.log("description value ",form.description.value)
    console.log("date value ",form.date.value)

      // console.log( form.username.value, form.password.value);
      const addEntry = await toast.promise(axios({
        method: "post",
        url: `${import.meta.env.VITE_API_URL}/timeEntry/create`,
        headers: { Authorization: `Bearer ${token}` },
        data: {

          id: form.company.value,
          date: form.date.value,
          hours: form.hours.value,
          description:form.description.value
        },
      }), {
        pending: "Submitting...",
        success: "Entry added successfully!",
        error: "Failed to add entry."
      });
if(!token){
  navigate("/")
  return;
}
      if (addEntry.data.success) {
        const response = addEntry.data;
        console.log("Response message ",response.message)
        setFormResponse(response)
        setTimeout(() => {
          setFormResponse(null)
        }, 3000);


        // console.log("The message: ",response.message)

        form.reset();
        setWordCounter(0)

      } else {
        const response = addEntry.data.data;
        console.log("Response message ",response.message)
        setFormResponse(response)
        setTimeout(() => {
          setFormResponse(null)
        }, 3000);
      }
    } catch (error) {
      console.error(error);
    }

}


  useEffect(() => {
    async function fetchCompanies() {
      const checkCompanies = await axios({
        method: "get",
        url: `${import.meta.env.VITE_API_URL}/modal/companies`,
        headers: { Authorization: `Bearer ${token}` }
      });

      const response = checkCompanies.data;

      if(!token){
        navigate("/")
        return;
      }
      setDbResponse(response);
    }

    fetchCompanies();
  }, []);


  return (
    <>
    <LayoutWrapper>
      <section className="time-report">
      <h1 className="report-title">Time report</h1>
      <form className="report-form" onSubmit={handleFormSubmit}>
        <div className="report-field report-company">
          <label htmlFor="report-company">Company</label>
          <select id="report-company" className="report-input" name="company" required>
            {dbResponse ? dbResponse.filter((company) => company.is_active).map((company) => <option className="form-option" value={company.id} key={company.id}>{company.name}</option>): null}
          </select>
        </div>

        <div className="report-when">
          <div className="report-field report-date">
            <label htmlFor="report-date">Date</label>
            <input
            id="report-date"
            max={todayLocalISO()}
            defaultValue={todayLocalISO()}
            onClick={(e) => e.currentTarget.showPicker?.()}
            className="report-input" name="date" type="date" required />
          </div>

          <div className="report-field report-hours">
            <label htmlFor="report-hours">Hours</label>
            <div className="report-hours-input">
              <input
                id="report-hours"
                name="hours"
                placeholder="0"
                className="report-input"
                type="number"
                inputMode="decimal"
                min="0.01"
                max="24"
                step="0.01"
                required
              />
              <ClockPlus className="report-hours-icon" size={20} aria-hidden="true"/>
            </div>
          </div>
        </div>

        <div className="report-field report-description">
          <label htmlFor="report-description-input">Description</label>
          <textarea
            id="report-description-input"
            className="report-input"
            onChange={(e) => setWordCounter(e.currentTarget.value.length)}
            name="description"
          />
          <p className={wordcounter > 150 ? "report-counter exceeded" : "report-counter"}>{wordcounter}/150</p>
        </div>

        <div className="report-submit">
          {formResponse ? <p className={formResponse.success ? "report-message success" : "report-message failed"}>{formResponse.message}</p> : <button disabled={isGuest} className="default-Btn" id="logHoursBtn" type="submit"><CirclePlus/><p>Log hrs</p> </button>}
        </div>

      </form>
      </section>
      </LayoutWrapper>
    </>
  );
}
