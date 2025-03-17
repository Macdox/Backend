import s3 from "../db/CloudStorage.js";
import crypto from 'crypto';
import Classes from "../model/class.model.js";
import jwt from "jsonwebtoken";
import Teacher from "../model/teacher.model.js";

// Class creation
const CreateClass = async (req, res) => {
    const { subjectname } = req.body;
    const teacherId = req.user;
    try {
        if (!subjectname) {
            return res.status(400).json({ message: "Please fill in all fields" });
        }
        const alreadyExists = await Classes.findOne({ subjectname, teacherId });
        if (alreadyExists) {
            return res.status(400).json({ message: "Class already exists" });
        }
        const subjectCode = Math.floor(100000 + Math.random() * 900000).toString();
        const newclasses = new Classes({ subjectname, teacherId, subjectCode, });
        await newclasses.save();
        const teacher = await Teacher.findById(teacherId);
        teacher.classes.push(newclasses._id);
        await teacher.save();
    
        res.status(201).json({ message: "Classes created successfully", ClassesId: newclasses._id, subjectCode });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const generateJoinLink = async (req, res) => {
    try {
        const { subjectname } = req.body;
        console.log(subjectname);
        const expirationHours = 60 
        const teacherId = req.user;

        const foundClass = await Classes.findOne({ subjectname, teacherId });
        if (!foundClass) return res.status(404).json({ message: "Class not found" });

        const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);

        const token = jwt.sign({ subjectname, expiresAt: expiresAt.getTime() }, process.env.JWT_SECRET);

        const link = `http://localhost:8000/api/v1/join/${token}`;

        foundClass.studentLinks.push({ link, expiresAt });
        await foundClass.save();

        res.status(201).json({ message: "Join link generated", link });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to generate join link" });
    }
};

const uploadLecture = async (req, res) => {
    const ImgName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex") + ".mp4";
    const { subjectname, lectureTitle } = req.body; // Extract from req.body
    const file = req.file;
    const teacherId = req.user;
    console.log(teacherId);

    // Print all form data entries
    console.log(`subjectname: ${subjectname}`);
    console.log(`lectureTitle: ${lectureTitle}`);
    console.log(`file: ${file.originalname}`);

    if (!subjectname || !lectureTitle) {
        return res.status(400).json({ message: "Please fill in all fields" });
    }
    if (!file) {
        return res.status(400).json({ message: "Please upload a file" });
    }
    try {
        const files = file.buffer;
        const foundClass = await Classes.findOne({ subjectname, teacherId });
        if (!foundClass) return res.status(404).json({ message: "Class not found" });
        const fileName = ImgName();
        const params = {
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileName,
            Body: files,
        };
        s3.putObject(params, async (err, data) => {
            if (err) {
                res.status(500).send(err);
            } else {
                foundClass.file.push({ file: fileName, lectureTitle: lectureTitle });
                await foundClass.save();
                res.status(200).json({ message: "File uploaded successfully" });
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to upload file", error: error.message });
    }
};

export {
    CreateClass,
    generateJoinLink,
    uploadLecture,
};
