import express from "express";
import authMiddleware from "../utils/authMiddleware.js";

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    const { name, password, email } = req.body;

    const db = req.db;

    const isUserExists = await db.collection("users").findOne({ email });
    if (isUserExists) {
      return res.status(409).json({ error: "User already exists" });
    }
    const userObject = await db
      .collection("users")
      .insertOne({ name, password, email });

    const userId = userObject?.insertedId;

    const userRootDir = await db.collection("directories").insertOne({
      userId,
      name: `root-${email}`,
      parentDir: null,
    });

    const rootDirId = userRootDir.insertedId;

    const userObj = await db
      .collection("users")
      .updateOne({ _id: userId }, { $set: { rootDirId } });
    //const userRootDirectory = ;

    res.status(201).json({ message: "user successfully created" });
  } catch (error) {
    console.log(error.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const userObj = await req.db
      .collection("users")
      .findOne({ email, password });

    if (!userObj) {
      return res.status(404).json({ error: "invalid credentials" });
    }

    res.cookie("userId", userObj._id.toString(), {
      maxAge: 60 * 60 * 1000,
      secure: true,
      sameSite: "none",
      httpOnly: true,
    });

    res
      .status(200)
      .json({ status: 200, message: "Login sucessfull", data: userObj });
  } catch (error) {
    console.log(error.message);
      res.status(500).json({ message: "Internal server error" });

  }
});

authRouter.get("/user", authMiddleware, (req, res) => {
  const user = req.user;
  res
    .status(200)
    .json({ status: 200, data: { name: user.name, email: user.email } });
});

authRouter.post("/logout", (req, res) => {
  res.clearCookie("userId");
  res.status(204).end();
});

export default authRouter;
