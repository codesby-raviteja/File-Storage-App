import express from "express"
import cors from "cors"
import directoryRouter from "./Routes/directoryRouter.js"
import filesRouter from "./Routes/filesRouter.js"
import authRouter from "./Routes/authRouter.js"
import cookieParser  from "cookie-parser"


const app = express()

app.use(express.json())
app.use(cookieParser())


// app.use(cors({
//   origin:'http://localhost:5173',
//   credentials:true
// }))

app.use(cors({
  origin:'https://teja-drive-storage.netlify.app',
  credentials:true
}))



app.use("/", authRouter)
app.use("/", directoryRouter)
app.use("/", filesRouter)


app.listen(5000, () => {
  console.log("Server started at port 5000")
})
