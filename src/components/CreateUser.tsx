import "../assets/styles/createUser.css";
// import type UserFormData from "../lib/types";
import type { CompanyTypes } from "../lib/types";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import axios from "axios";
import { useEffect, useState } from "react";
export default function CreateUser() {

  const { token } = useAuth();
  const [companies, setCompanies] = useState<CompanyTypes[]>([]);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);

  useEffect(() => {
    async function fetchAllCompanies() {
      try {
        const response = await axios({
          method: "get",
          url: `${import.meta.env.VITE_API_URL}/admin/companies/fetch`,
          headers: { Authorization: `Bearer ${token}` }
        });
        setCompanies(response.data);
      } catch (error) {
        console.error("Could not fetch companies", error);
        toast.error("Could not load companies");
      }
    }

    fetchAllCompanies();
  }, [token]);

  function toggleCompany(companyId: string) {
    setSelectedCompanyIds((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId]
    );
  }

async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {


 event.preventDefault();
  const formData = event.currentTarget as HTMLFormElement & {
    firstName: HTMLInputElement;
    lastName: HTMLInputElement;
    email: HTMLInputElement;
    password: HTMLInputElement;
    role: HTMLSelectElement;
    salary: HTMLInputElement;
    status: HTMLSelectElement;
  };
// Konverterar statusvärdet från string till boolean
  const userStatus = formData.status.value === "true" ? true : false;

  const fullName =
  formData.firstName.value.charAt(0).toUpperCase() +
  formData.firstName.value.slice(1) + " " +
  formData.lastName.value.charAt(0).toUpperCase() +
  formData.lastName.value.slice(1);
  const email = formData.email.value.toLowerCase();


  const userData = {
    fullName: fullName,
    email: email,
    password: formData.password.value,
    role: formData.role.value,
    salary: formData.salary.value,
    status: userStatus
  };

try {
  const response = await axios({
    method: "post",
    url: `${import.meta.env.VITE_API_URL}/admin/user/create`,
    headers: { Authorization: `Bearer ${token}` },
    data: userData});

  if(response.data.success === false){
    toast.error(response.data.message)
    return;
  }

  // Tilldelar valda företag till den nya användaren
  if (selectedCompanyIds.length > 0) {
    try {
      await axios({
        method: "post",
        url: `${import.meta.env.VITE_API_URL}/admin/user/${response.data.userId}/companies`,
        headers: { Authorization: `Bearer ${token}` },
        data: { companyIds: selectedCompanyIds }
      });
    } catch (error) {
      console.error("Could not assign companies", error);
      toast.error("User created, but companies could not be assigned");
      return;
    }
  }

  toast.success(response.data.message)
  // Töm formuläret efter att användare skapats
  formData.reset();
  setSelectedCompanyIds([]);
} catch (error) {
  console.error("Could not create user", error);
  toast.error("Could not create user");
}
}


  return (
    <div className="user-creation-container">
      <form onSubmit={handleSubmit} name="userCreationForm" className="user-creation-form">
        <label htmlFor="firstName">First Name:</label>
        <input type="text" id="firstName" name="firstName" />
        <label htmlFor="lastName">Last Name:</label>
        <input type="text" id="lastName" name="lastName" />
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" />
        <label htmlFor="password">Password:</label>
        <input type="password" id="password" name="password" />
        <label htmlFor="role">Role:</label>
        <select id="role" name="role">
          <option value="developer">Developer</option>
          <option value="sales">Sales</option>
        </select>
        <label htmlFor="salary">Hourly rate (€):</label>
        <input type="number" id="salary" name="salary" step="1" />
        <label htmlFor="status">Status:</label>
        <select id="status" name="status">
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <fieldset className="company-assignment">
          <legend>Assigned companies:</legend>
          {/* Inaktiva företag visas inte i listan */}
          {companies.filter((company) => company.is_active).map((company) => (
            <label key={company.id} className="company-option">
              <input
                type="checkbox"
                value={company.id}
                checked={selectedCompanyIds.includes(company.id)}
                onChange={() => toggleCompany(company.id)}
              />
              {company.name}
            </label>
          ))}
        </fieldset>
        <button className="default-Btn" type="submit">Create User</button>
      </form>
    </div>
  );
}
