import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import { generateTokenAndSetCookie } from '../utils/token.js';
import { sendVerificationEmail } from '../mailtrap/email.js';
import { Student } from '../model/student.model.js';
import s3 from '../db/CloudStorage.js';
import mongoose from 'mongoose';
import { log } from 'console';

// Student registration
const SignupStudent = async (req, res) => {
    const { email, password, passwordConfirm } = req.body;

    try {
        if (!email || !password || !passwordConfirm) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const alreadyExists = await Student.findOne({ email });

        if (alreadyExists) {
            return res.status(400).json({ message: "Student already exists" });
        }
        const hashedPassword = await bcryptjs.hash(password, 10);
        const hashedPasswordConfirm = await bcryptjs.hash(passwordConfirm, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        if (password !== passwordConfirm) {
            return res.status(400).json({ message: "Password does not match" });
        }

        const student = new Student({
            email,
            password: hashedPassword,
            passwordConfirm: hashedPasswordConfirm,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24hrs
        });

        await student.save();
        generateTokenAndSetCookie(res, student._id);
        await sendVerificationEmail(student.email, verificationToken);

        res.status(200).json({
            success: true,
            message: "User created successfully",
            student: {
                ...student._doc,
                password: undefined,
            },
        });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Student verification
const VerifyStudent = async (req, res) => {
    const { code } = req.body;  // Fixing the incorrect key

    try {
        const student = await Student.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() },
        });

        if (!student) {
            return res.status(400).json({ message: "Invalid or expired verification code" });
        }

        student.isVerified = true;
        student.verificationToken = undefined;
        student.verificationTokenExpiresAt = undefined;
        await student.save();

        // Make sure sendWelcomeEmail is correctly imported before using it
        // await sendWelcomeEmail(student.email, student.name); 

        res.status(200).json({
            success: true,
            message: "Email verified successfully. Redirecting to login...",
        });
    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Student Login
const LoginStudent = async (req, res) => {
    const { email, password, rememberMe } = req.body;
    try {
        const student = await Student.findOne({ email });
        if (!student) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isPasswordMatch = await bcryptjs.compare(password, student.passwordConfirm);

        if (!isPasswordMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = generateTokenAndSetCookie(res, student._id, rememberMe);
        student.lastLogin = new Date();
        await student.save();

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            teacher: {
                ...student._doc,
                password: undefined,
            },
            token,
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// Student Logout
const LogoutStudent = async (req, res) => {
    res.clearCookie ('token');
    res.status(200).json({ success: true, message: "Logged out successfully" });
};

// Student forgot password
const StudentForgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const student = await Student.findOne({ email });

        if (!student) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetPasswordExpires = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

        student.resetPasswordToken = resetToken;
        student.resetPasswordExpiresAt = resetPasswordExpires;

        await student.save();

        await sendPasswordResetEmail(student.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

        res.status(200).json({ success: true, message: "Password reset link sent to your email" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Student reset password
const studentResetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const student = await Student.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() },
        });

        if (!student) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);

        student.password = hashedPassword;
        student.resetPasswordToken = undefined;
        student.resetPasswordExpiresAt = undefined;
        await student.save();

        await sendResetSuccessEmail(student.email);

        res.status(200).json({ success: true, message: "Password reset successful" });
    } catch (error) {
        console.log("Error in resetPassword ", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

//profile-section

const uploadProfilepic = async (req, res) => {
    const ImagName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex") + ".png";
    const file = req.file;
    const studentId = req.user;
    const student = await Student.findById(studentId);
    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }

    // Delete the previous profile picture if it exists
    // if (student.ProfilePicUrl) {
    //     const previousKey = student.ProfilePicUrl.split('/').pop();
    //     console.log("Previous key:", previousKey);

    //     // const deleteParams = {
    //     //     Bucket: "profile-pic",
    //     //     Key: previousKey,
    //     // };
    //     // s3.deleteObject(deleteParams, (err, data) => {
    //     //     if (err) {
    //     //         console.error("Error deleting previous profile picture:", err);
    //     //     }
    //     // });
    // }
    
    if(student.ProfilePicKey){
        console.log("existes",student.ProfilePicKey);

        const deleteParams = {
            Bucket: "profile-pic",
            Key: student.ProfilePicKey,
        };

        s3.deleteObject(deleteParams, (err, data) => {
            if (err) {
                console.error("Error deleting previous profile picture:", err);
            }
            console.log("Deleted");
        }   );

        
    }
    const newFileName = ImagName();
    const profilePic = file.buffer;
    const params = {
        Bucket: "profile-pic",
        Key: newFileName,
        Body: profilePic,
    };
    // const signedUrl = s3.getSignedUrl('getObject', {
    //     Bucket: "profile-pic",
    //     Key: newFileName,
    //     // Expires: 60 * 60 * 24 * 7, // 1 week
    // });
    s3.upload(params, async (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            student.ProfilePicKey = newFileName;
            console.log("Key", student.ProfilePicKey);
            await student.save();
            res.status(200).json({
                success: true,
                message: "File uploaded successfully",
                student: {
                    ...student._doc,
                    password: undefined,
                },
            });
        }
    });
};

//tofetchprofile
const profile = async (req, res) => {
    try {
        const userId = req.user; // Extract userId from decoded token
        const student = await Student.findById(userId) // Use ObjectId
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        const key = student.ProfilePicKey;
        const params = {
            Bucket: "profile-pic",
            Key: key,
        }
        const signedUrl = s3.getSignedUrl('getObject', params);
        student.ProfilePicUrl = signedUrl;
        await student.save();
        res.status(200).json({
            success: true,
            student: {
                ...student._doc,
                password: undefined,
                passwordConfirm: undefined,
            },
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const ProfileUpdate = async (req, res) => {
    const { name, phone, branch, yearAndDivision, gender } = req.body;
    const studentId = req.user;
    const student = await Student.findById(studentId);
    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }
    student.FullName = name;
    student.phone = phone;
    student.Branch = branch;
    student.Class = yearAndDivision;
    student.Gender = gender;
    await student.save();
    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        student: {
            ...student._doc,
            password: undefined,
            passwordConfirm: undefined,
        },
    });
};

export {
    SignupStudent,
    VerifyStudent,
    LoginStudent,
    LogoutStudent,
    StudentForgotPassword,
    studentResetPassword,
    uploadProfilepic,
    profile,
    ProfileUpdate
};
