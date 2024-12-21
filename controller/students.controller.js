import bcryptjs from 'bcryptjs';
import crypto from "crypto";
import { generateTokenAndSetCookie } from '../utils/token.js';
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail } from '../mailtrap/email.js';

import { Student } from '../model/student.model.js';


//Student registration 
export const SignupStudent = async (req ,res) =>{
    const {name,LastName,email,password,passwordConfirm,Phone} = req.body;
    
    try {
        if(!name ||!LastName|| !email || !password || !passwordConfirm || !Phone){
            return res.status(400).json({message:"All fields are required"});
        }
        const alreadyExists = await Student.findOne({email,name});

        if(alreadyExists)
        {
            return res.status(400).json({message:"Student already exists"});
        }
        const hashedPassword = await bcryptjs.hash(password, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        if(password !== passwordConfirm)
        {
            return res.status(400).json({message:"Password does not match"});
        }

        const student = new Student({
            name,
            LastName,
            email,
            password: hashedPassword,
            passwordConfirm: hashedPassword,
            Phone,
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
}

//Student verification

export const VerifyStudent = async (req,res) => {
    const {code} = req.body;

    try {
        const student = await Student.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() },
        });
        if(!student)
        {
            return res.status(400).json({message:"Invalid or expired verification code"});
        }

        student.isVerified = true;
        student.verificationToken = undefined;
        student.verificationTokenExpiresAt = undefined;
        await student.save();

        sendWelcomeEmail(student.email, student.name);

        res.status(200).json({
			success: true,
			message: "Email verified successfully",
			user: {
				...student._doc,
				password: undefined,
			},
		});
    } 
    catch (error) 
    {
        res.status(500).json({ success: false, message: "Server error" });
    }
}


//Student Login

export const LoginStudent = async (req, res) => {

    const {email , password } = req.body;

    try {
        const student = await Student.findOne({email});
        if(!student)
        {
            return res.status(400).json({message: "Invalid credentials"});
        }
        const isPasswordMatch = await bcryptjs.compare(password, student.password);

        if(!isPasswordMatch)
        {
            return res.status(400).json({message: "Invalid credentials"});
        }
        const verified = student.isVerified;
        if(!verified)
        {
            return res.status(400).json({message: "User not verified"});
        }

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
}

//Student Logout

export const LogoutStudent = async (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ success: true, message: "Logged out successfully" });
}

//student forgot password

export const StudentForgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const student = await Student.findOne({ email });

        if (!student) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetPasswordExpires = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

        student.resetPasswordToken = resetToken;
        student.resetPasswordExpiresAt = resetPasswordExpires;

        await student.save();

        // send email
        await sendPasswordResetEmail(student.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

        res.status(200).json({ success: true, message: "Password reset link sent to your email" });
    } catch (error) {
        console.log("Error in forgotPassword ", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

//student reset password


export const studentResetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const student = await student.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!student) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
        }

        // update password
        const hashedPassword = await bcryptjs.hash(password, 10);

        student.password = hashedPassword;
        student.resetPasswordToken = undefined;
        student.resetPasswordExpires = undefined;
        await student.save();

        await sendResetSuccessEmail(student.email);

        res.status(200).json({ success: true, message: "Password reset successful" });
    } catch (error) {
        console.log("Error in resetPassword ", error);
        res.status(400).json({ success: false, message: error.message });
    }
};
