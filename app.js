import express from "express"
import cors from "cors"
import directoryRouter from "./Routes/directoryRouter.js"
import filesRouter from "./Routes/filesRouter.js"
import authRouter from "./Routes/authRouter.js"
import cookieParser  from "cookie-parser"


const app = express()

app.use(express.json())
app.use(cookieParser())


app.use(cors({
  origin:'https://teja-drive-storage.netlify.app',
  credentials:true
}))
app.use("/", authRouter)
app.use("/", directoryRouter)
app.use("/", filesRouter)
app.get("/",(req,res)=>{
  res.json({activeStatus:true})
})


app.listen(5000, () => {
  console.log("Server started at port 5000")
})
