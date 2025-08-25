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

  // Get all courses
  export const getCourses = asyncHandler(async (req, res, next) => {
    const courses = await courseModel.find();
    return res.status(200).json({ message: "Courses fetched successfully", courses });
  });

  // Get course by ID
  export const getCourseById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const course = await courseModel.findById(id);
    if (!course) {
      return next(new Error("Course not found", { cause: 404 }));
    }
    return res.status(200).json({ message: "Course fetched successfully", course });
  });

  // Update course
  export const updateCourse = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    if (req.user.role !== "Admin") {
      return next(new Error("only Admin can access"));
    }
    const updatedCourse = await courseModel.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedCourse) {
      return next(new Error("Course not found", { cause: 404 }));
    }
    return res.status(200).json({ message: "Course updated successfully", updatedCourse });
  });

  // Delete course
  export const deleteCourse = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    if (req.user.role !== "Admin") {
      return next(new Error("only Admin can access"));
    }
    const deletedCourse = await courseModel.findByIdAndDelete(id);
    if (!deletedCourse) {
      return next(new Error("Course not found", { cause: 404 }));
    }
    return res.status(200).json({ message: "Course deleted successfully", deletedCourse });
  });

  // Add video to course
  export const addVideo = asyncHandler(async (req, res, next) => {
    const { courseId } = req.params;
    const { title, description, duration, order } = req.body;
    if (req.user.role !== "Admin") {
      return next(new Error("only Admin can access"));
    }
    const course = await courseModel.findById(courseId);
    if (!course) {
      return next(new Error("Course not found", { cause: 404 }));
    }
    if (!req.file?.path) {
      return next(new Error("No video file uploaded"));
    }
    // Upload video to Cloudinary
    const { secure_url, public_id } = await cloudnairy.uploader.upload(
      req.file.path,
      { resource_type: "video", folder: `${process.env.APP_NAME}/course/videos` }
    );
    const newVideo = {
      title,
      description,
      url: secure_url,
      duration,
      order,
      public_id
    };
    course.video.push(newVideo);
    await course.save();
    return res.status(201).json({ message: "Video added successfully", video: newVideo });
  });

