import bcryptjs from 'bcryptjs';
import crypto from "crypto";
import { generateTokenAndSetCookie } from '../utils/token.js';
import { sendVerificationEmail} from '../mailtrap/email.js';
import Teacher from '../model/teacher.model.js';
import Student from '../model/student.model.js';
import Classes from '../model/class.model.js';
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
        const hashedPasswordConfirm = await bcryptjs.hash(passwordConfirm, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        if (password !== passwordConfirm) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
        const teacher = new Teacher({
            email,
            password: hashedPassword,
            passwordConfirm: hashedPasswordConfirm,
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
    const { email, password, rememberMe } = req.body;

    try {
        const teacher = await Teacher.findOne({ email });
        if (!teacher) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const isPasswordMatch = await bcryptjs.compare(password, teacher.password);

        if (!isPasswordMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = generateTokenAndSetCookie(res, teacher._id, rememberMe)
        
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "None",
            maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined,
        }
        )
        teacher.lastLogin = new Date();
        await teacher.save();

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            teacher: {
                ...teacher._doc,
                password: undefined,
            },
            token,
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

// program for user auth check
const checkAuth = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.user).select("-password");
        const student = await Student.findById(req.user).select("-password");
        if (!student) {
            if(teacher)
            {
                return res.status(200).json({ success: true, user: teacher });
            }
            return res.status(400).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, user:student });
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
            message: "Email verified successfully. Redirecting to login...",
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

const profile = async (req, res) => {
    const token = req.user;
    const teacher = await Teacher.findById(token);
    if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
    }
    const classes = await Classes.find({ teacherId: teacher._id });
    res.status(200).json({ success: true,teacher, classes_name: classes.map((c) => c.subjectname) });
};

export {
    registerTeacher,
    loginTeacher,
    checkAuth,
    verifyTeacher,
    forgotPassword,
    resetPassword,
    profile,
};
