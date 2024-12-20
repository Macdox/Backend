import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
		},
        name:
        {
            type:String,
            required:false
        },
        phone:
        {
            type:Number,
            required:false
        },
		password: {
			type: String,
			required: true,
		},
		passwordConfirm: {
			type: String,
			required: true,
		},
		lastLogin: {
			type: Date,
			default: Date.now,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		resetPasswordToken: String,
		resetPasswordExpiresAt: Date,
		verificationToken: String,
		verificationTokenExpiresAt: Date,
	},
	{ timestamps: true }
);

export const Teacher = mongoose.model("Teacher", userSchema);
