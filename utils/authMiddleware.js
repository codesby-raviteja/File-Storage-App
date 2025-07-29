import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res
        .status(401)
        .json({ status: 401, error: "Please Login to your account!" });
    }


    const decodedObj = await jwt.verify(token, process.env.JWT_KEY);

    const db = req.db;

    const userObj = await db
      .collection("users")
      .findOne({ _id: new ObjectId(decodedObj.id) });

    if (!userObj) {
      return res
        .status(401)
        .json({ status: 401, error: "Please Login to your account!" });
    }

    req.user = userObj;

    next();
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: 500, error: "server internal error" });
  }
};

export default authMiddleware;
