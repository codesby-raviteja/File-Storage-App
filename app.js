import express from "express"
import fs from "fs/promises"

const app = express()

app.use(express.json())

app.use("/", (req, res, next) => {
  res.setHeader("Access-control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "*")
  res.setHeader("Access-Control-Allow-Headers", "*")
  next()
})

app.get("/", async (req, res) => {
  console.log(req.originalUrl)
  //Create a storage folder add files in it
  const files = await fs.readdir("./storage")
  res.status(200).json(files)
})

app.get("/:mode/:file", (req, res) => {
  const { mode, file } = req.params
  if (mode === "download") {
    res.setHeader("Content-Disposition", `attachment`)
  }
  res.sendFile(import.meta.dirname + `/storage/${file}`)
})

app.post("/", async (req, res) => {
  try {
    const fileHandle = await  fs.open(`./storage/${req.headers.filename}`,"w+")
    const writeStream =  fileHandle.createWriteStream( )
    req.pipe(writeStream)
    writeStream.on("close",()=>{
      res.status(201).send("file uploaded successfully")
    })
  } catch (err) {
    console.log(err.message);
    res.status(500).send("failed to upload file")
  }
})

app.patch("/:file", async (req, res) => {
  const { file } = req.params
  const oldPath = import.meta.dirname + `/storage/${file}`
  const newPath = import.meta.dirname + `/storage/${req.body.newFileName}`
  const result = await fs.rename(oldPath, newPath)

  res.send("file renamed successfully")
})

app.delete("/:file", async (req, res) => {
  const { file } = req.params
  const path = import.meta.dirname + `/storage/${file}`
  const result = await fs.rm(path)
  res.send("file deleted successfully")
})

app.listen(5000, () => {
  console.log("Server started at port 5000")
})
