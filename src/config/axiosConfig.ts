import axios from "axios";
import { toast } from 'react-toastify';

axios.interceptors.response.use(
  response => response, error => {
    console.log("Interceptor caught:", error.response?.status);
    // Ett misslyckat inloggningsförsök ska visa felet, inte ladda om sidan
    const isLoginRequest = error.config?.url?.endsWith("/auth/login");
    if (error.response?.status === 401 && !isLoginRequest) window.location.href = "/login";
    if (error.response?.status === 403) toast.error("You don't have access");
    if (error.response?.status === 404) toast.error("Page not found")
    if (error.response?.status === 500) toast.error("Something went awry");
    return Promise.reject(error)
  }
)
