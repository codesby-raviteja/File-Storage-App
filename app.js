import express from "express"
import fs from "fs/promises"
import cors from "cors"
import mime from "mime-types"
import { statSync } from "fs"
import path from "path"

const app = express()

app.use(express.json())

app.use(cors({ origin: "http://localhost:5173" }))

app.get("/directory/*", async (req, res) => {
  //Create a storage folder add files in it
  try {
    const { 0: dirpath } = req.params
    const directoryPath = "./storage" + path.join("/", dirpath)

    const files = await fs.readdir(directoryPath)
    const data = []
    for (const file of files) {
      const filePath = !dirpath
        ? `./storage/${file}`
        : `./storage/${dirpath}/${file}`
      const fileStats = await fs.stat(filePath)
      const isDirectory = fileStats.isDirectory()
      data.push({ fileName: file, isDirectory })
    }
    res.status(200).json(data)
  } catch (error) {
    res.status(400).json({ message: "No such file or directory" })
  }
})

app.post("/directory/?*", async (req, res) => {
  try {
    const directory = path.join("/", req.params[0])
    const dirPath = `./storage${directory}`
    const restult = await fs.mkdir(dirPath)
    res.send("Directory successfully created")
  } catch (error) {
    res.status(501).json({ message: error.message })
  }
})

app.get("/files/:fileName", async (req, res) => {
  try {
    const { fileName } = req.params
    const { action, path: filePath } = req.query
    const newPath = "/storage" + path.join("/", filePath, fileName)

    if (action === "download") {
      res.setHeader("Content-Disposition", `attachment`)
    }

    res.sendFile(import.meta.dirname + newPath)
  } catch (error) {
    console.log(error)
    res.status(501).send(error)
  }
})

app.post("/files/upload/*", async (req, res) => {
  try {
    const fileName = req.headers.filename
    const { 0: dirpath } = req.params
    const destinationPath = "./storage" + path.join("/", dirpath,fileName)
    console.log(destinationPath);
    const fileHandle = await fs.open(destinationPath, "w+")
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
  const { newFileName, path } = req.body
  const filePath = !path ? `/storage/` : `/storage/${path}/`
  const oldFilePath = import.meta.dirname + filePath + file
  const newFilePath = import.meta.dirname + filePath + newFileName
  const result = await fs.rename(oldFilePath, newFilePath)
  res.send("file renamed successfully")
})

app.delete("/files/?*", async (req, res) => {
  try {
    const { 0: dirPath } = req.params
    const filePath = path.join("/", dirPath)
    const rootPath = import.meta.dirname + `/storage${filePath}`
    const result = await fs.rm(rootPath, { recursive: true })
    res.send("file deleted successfully")
  } catch (error) {
    res.status(501).send("failed to delete ")
  }
})

app.listen(5000, () => {
  console.log("Server started at port 5000")
})
