import 'dotenv/config';
import express from 'express';
import {Request, Response, NextFunction} from "express"
import cors from 'cors';
// import { getEnv }  from './src/config/env';
import router from './src/api/routes/auth';
import graphRoutes from "./src/api/routes/graphRoutes"
import modalRoute from "./src/api/routes/modalRoute"
import adminRoutes from "./src/api/routes/adminRoutes"
import companyRoute from "./src/api/routes/companyRoute"
import userRoute from './src/api/routes/userRoute';


// const env = getEnv();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin:
  [ process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    "https://time-singularity.vercel.app",
    "http://localhost:5173",
    "http://localhost:4173"
  ],
  credentials: true,
}));






app.use(express.json());



app.use("/user", userRoute)
app.use("/company", companyRoute)
app.use("/timeEntry", modalRoute)
app.use("/dashboard", graphRoutes)
app.use("/admin", adminRoutes)
app.use("/modal", modalRoute)
app.use('/auth', router);


app.use((err:Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error'})
  next()
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`CORS enabled for frontend: ${process.env.FRONTEND_ORIGIN || 'http://localhost:5173'}`);
});
