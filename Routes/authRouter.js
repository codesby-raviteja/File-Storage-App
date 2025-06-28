import express from "express"
import usersData from "../usersDb.json" with {type:"json"}
import directoriesData from "../directoriesDb.json" with {type:"json"}
import { writeFile } from "fs/promises"

const authRouter = express.Router()

authRouter.post("/signup", async (req, res) => {
  try {
    const { name, password, email } = req.body

    const userObj = usersData.find((user) => user.email === email)
    if (userObj) {
      return res.status(409).json({ error: "user already exits" })
    }

    const userId = crypto.randomUUID()
    const rootDirId = crypto.randomUUID()
    const userObject = { id: userId, name, password, email, rootDirId }
    const userRootDirectory = {
      id: rootDirId,
      userId,
      name: `root-${email}`,
      parentDir: null,
      files: [],
      folders: [],
    }
    usersData.push(userObject)
    directoriesData.push(userRootDirectory)
    await writeFile("./usersDb.json", JSON.stringify(usersData))
    await writeFile("./directoriesDb.json", JSON.stringify(directoriesData))

    res.status(201).json({ message: "user successfully created" })
  } catch (error) {
    console.log(error.message)
  }
})

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const userObj = usersData.find((user) => user.email === email)
    if (!userObj) {
      return res.status(404).json({ error: "invalid credentials" })
    }

    const isValidUser = userObj.email === email && userObj.password === password
    if (!isValidUser) {
      return res.status(401).json({ error: "invalid credentials" })
    }
    const rootDir = directoriesData.find((dir) => dir.userId === userObj.id)
    res.cookie("userId",userObj.id,{maxAge:1000*60*60})

    res.status(200).json({status:200,message:"Login sucessfull",data:userObj})
  } catch (error) {
    console.log(error.message)
  }
})

export default authRouter
