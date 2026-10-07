import { queryCompanyData, queryaddNewEntry } from "../../services/dbCalls";
import { Request, Response } from "express";



//##############################################################################



export async function getCompanies(req:Request, res:Response){
const userId = req.userId
const data = await queryCompanyData(userId)

// console.log("Here is data: ", data)
res.json(data)
}
export async function addEntry(req:Request, res:Response){


    console.log("REQ BODY: ",req.body)
    const userId = req.userId
    const data = await queryaddNewEntry(userId, req.body)

  // console.log("Here is data: ", data)
  res.json(data)


}



//##############################################################################
