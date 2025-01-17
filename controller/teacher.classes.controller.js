import { classes } from "../model/class.model.js";
import jwt from "jsonwebtoken";
import express from "express";



//class creation
export const CreateClass = async (req, res) => {
    //console.log(classes);
    const { subjectname, description } = req.body;
    const teacherId = req.userId;
    console.log(teacherId);
    try {
        if(!subjectname || !description) {
            return res.status(400).json({ message: "Please fill in all fields" });
        }
        const alreadyExists = await classes.findOne({ subjectname, teacherId });
        console.log(alreadyExists);
        if (alreadyExists) {
            return res.status(400).json({ message: "Class already exists" });
        }
        const subjectCode = Math.floor(100000 + Math.random() * 900000).toString();
        //console.log(teacherId)
        const newclasses = new classes({ subjectname, description, teacherId, subjectCode });
        await newclasses.save();
    
        res.status(201).json({ message: "classes created successfully", classesId: newclasses._id, subjectCode });
      }
    catch(error){
        res.status(400).json({ success: false, message: error.message });
    }
};

export const generateJoinLink = async (req, res) => {
  try {
    const { subjectname, expirationHours } = req.body; // Hours link remains valid
    const teacherId = req.userId; // Extracted from JWT

    // Verify teacher owns the class
    const foundClass = await classes.findOne({ subjectname, teacherId });
    if (!foundClass) return res.status(404).json({ message: "Class not found" });

    // Generate expiration timestamp
    const expiresAt = Date.now() + expirationHours * 60 * 60 * 1000;

    // Create JWT for the link
    const token = jwt.sign({ subjectname, expiresAt }, process.env.JWT_SECRET);

    const link = `https://localhost:8000/api/v1/join/${token}`;

    // Store the link in the database
    foundClass.studentLinks.push({ link, expiresAt: new Date(expiresAt) });
    await foundClass.save();

    res.status(201).json({ message: "Join link generated", link });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate join link" });
  }
};

export const uploadFile = async (req, res) => {
  const { subjectname, file } = req.body;

  try {
    console.log("req.body",req.body);
  }
  catch(error){
    res.status(400).json({ success: false, message: error.message });
  }
}