import jwt from "jsonwebtoken";
import Classes from "../model/class.model.js";
import { Student } from "../model/student.model.js";
import s3 from "../db/CloudStorage.js";

const join = async (req, res) => {
  const { token } = req.params;
  const studentId = req.userId;// Extracted from JWT
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (Date.now() > decoded.expiresAt) {
      return res.status(400).json({ message: "Link has expired" });
    }

    const foundClass = await Classes.findOne({
      subjectname: decoded.subjectname,
    });
    if (!foundClass)
      return res.status(404).json({ message: "Class not found" });

    const student = await Student.findById(req.userId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const classToJoin = await Classes.findOne({
      subjectname: foundClass.subjectname,
    });
    if (!classToJoin) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (!student.enrolledClasses.includes(foundClass.subjectname)) {
      student.enrolledClasses.push(classToJoin._id);
      await student.save();
    } else {
      return res
        .status(400)
        .json({ message: "Student already enrolled in this class" });
    }

    await classToJoin.save();
    res.status(200).json({ message: "Successfully joined the class" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Invalid or expired link" });
  }
};

const getStudentClasses = async (req, res) => {
  const studentId = req.userId;
  try {
    const student = await Student.findById(studentId).populate('enrolledClasses');
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    const watchedVideos = student.watchedVideos;
    const enrolledClasses = student.enrolledClasses;
    res.status(200).json({ enrolledClasses, watchedVideos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get Classes" });
  }
};

const getclasscontent = async (req, res) => {
  const { id } = req.params;
  try {
    const findclass = await Classes.findById(id);
    if (!findclass) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Ensure findclass.file is an array
    const files = Array.isArray(findclass.file) ? findclass.file : [];

    const lectureTitles = files.map((f) => f.lectureTitle);
    const fileNames = files.map((f) => f.file);
    res.status(200).json({ success: true, lectureTitles, fileNames });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get Classes" });
  }
};

const fetchVideo = async (req, res) => {
  const { id } = req.params;
  try {
    const findclass = await Classes.findOne({ "file.file": id });
    if (!findclass) {
      return res.status(404).json({ message: "File not found" });
    }
    const fileDetails = findclass.file.find(f => f.file === id);
    const lectureTitle = fileDetails.lectureTitle;

    const params = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: id,
      Expires: 3600, // Set expires here
      ResponseContentDisposition: "inline", // Ensure the video is displayed inline
      ResponseContentType: "video/mp4",
    };

    const url = s3.getSignedUrl("getObject", params);
     
    res.status(200).json({ url, lectureTitle });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch video" });
  }
};

const updateWatchedStatus = async (req, res) => {
  const { videoId } = req.body;
  const studentId = req.userId;
  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const findclass = await Classes.findOne({ "file.file": videoId });
    if (!findclass) {
      return res.status(404).json({ message: "File not found" });
    }

    const fileDetails = findclass.file.find(f => f.file === videoId);
    if (!fileDetails) {
      return res.status(404).json({ message: "Video not found" });
    }

    if (!student.watchedVideos.includes(videoId)) {
      student.watchedVideos.push(videoId);
      await student.save();
    }

    res.status(200).json({ message: "Watched status updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update watched status" });
  }
};

export {
  join,
  getStudentClasses,
  getclasscontent,
  fetchVideo,
  updateWatchedStatus,
};
