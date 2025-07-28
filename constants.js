import { ObjectId } from "mongodb";
import fs from "fs/promises";

export async function deleteFiles(fileId, db) {
  const fileData = await db
    .collection("files")
    .findOne({ _id: new ObjectId(fileId) });

  if (!fileData) return;
  try {
    await fs.rm(`./storage/${fileId}${fileData.extension}`);
    await db.collection("files").deleteOne({ _id: new ObjectId(fileId) });
  } catch (error) {
    console.log(error.message);
  }
}

export async function deleteFolders(id, db) {
  const directoryData = await db
    .collection("directories")
    .findOne({ _id: new ObjectId(id) });

  if (!directoryData) return;

  const allChildFolders = await db
    .collection("directories")
    .find({ parentDirId: new ObjectId(id) })
    .toArray();

  if (allChildFolders.length >= 1) {
    for (const folder of allChildFolders) {
      await deleteFolders(folder._id, db);
    }
  }

  const allFiles = await db
    .collection("files")
    .find({ parentDirId: new ObjectId(id) })
    .toArray();

  if (allFiles.length >= 1) {
    for (const fileId of allFiles) {
      await deleteFiles(fileId._id, db);
    }
  }
  await db.collection("directories").deleteOne({ _id: new ObjectId(id) });
}
