import express from "express"
import fs from "fs/promises"
import cors from "cors"

const app = express()

app.use(express.json())

app.use(cors({ origin: "http://localhost:5173" }))

app.get("/", async (req, res) => {
  console.log("Hellow", req.originalUrl)
  //Create a storage folder add files in it
  const files = await fs.readdir("./storage", { withFileTypes: true })
  console.log(files)
  res.status(200).json(files)
})

app.get("/:file", async (req, res) => {
  try {
    const { file } = req.params
    const { path } = req.query

    if (!path) {
      return res.send("favicon")
    }

    const dirPath = path + `/${file}`
    const files = await fs.readdir(dirPath, { withFileTypes: true })
    console.log(files)
    res.status(200).json(files)
  } catch (error) {
    console.log("THIS IS THE ERROR:", error.message)
  }
})

app.get("/:mode/:fileName", (req, res) => {
  try {
    const { mode, fileName } = req.params
    const { path } = req.query
    if (mode === "download") {
      res.setHeader("Content-Disposition", `attachment`)
    }
    res.sendFile(import.meta.dirname + path.substring(1) + `/${fileName}`)
  } catch (error) {
    console.log(error)
    res.status(501).send(error)
  }
})

app.post("/", async (req, res) => {
  try {
    const fileHandle = await fs.open(`./storage/${req.headers.filename}`, "w+")
    const writeStream = fileHandle.createWriteStream()
    req.pipe(writeStream)
    writeStream.on("close", () => {
      res.status(201).send("file uploaded successfully")
    })
  } catch (err) {
    console.log(err.message)
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
