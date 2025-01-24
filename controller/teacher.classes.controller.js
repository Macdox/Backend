import s3 from "../db/CloudStorage.js";
import crypto from 'crypto';
import { classes } from "../model/class.model.js";
import jwt from "jsonwebtoken";

// Class creation
export const CreateClass = async (req, res) => {
    const { subjectname, description } = req.body;
    const teacherId = req.userId;
    try {
        if (!subjectname || !description) {
            return res.status(400).json({ message: "Please fill in all fields" });
        }
        const alreadyExists = await classes.findOne({ subjectname, teacherId });
        if (alreadyExists) {
            return res.status(400).json({ message: "Class already exists" });
        }
        const subjectCode = Math.floor(100000 + Math.random() * 900000).toString();
        const newclasses = new classes({ subjectname, description, teacherId, subjectCode });
        await newclasses.save();
    
        res.status(201).json({ message: "Classes created successfully", classesId: newclasses._id, subjectCode });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const generateJoinLink = async (req, res) => {
    try {
        const { subjectname, expirationHours } = req.body;
        const teacherId = req.userId;

        const foundClass = await classes.findOne({ subjectname, teacherId });
        if (!foundClass) return res.status(404).json({ message: "Class not found" });

        const expiresAt = Date.now() + expirationHours * 60 * 60 * 1000;
        const token = jwt.sign({ subjectname, expiresAt }, process.env.JWT_SECRET);
        const link = `https://localhost:8000/api/v1/join/${token}`;

        foundClass.studentLinks.push({ link, expiresAt: new Date(expiresAt) });
        await foundClass.save();

        res.status(201).json({ message: "Join link generated", link });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to generate join link" });
    }
};

export const uploadLecture = async (req, res) =>
{
    const ImgName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex")+ ".mp4";
    const { subjectname, lectureTitle } = req.body;
    const file = req.file;
    const teacherId = req.userId;
    //console.log(subjectname, lectureTitle);
    console.log(teacherId);
    if(!subjectname || !lectureTitle)
    {
        return res.status(400).json({message:"Please fill in all fields"});
    }
    if(!file)
    {
        return res.status(400).json({message:"Please upload a file"});
    }
    try {
        const files = file.buffer;
        //console.log(files);
        const foundClass = await classes.findOne({ subjectname, teacherId });
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
                res.status(200).send("File uploaded successfully");
            }
        });
        
    } catch (error) {
        res.status(500).json({ message: "Failed to upload file", error: error.message });
    }

}
