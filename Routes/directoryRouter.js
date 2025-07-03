import express from "express"
import fs from "fs/promises"
import directoriesData from "../directoriesDb.json" with { type: "json" }
import filesData from "../filesDb.json" with { type: "json" }
import authMiddleware from "../utils/authMiddleware.js"

const directoryRouter = express.Router()

directoryRouter.get("/directory/:id?", authMiddleware, async (req, res) => {
  //Create a storage folder add files in it
  try {
    const user = req.user
    const id = req.params.id || user.rootDirId

    const directoryData = directoriesData.find(
      (directory) => directory.id === id
    )

    if (!directoryData) {
      return res.status(404).json({ message: "Folder does not exists" })
    }

    if (directoryData.userId !== user.id) {
      return res.status(403).json({
        status: 403,
        error: "Folder does not exists or you do not have access to it !",
      })
    }

    const files = directoryData.files.map((fileId) =>
      filesData.find((file) => file.id === fileId)
    )
    const folders = directoryData.folders.map((folderId) =>
      directoriesData.find((dir) => dir.id === folderId)
    )
    const data = { ...directoryData, files, folders }

    res.status(200).json({ status: 200, data })
  } catch (error) {
    res.status(501).json({ status: 501, message: "server internal error" })
  }
})

directoryRouter.post(
  "/directory/:parentdirid?",
  authMiddleware,
  async (req, res) => {
    try {
      const user = req.user
      const parentDirId = req.params.parentdirid || user.rootDirId
      const dirName = req.body.newDirectoryName || "New Folder"

      const directoryData = directoriesData.find(
        (dir) => dir.id === parentDirId
      )
      if (directoryData.userId !== user.id) {
        return res.status(403).json({
          status: 403,
          error:
            "You do not have permission to create a folder in this directory.",
        })
      }

      const id = crypto.randomUUID()
      const newDirectory = {
        id,
        dirName,
        parentDirId,
        userId: user.id,
        files: [],
        folders: [],
      }
      directoriesData.push(newDirectory)

      directoryData.folders.push(id)
      await fs.writeFile(
        "./directoriesDb.json",
        JSON.stringify(directoriesData)
      )
      res
        .status(201)
        .json({ status: 201, message: "directory successfully created" })
    } catch (error) {
      res.status(501).json({ status: 501, message: error.message })
    }
  }
)

directoryRouter.patch("/directory/:id", authMiddleware, async (req, res) => {
  try {
    const user = req.user
    const { id } = req.params
    const { newDirName } = req.body
    const directoryData = directoriesData.find((dir) => dir.id === id)
    if (!directoryData) {
      return res.status(404).json({ message: "Folder does not exists" })
    }
    if (directoryData.userId !== user.id) {
      return res.status(403).json({
        status: 403,
        error: "You don't have access to rename this folder",
      })
    }
    directoryData.dirName = newDirName
    await fs.writeFile("./directoriesDb.json", JSON.stringify(directoriesData))
    res.json({ message: "Directory Name successfully changed" })
  } catch (error) {
    res.status(501).json({ message: error.message })
  }
})

directoryRouter.delete(
  "/directory/:dirid",
  authMiddleware,
  async (req, res) => {
    try {
      const { dirid } = req.params

      //DELETING FILES
      async function deleteFiles(fileId) {
        const fileIndex = filesData.findIndex((file) => file.id === fileId)
        if (fileIndex === -1) return
        try {
          await fs.rm(`./storage/${fileId}${filesData[fileIndex].extension}`)
          filesData.splice(fileIndex, 1)
        } catch (error) {
          console.log(error.message)
        }
      }

      //DELETEING FOLDER's
      async function deleteFolders(id) {
        const directoryIndex = directoriesData.findIndex((dir) => dir.id === id)
        if (directoryIndex === -1) return

        if (directoriesData[directoryIndex].folders.length >= 1) {
          for (const id of directoriesData[directoryIndex].folders) {
            await deleteFolders(id)
          }
        }

        if (directoriesData[directoryIndex].files.length >= 1) {
          for (const fileId of directoriesData[directoryIndex].files) {
            await deleteFiles(fileId)
          }
        }

        const parentDirectory = directoriesData.find(
          (dir) => dir.id === directoriesData[directoryIndex].parentDirId
        )
        if (parentDirectory) {
          parentDirectory.folders = parentDirectory.folders.filter(
            (folderId) => folderId !== directoriesData[directoryIndex].id
          )
        }

        directoriesData.splice(directoryIndex, 1)
      }

      const dirIndex = directoriesData.findIndex((dir) => dir.id === dirid)

      if (dirIndex === -1) {
        return res.json({ message: "Directory does not exist" }).end()
      }
      if (dirIndex === 0) {
        return res
          .status(400)
          .json({ message: "cannot delete root directory!" })
      }

      await deleteFolders(dirid)

      await fs.writeFile(
        "./directoriesDb.json",
        JSON.stringify(directoriesData)
      )
      await fs.writeFile("./filesDb.json", JSON.stringify(filesData))

      res.json({ message: "deleted successfully" })
    } catch (error) {
      console.log(error.message)
    }
  }
)

export default directoryRouter
