import express from "express";
import authMiddleware from "../utils/authMiddleware.js";
import { ObjectId } from "mongodb";
import { deleteFolders, deleteFoldersWithDollarIn } from "../constants.js";
import fs from "fs/promises";

const directoryRouter = express.Router();

//Get Directory Route
directoryRouter.get("/directory/:id?", authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const directoryId = req.params.id || user.rootDirId;

    const db = req.db;

    const directory = await db
      .collection("directories")
      .findOne({ _id: new ObjectId(directoryId) });

    if (!directory) {
      return res.status(404).json({ error: "Directory does not exitst" });
    }

    if (directory.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        status: 403,
        error: "Directory does not exists or you do not have access to it !",
      });
    }

    const directoryFolders = await db
      .collection("directories")
      .find({ parentDirId: new ObjectId(directoryId) })
      .toArray();

    const directoryFiles = await db
      .collection("files")
      .find({ parentDirId: new ObjectId(directoryId) })
      .toArray();

    const data = {
      ...directory,
      folders: directoryFolders,
      files: directoryFiles,
    };

    res.status(200).json({ status: 200, data });
  } catch (error) {
    console.log(error);
    res.status(501).json({ status: 501, message: "server internal error" });
  }
});

//Create a new Directory Route
directoryRouter.post(
  "/directory/:parentdirid?",
  authMiddleware,
  async (req, res) => {
    try {
      const user = req.user;
      const parentDirId = req.params.parentdirid || user.rootDirId;
      const dirName = req.body.newDirectoryName || "New Folder";

      const db = req.db;

      const directoryData = await db
        .collection("directories")
        .findOne({ _id: new ObjectId(parentDirId) });

      if (!directoryData) {
        return res
          .status(404)
          .json({ message: "Parent directory does not exists " });
      }

      if (directoryData.userId.toString() !== user._id.toString()) {
        return res.status(403).json({
          status: 403,
          error:
            "You do not have permission to create a folder in this directory.",
        });
      }

      await db.collection("directories").insertOne({
        dirName,
        parentDirId: new ObjectId(parentDirId),
        userId: user._id,
      });

      // const newDirectoryId = newDirectory.insertedId;

      //adding to parentDirectory
      // await db
      //   .collection("directories")
      //   .updateOne(
      //     { _id: new ObjectId(parentDirId) },
      //     { $push: { folders: newDirectoryId } }
      //   );

      res
        .status(201)
        .json({ status: 201, message: "directory successfully created" });
    } catch (error) {
      res.status(501).json({ status: 501, message: error.message });
    }
  }
);

//Rename DirectoryName Route
directoryRouter.patch("/directory/:id", authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { newDirName } = req.body;

    const db = req.db;

    const directoryData = await db
      .collection("directories")
      .findOne({ _id: new ObjectId(id) });

    if (!directoryData) {
      return res.status(404).json({ message: "Folder does not exists" });
    }
    if (directoryData.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        status: 403,
        error: "You don't have access to rename this folder",
      });
    }
    await db
      .collection("directories")
      .updateOne({ _id: new ObjectId(id) }, { $set: { dirName: newDirName } });

    res.json({ message: "Directory Name successfully changed" });
  } catch (error) {
    res.status(501).json({ message: error.message });
  }
});

// Delete the Directory Route
directoryRouter.delete(
  "/directory/:dirId",
  authMiddleware,
  async (req, res) => {
    try {
      const user = req.user;
      const { dirId } = req.params;
      const db = req.db;

      const directoryData = await db
        .collection("directories")
        .findOne({ _id: new ObjectId(dirId) });

      if (!directoryData) {
        return res.json({ message: "Directory does not exist" }).end();
      }

      if (directoryData.userId.toString() !== user._id.toString()) {
        return res
          .status(403)
          .json({ error: "You do not have access to delete the folder" });
      }

      if (directoryData._id.toString() === user.rootDirId.toString()) {
        return res
          .status(400)
          .json({ message: "cannot delete root directory!" });
      }

      const [allFiles, allFolders] = await deleteFoldersWithDollarIn(dirId, db);

      for (const { _id, extension } of allFiles) {
        await fs.rm(`./storage/${_id.toString() + extension}`);
      }

      const allFilesId = allFiles.map((f) => f._id);
      const allFoldersWithCurrentDirectory = [
        ...allFolders.map((d) => d._id),
        new ObjectId(dirId),
      ];

      await db.collection("files").deleteMany({ _id: { $in: allFilesId } });
      await db
        .collection("directories")
        .deleteMany({ _id: { $in: allFoldersWithCurrentDirectory } });

      res.json({ message: "deleted successfully" });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default directoryRouter;
