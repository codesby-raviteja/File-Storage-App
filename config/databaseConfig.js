import { configDotenv } from "dotenv";
configDotenv({ path: "./.env" });

import { MongoClient } from "mongodb";

const url =
  process.env.DATABASE_URL || "mongodb://localhost:27017/file_storage_app";



const client = new MongoClient(url);

export async function connectDB() {
  await client.connect();
  const database = client.db();
  console.log("Data base connection was successfull");

  return database;
}
