import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
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
                validator: function(v) {
                    return v.toString().length === 10; // Ensure phone number is 10 digits
                },
                message: props => `${props.value} is not a valid phone number!`
            }
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
		resetPasswordToken: String,
		resetPasswordExpiresAt: Date,
		verificationToken: String,
		verificationTokenExpiresAt: Date,
		
	},
	
	{ timestamps: true }
);

export const Student = mongoose.model("Student", userSchema);