import express from "express"
import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"
import filesData from "../filesDb.json" with {type:"json"}
import directoriesData from "../directoriesDb.json" with {type:"json"}
import authMiddleware from "../utils/authMiddleware.js"

const filesRouter = express.Router()

filesRouter.get("/file/:fileId",authMiddleware, async (req, res) => {
  try {
    const { fileId } = req.params
    const { action } = req.query
    //Absolute Path of the file
    const fileData = filesData.find((file) => file.id === fileId)
    if(!fileData){
      return res.status(404).json({message:"file does not exists"})
    }
    const { extension,filename } = fileData
    if (action === "download") {
      res.setHeader("Content-Disposition", `attachment;filename=${filename}`)
    }
    const rootPath =
      fileURLToPath(import.meta.url + "/../../") +
      `storage/${fileId}${extension}`

    res.sendFile(rootPath, (err) => {
      if (err) {
        console.log(err.message)
      }
    })
  } catch (error) {
    console.log(error.message)
    res.status(501).json(
      {error}
    )
  }
})


filesRouter.post("/file/upload/:parentdirid", authMiddleware,async (req, res) => {
  try {
    const parentDirId = req.params.parentdirid || directoriesData[0].id
    const filename  = req.headers.filename || "unnamedfile"
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
})

filesRouter.patch("/file/:fileId",authMiddleware, async (req, res) => {
  try {
    const { fileId } = req.params
    const { newFileName } = req.body

    const fileIndex = filesData.findIndex((file) => file.id === fileId)
    if(fileIndex ===-1) return res.status(404).json({message:"file not found!"})
    filesData[fileIndex].filename = newFileName
    await fs.writeFile("./filesDb.json", JSON.stringify(filesData))
    res.json({message:"file renamed successfully"})
  } catch (error) {
    
    res.status(400).send({message:error.message})
  }
})

filesRouter.delete("/file/:id", authMiddleware,async (req, res) => {
  try {
    const { id } = req.params
    const fileIndex = filesData.findIndex((file) => file.id === id)
    if(fileIndex === -1) return res.status(404).json({message:"File does not exists"})
    const fileExtension = filesData[fileIndex].extension
    await fs.rm(`./storage/${id}${fileExtension}`, { recursive: true })
    const directoryData = directoriesData.find(
      (dir) => dir.id === filesData[fileIndex].parentDirId
    )
    filesData.splice(fileIndex, 1)
    directoryData.files = directoryData.files.filter((fileId) => fileId !== id)
    await fs.writeFile("./filesDb.json", JSON.stringify(filesData))
    await fs.writeFile("./directoriesDb.json", JSON.stringify(directoriesData))
    res.json({message:"file deleted successfully"})
  } catch (error) {
    console.log(error.message)
    res.status(501).json({message:"failed to delete"})
  }
})

export default filesRouter
