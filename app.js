import express from "express"
import fs from "fs/promises"

const app = express()

app.use("/", (req, res, next) => {
  res.setHeader("Access-control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "*")
  res.setHeader("Access-Control-Allow-Headers", "*")
  next()
})

app.get("/", async (req, res) => {
  console.log(req.originalUrl)
  const files = await fs.readdir("./storage")
  console.log(files)
  res.send(files)
})

app.get("/:mode/:file", (req, res) => {
  console.log(req.originalUrl)
  const { mode, file } = req.params
  if (mode === "preview") {
    res.setHeader("content-type", `video/mp4`)
    res.setHeader("Content-Disposition", `inline; filename=${file}`)
  } else {
    res.setHeader("content-type", `application/mp4`)
    res.setHeader("Content-Disposition", `attachment; filename=${file}`)
  }
  res.sendFile(import.meta.dirname + `/storage/${file}`)
})

app.delete("/:file", async (req, res) => {
  const { file } = req.params
  const path = import.meta.dirname + `/storage/${file}`
  const result = await fs.rm(path)
  res.send("file deleted successfully")
})
app.patch("/:file", async (req, res) => {
  const { file } = req.params
  const oldPath = import.meta.dirname + `/storage/${file}`
  const newPath = import.meta.dirname + `/storage/${req.headers?.rename}`

  const result = await fs.rename(oldPath, newPath)
  res.send("file renamed successfully")
})

app.listen(5000, () => {
  console.log("Server started at port 5000")
})
