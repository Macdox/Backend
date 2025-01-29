import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
			validate: {
				validator: function (value) {
				  // Simple email regex for validation
				  return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(value);
				},
				message: "Please provide a valid email address.",
			  },
		},
        name:{
            type: String,
            required: false
        },
		LastName:{
			type: String,
			required: false
		},
        phone: {
            type: Number,
            required: false,

			validate: {
				validator: function(value) {
				  return /^\d{10}$/.test(value); s
				},
				message: 'Contact number must be exactly 10 digits long.'
			  },
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
		enrolledClasses: [{ 
			type: mongoose.Schema.Types.String, 
			ref: "Classes" 
		}],
		Firstname: {
			type: String,
			required: true
		},
		Lastname: {
			type: String,
			required: true
		},
		Phone:{
			type: Number,
			required: true
		},
		resetPasswordToken: String,
		resetPasswordExpiresAt: Date,
		verificationToken: String,
		verificationTokenExpiresAt: Date,
		watchedVideos: {
			type: [String],
			default: [],
		},
	},
	
	{ timestamps: true }
);

export const Student = mongoose.model("Student", userSchema);