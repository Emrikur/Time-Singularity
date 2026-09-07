import "../assets/styles/timeReport.css";
import LayoutWrapper from "../components/LayoutWrapper";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import {CirclePlus, ClockPlus} from "lucide-react"
import type { EntryFormData } from "../lib/types";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";




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
      <form className="form" onSubmit={handleFormSubmit}>
        <select className="company-select" name="company">
          {dbResponse ? dbResponse.filter((company) => company.is_active).map((company) => <option className="form-option" value={company.id} key={company.id}>{company.name}</option>): null}
        </select>
        <div className="date-wrapper">
          <input
          max={new Date().toISOString().split('T')[0]}
          onClick={(e) => e.currentTarget.showPicker()}
          className="input-date" name="date"  type="date" />
        </div>


          <div className="hours">
            <input name="hours" placeholder="Hours" className="hours-input" type="text" />
            <ClockPlus className="hours-icon" size={20}/>
          </div>


        <div className="description-wrapper">
          <label htmlFor="description">Description</label>
          <textarea onChange={(e) => setWordCounter(e.currentTarget.value.length)} name="description" id="textarea"/>
          <p className={wordcounter > 150 ? "word-count-exceeded" : "word-count"}>{wordcounter}/150</p>
        </div>

        {formResponse ? <p className={formResponse.success ? "success-message" : "failed-message"}>{formResponse.message}</p> : <button disabled={isGuest} className="default-Btn" id="logHoursBtn" type="submit"><CirclePlus/><p>Log hrs</p> </button>}

      </form>
      </LayoutWrapper>
    </>
  );
}
