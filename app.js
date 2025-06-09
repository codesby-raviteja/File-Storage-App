import express from "express"
import fs from "fs/promises"
import cors from "cors"
import mime from "mime-types"
import { statSync } from "fs"

const app = express()

app.use(express.json())

app.use(cors({ origin: "http://localhost:5173" }))

app.get("/directory/*", async (req, res) => {
  //Create a storage folder add files in it
  try {
    const { 0: dirpath } = req.params
    const path = !dirpath ? "./storage" : `./storage/${dirpath}`
    const files = await fs.readdir(path)
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
    console.log(error.message)
  }
})

app.get("/files/:fileName", async (req, res) => {
  try {
    const { fileName } = req.params
    const { action, path } = req.query
    const newPath =
      path === "directory"
        ? `/storage/${fileName}`
        : `/storage/${path}/${fileName}`
    if (action === "download") {
      res.setHeader("Content-Disposition", `attachment`)
    }

    res.sendFile(import.meta.dirname + newPath)
  } catch (error) {
    console.log(error)
    res.status(501).send(error)
  }
})

app.post("/upload/*", async (req, res) => {
  try {
    const fileName = req.headers.filename
    const { 0: dirpath } = req.params
    const destinationPath = !dirpath
      ? `./storage/${fileName}`
      : `./storage/${dirpath}/${fileName}`

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

app.delete("/:file", async (req, res) => {
  try {
    const { file } = req.params
    const { path } = req.body
    const filePath = !path ? `/storage/${file}` : `/storage/${path}/${file}`
    const rootPath = import.meta.dirname + filePath
    const result = await fs.rm(rootPath, { recursive: true })
    res.send("file deleted successfully")
  } catch (error) {
    res.status(501).send("failed to delete ")  }
})

app.listen(5000, () => {
  console.log("Server started at port 5000")
})
