import express from "express"
import cors from'cors'
import bootstrab from "./src/bootstrap.js"
const app=express()
const port=process.env.PORT 


app.use(cors());


bootstrab(app,express)

app.listen(port,()=>{
console.log("server running")
})



