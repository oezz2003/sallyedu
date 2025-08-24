import courseModel from '../../../DB/models/Course.model.js'
import { asyncHandler } from '../../utils/errorHandler.js' 
 import cloudnairy from "../../utils/cloudnairy.js"



export const addCourse = asyncHandler(async (req, res, next) => {
  const { title } = req.body;
console.log(title);

  if (req.user.role !== "Admin") {
    return next(new Error("only Admin can access"));
  }

  

  if (await courseModel.findOne({ title })) {
    return res.status(401).json({ message: "course already exist" });
  }

  if (!req.file?.path) {
    return next(new Error("No file uploaded"));
  }
console.log(req.file);

  const { secure_url, public_id } = await cloudnairy.uploader.upload(
    req.file.path,
    { folder: `${process.env.APP_NAME}/course` }
  );

  req.body.media = { public_id, secure_url };

  const newCourse = await courseModel.create(req.body);
  return res
    .status(201)
    .json({ message: "course added successful", newCourse });
});

