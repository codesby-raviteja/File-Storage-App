import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import authMiddleware from "../utils/authMiddleware.js";
import { ObjectId } from "mongodb";

const filesRouter = express.Router();

//Get File Route

filesRouter.get("/file/:fileId", authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    const { fileId } = req.params;
    const { action } = req.query;
    const db = req.db;
    //Absolute Path of the file

    const fileData = await db
      .collection("files")
      .findOne({ _id: new ObjectId(fileId) });

    if (!fileData) {
      return res.status(404).json({ message: "file does not exists" });
    }

    const parentDir = await db
      .collection("directories")
      .findOne({ _id: fileData.parentDirId });

    if (user._id.toString() !== parentDir.userId.toString()) {
      return res.status(403).json({
        status: 403,
        error: "You don't have permission to access this file",
      });
    }

    const { extension, filename } = fileData;
    const rootPath =
      fileURLToPath(import.meta.url + "/../../") +
      `storage/${fileId}${extension}`;

    if (action === "download") {
      // res.setHeader("Content-Disposition", `attachment;filename=${filename}`)
      return res.download(rootPath, filename);
    }

    res.sendFile(rootPath, (err) => {
      if (err) {
        console.log(err.message);
      }
    });
  } catch (error) {
    console.log(error.message);
    res.status(501).json({ error });
  }
});

//Upload File Route
filesRouter.post(
  "/file/upload/:parentdirid?",
  authMiddleware,
  async (req, res) => {
    try {
      const user = req.user;
      const parentDirId = req.params.parentdirid || user.rootDirId;
      const db = req.db;

      const filename = req.headers.filename || "unnamedfile";

      const directoryData = await db
        .collection("directories")
        .findOne({ _id: new ObjectId(parentDirId) });

      if (!directoryData) {
        return res.status(404).json({ error: "Parent directory not found" });
      }

      if (directoryData.userId.toString() !== user._id.toString()) {
        return res.status(403).json({
          status: 403,
          error: "You don't have permission to upload to this directory !",
        });
      }

      const extension = path.extname(filename);

      const newFileCreated = await db.collection("files").insertOne({
        extension,
        filename,
        parentDirId: new ObjectId(parentDirId),
      });

      const fullFileName = newFileCreated.insertedId.toString() + extension;
      const fileHandle = await fs.open(`./storage/${fullFileName}`, "w+");
      const writeStream = fileHandle.createWriteStream();
      req.pipe(writeStream);

      req.on("end", async () => {
        fileHandle.close();
        res.status(201).json({ message: "file uploaded successfully" });
      });
      req.on("error", async () => {
        await db
          .collection("files")
          .deleteOne({ _id: newFileCreated.insertedId });
        res.status(404).json({ error: "could not upload file" });
      });
    } catch (err) {
      console.log(err.message);
      res.status(500).send("failed to upload file");
    }
  }
);

//Rename File Route
filesRouter.patch("/file/:fileId", authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const { fileId } = req.params;
    const { newFileName } = req.body;
    const db = req.db;

    if (!newFileName.trim()) {
      return res.status(400).json({ error: "filename cannot be empty" });
    }

    const fileData = await db
      .collection("files")
      .findOne({ _id: new ObjectId(fileId) });

    if (!fileData) return res.status(404).json({ message: "file not found!" });

    const parentDirData = await db
      .collection("directories")
      .findOne({ _id: fileData.parentDirId });

    if (
      !parentDirData ||
      parentDirData.userId.toString() !== user._id.toString()
    ) {
      return res.status(403).json({
        status: 403,
        error: "You don't have permission to access this file",
      });
    }

    await db
      .collection("files")
      .updateOne(
        { _id: new ObjectId(fileId) },
        { $set: { filename: newFileName } }
      );

    res.json({ message: "file renamed successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: error.message });
  }
});

//Delete File Route
filesRouter.delete("/file/:id", authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const db = req.db;

    const fileData = await db
      .collection("files")
      .findOne({ _id: new ObjectId(id) });

    if (!fileData)
      return res.status(404).json({ message: "File does not exists" });

    const parentDir = await db
      .collection("directories")
      .findOne({ _id: fileData.parentDirId });

    if (!parentDir || parentDir.userId.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ status: 403, error: "You don't have permission to this file" });
    }

    const fileExtension = fileData.extension;

    await fs.rm(`./storage/${id}${fileExtension}`);

    const result = await db
      .collection("files")
      .deleteOne({ _id: new ObjectId(id) });

    res.json({ message: "file deleted successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(501).json({ message: "failed to delete" });
  }
});

export default filesRouter;
