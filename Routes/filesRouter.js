import express from "express"
import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"
import filesData from "../filesDb.json" with {type:"json"}
import directoriesData from "../directoriesDb.json" with {type:"json"}
import authMiddleware from "../utils/authMiddleware.js"


const filesRouter = express.Router()

filesRouter.get("/file/:fileId", authMiddleware, async (req, res) => {
  try {
    const user = req.user

    const { fileId } = req.params
    const { action } = req.query
    //Absolute Path of the file
    const fileData = filesData.find((file) => file.id === fileId)
    const parentDir = directoriesData.find(
      (dir) => dir.id === fileData.parentDirId
    )
    if (user.id !== parentDir.userId) {
      return res
        .status(403)
        .json({
          status: 403,
          error: "You don't have permission to access this file",
        })
    }
    if (!fileData) {
      return res.status(404).json({ message: "file does not exists" })
    }




    const { extension, filename } = fileData
      const rootPath =
      fileURLToPath(import.meta.url + "/../../") +
      `storage/${fileId}${extension}`


    if (action === "download") {
      // res.setHeader("Content-Disposition", `attachment;filename=${filename}`)
      return res.download(rootPath,filename)

    }
  

    res.sendFile(rootPath, (err) => {
      if (err) {
        console.log(err.message)
      }
    })
  } catch (error) {
    console.log(error.message)
    res.status(501).json({ error })
  }
})

filesRouter.post(
  "/file/upload/:parentdirid",
  authMiddleware,
  async (req, res) => {
    try {
      const parentDirId = req.params.parentdirid || directoriesData[0].id
      const filename = req.headers.filename || "unnamedfile"

      const directoryData = directoriesData.find(
        (directory) => directory.id === parentDirId
      )

      if (!directoryData) {
        return res.status(404).json({ error: "Parent directory not found" })
      }

      if (directoryData.userId !== user.id) {
        return res
          .status(403)
          .json({
            status: 403,
            error: "You don't have permission to upload to this directory !",
          })
      }

      const id = crypto.randomUUID()
      const extension = path.extname(filename)
      const fullFileName = id + extension
      const fileHandle = await fs.open(`./storage/${fullFileName}`, "w+")
      const writeStream = fileHandle.createWriteStream()
      req.pipe(writeStream)
      req.on("end", async () => {
        filesData.push({
          id,
          extension,
          filename,
          parentDirId,
        })

        const directoryData = directoriesData.find(
          (dir) => dir.id === parentDirId
        )
        directoryData.files.push(id)
        fileHandle.close()
        await fs.writeFile("./filesDb.json", JSON.stringify(filesData))
        await fs.writeFile(
          "./directoriesDb.json",
          JSON.stringify(directoriesData)
        )
        res.status(201).send("file uploaded successfully")
      })
    } catch (err) {
      console.log(err.message)
      res.status(500).send("failed to upload file")
    }
  }
)

filesRouter.patch("/file/:fileId", authMiddleware, async (req, res) => {
  try {
    const user = req.user
    const { fileId } = req.params
    const { newFileName } = req.body

    const fileData = filesData.find((file) => file.id === fileId)

    if (!fileData) return res.status(404).json({ message: "file not found!" })
    const parentDirData = directoriesData.find(
      (dir) => dir.id === fileData.parentDirId
    )
    if (!parentDirData || parentDirData.userId !== user.id) {
      return res
        .status(403)
        .json({
          status: 403,
          error: "You don't have permission to access this file",
        })
    }

    fileData.filename = newFileName
    await fs.writeFile("./filesDb.json", JSON.stringify(filesData))
    res.json({ message: "file renamed successfully" })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
})

filesRouter.delete("/file/:id", authMiddleware, async (req, res) => {
  try {
    const user = req.user
    const { id } = req.params
    const fileIndex = filesData.findIndex((file) => file.id === id)
    if (fileIndex === -1)
      return res.status(404).json({ message: "File does not exists" })

    const fileData = filesData[fileIndex]
    const parentDir = directoriesData.find((d) => d.id === fileData.parentDirId)
    if (!parentDir || parentDir.userId !== user.id) {
      return res
        .status(403)
        .json({ status: 403, error: "You don't have permission to this file" })
    }

    const fileExtension = fileData.extension
    await fs.rm(`./storage/${id}${fileExtension}`, { recursive: true })
    const directoryData = directoriesData.find(
      (dir) => dir.id === filesData[fileIndex].parentDirId
    )
    filesData.splice(fileIndex, 1)
    directoryData.files = directoryData.files.filter((fileId) => fileId !== id)

    await fs.writeFile("./filesDb.json", JSON.stringify(filesData))
    await fs.writeFile("./directoriesDb.json", JSON.stringify(directoriesData))
    res.json({ message: "file deleted successfully" })
  } catch (error) {
    console.log(error.message)
    res.status(501).json({ message: "failed to delete" })
  }
})

export default filesRouter
