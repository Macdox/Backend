import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import { generateTokenAndSetCookie } from '../utils/token.js';
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail } from '../mailtrap/email.js';
import { Student } from '../model/student.model.js';

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
    const { code } = req.body;

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

        sendWelcomeEmail(student.email, student.name);

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Student Login
const LoginStudent = async (req, res) => {
    const { email, password } = req.body;

    try {
        const student = await Student.findOne({ email });
        if (!student) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const isPasswordMatch = await bcryptjs.compare(password, student.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: "Password Does Not Match" });
        }
        const verified = student.isVerified;
        generateTokenAndSetCookie(res, student._id);

        student.lastLogin = new Date();
        await student.save();

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            student: {
                ...student._doc,
                password: undefined,
            },
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Student Logout
const LogoutStudent = async (req, res) => {
    res.clearCookie('token');
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

const studentAuth = async (req, res) => {
    try {
        const student = await Student.findById(req.userId).select("-password");
        if (!student) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, student });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export {
    SignupStudent,
    VerifyStudent,
    LoginStudent,
    LogoutStudent,
    StudentForgotPassword,
    studentResetPassword,
    studentAuth,
};
