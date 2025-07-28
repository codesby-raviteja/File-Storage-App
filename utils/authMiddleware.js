import { ObjectId } from "mongodb";
const authMiddleware = async (req, res, next) => {
  const { userId } = req.cookies;

  if (!userId) {
    return res
      .status(401)
      .json({ status: 401, error: "Please Login to your account!" });
  }

  const db = req.db;

  const userObj = await db
    .collection("users")
    .findOne({ _id: new ObjectId(userId) });

  if (!userObj) {
    return res
      .status(401)
      .json({ status: 401, error: "Please Login to your account!" });
  }

  req.user = userObj;
  
  next();
};

export default authMiddleware;
