import express from "express"
import usersData from "../usersDb.json" with { type: "json" }
import directoriesData from "../directoriesDb.json" with { type: "json" }
import { writeFile } from "fs/promises"
import authMiddleware from "../utils/authMiddleware.js"

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
    // const rootDir = directoriesData.find((dir) => dir.userId === userObj.id)

    // res.cookie("userId",userObj.id,{maxAge:360000,httpOnly:true})
    res.cookie("userId", userObj.id, {
      maxAge: 360000,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })

    res
      .status(200)
      .json({ status: 200, message: "Login sucessfull", data: userObj })
  } catch (error) {
    console.log(error.message)
  }
})

authRouter.get("/user", authMiddleware, (req, res) => {
  const user = req.user
  res
    .status(200)
    .json({ status: 200, data: { name: user.name, email: user.email } })
})

authRouter.post("/logout", (req, res) => {
  res.clearCookie("userId")
  res.status(204).end()
})

export default authRouter
