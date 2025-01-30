import bcryptjs from 'bcryptjs';
import crypto from "crypto";
import { generateTokenAndSetCookie } from '../utils/token.js';
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail } from '../mailtrap/email.js';
import Teacher from '../model/teacher.model.js';

// program for Teacher registration
const registerTeacher = async (req, res) => {
    const { email, password, passwordConfirm } = req.body;

    try {
        if (!email || !password || !passwordConfirm) {
            return res.status(400).json({ message: "Please fill all fields" });
        }
        const alreadyExists = await Teacher.findOne({ email });
        if (alreadyExists) {
            return res.status(400).json({ success: false, message: "Teacher already exists" });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        if (password !== passwordConfirm) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
        const teacher = new Teacher({
            email,
            password: hashedPassword,
            passwordConfirm: hashedPassword,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24hrs 
        });

        await teacher.save();

        generateTokenAndSetCookie(res, teacher._id);

        await sendVerificationEmail(teacher.email, verificationToken);

        res.status(200).json({
            success: true,
            message: "User created successfully",
            teacher: {
                ...teacher._doc,
                password: undefined,
            },
        });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

// program for Teacher login
const loginTeacher = async (req, res) => {
    const { email, password } = req.body;

    try {
        const teacher = await Teacher.findOne({ email });
        if (!teacher) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const isPasswordMatch = await bcryptjs.compare(password, teacher.password);

        if (!isPasswordMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        generateTokenAndSetCookie(res, teacher._id);

        teacher.lastLogin = new Date();
        await teacher.save();

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            teacher: {
                ...teacher._doc,
                password: undefined,
            },
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

// program for teacher auth check
const checkAuth = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.userId).select("-password");
        if (!teacher) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, teacher });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Program for teacher verification
const verifyTeacher = async (req, res) => {
    const { code } = req.body;
    try {
        const teacher = await Teacher.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() },
        });

        if (!teacher) {
            return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
        }

        teacher.isVerified = true;
        teacher.verificationToken = undefined;
        teacher.verificationTokenExpiresAt = undefined;
        await teacher.save();

        await sendWelcomeEmail(teacher.email);

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: {
                ...teacher._doc,
                password: undefined,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// program for teacher forgot password
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const teacher = await Teacher.findOne({ email });

        if (!teacher) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetPasswordExpires = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

        teacher.resetPasswordToken = resetToken;
        teacher.resetPasswordExpires = resetPasswordExpires;

        await teacher.save();

        await sendPasswordResetEmail(teacher.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

        res.status(200).json({ success: true, message: "Password reset link sent to your email" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// program for teacher reset password
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const teacher = await Teacher.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!teacher) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);

        teacher.password = hashedPassword;
        teacher.resetPasswordToken = undefined;
        teacher.resetPasswordExpires = undefined;
        await teacher.save();

        await sendResetSuccessEmail(teacher.email);

        res.status(200).json({ success: true, message: "Password reset successful" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// program for teacher logout
const logoutTeacher = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfully" });
};

export {
    registerTeacher,
    loginTeacher,
    checkAuth,
    verifyTeacher,
    forgotPassword,
    resetPassword,
    logoutTeacher,
};
