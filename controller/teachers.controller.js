import bycryptjs from 'bcryptjs';
import crypto from "crypto";
import { generateTokenAndSetCookie } from '../utils/token.js';
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail } from '../mailtrap/email.js';

import {Teacher} from '../model/teacher.model.js';


//program for Teacher registration

export const registerTeacher = async (req, res) => 
    {
        const {email,password,passwordConfirm} = req.body;

        try {
            if(!email || !password || !passwordConfirm )
            {
                return res.status(400).json({message: "Please fill all fields"});
            }
            const alredyExists = await Teacher.findOne({email});
            if(alredyExists)
            {
                return res.status(400).json({ sucess:false, message: "teacher Already exists"});
            }

            const hasspassword = await bycrypt.hash(password, 10);
            const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
            
            if(password !== passwordConfirm)
            {
                return res.status(400).json({message: "Passwords do not match"});
            }
            const teacher = new Teacher({
                email,
                password: hasspassword,
                passwordConfirm:hasspassword,
                verificationToken,
                verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // 24hrs 
            });

            await teacher.save();

            generateTokenAndSetCookie(res, teacher._id);

            await sendVerificationEmail(teacher.email, verificationToken);

            res.status(201).json({
                success: true,
                message: "User created successfully",
                teacher: {
                    ...teacher._doc,
                    password: undefined,
                },
            });

        }
        catch (error){
            res.status(400).json({ success: false, message: error.message });
        }
    } 

//program for Teacher login

export const loginTeacher = async (req, res) => {

    const {email , password } = req.body;

    try {
        const teacher = await Teacher.findOne({email});
        if(!teacher)
        {
            return res.status(400).json({message: "Invalid credentials"});
        }
        const isPasswordMatch = await bycryptjs.compare(password, teacher.password);

        if(!isPasswordMatch)
        {
            return res.status(400).json({message: "Invalid credentials"});
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

//program for teacher auth check 

export const checkAuth = async (req, res) => {
	try {
		const teacher = await Teacher.findById(req.userId).select("-password");
		if (!teacher) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		res.status(200).json({ success: true, teacher });
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

// Program for teacher verification

export const verifyTeacher = async (req, res) => {
    const {code} = req.body;

    try {
        const teacher = await Teacher.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() },
        });

        if(!teacher)
        {
            return res.status(400).json({message: "Invalid or expired verification code"});
        }
        teacher.isVerified = true;
        teacher.verificationToken = undefined;
        teacher.verificationTokenExpiresAt = undefined;
        await teacher.save();

        await sendWelcomeEmail(teacher.email, teacher.name);
        res.status(200).json({
            success:true,
            message: "Teacher's mail is verified successfully",
            teacher: {
                ...teacher._doc,
                password: undefined,
            },

        })
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

// program for teacher forgot password
export const forgotPassword = async (req, res) => {
	const { email } = req.body;
	try {
		const teacher = await Teacher.findOne({ email });

		if (!teacher) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(20).toString("hex");
		const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

		teacher.resetPasswordToken = resetToken;
		teacher.resetPasswordExpiresAt = resetTokenExpiresAt;

		await teacher.save();

		// send email
		await sendPasswordResetEmail(teacher.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

		res.status(200).json({ success: true, message: "Password reset link sent to your email" });
	} catch (error) {
		console.log("Error in forgotPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

// program for teacher reset password

export const resetPassword = async (req, res) => {
	try {
		const { token } = req.params;
		const { password } = req.body;

		const teacher = await Teacher.findOne({
			resetPasswordToken: token,
			resetPasswordExpiresAt: { $gt: Date.now() },
		});

		if (!teacher) {
			return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
		}

		// update password
		const hashedPassword = await bcryptjs.hash(password, 10);

		teacher.password = hashedPassword;
		teacher.resetPasswordToken = undefined;
		teacher.resetPasswordExpiresAt = undefined;
		await teacher.save();

		await sendResetSuccessEmail(teacher.email);

		res.status(200).json({ success: true, message: "Password reset successful" });
	} catch (error) {
		console.log("Error in resetPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

// program for teacher logout

export const logoutTeacher = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfully" });
};