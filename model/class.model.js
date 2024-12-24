import mongoose from "mongoose";

const Classes = new mongoose.Schema(
    {
        subjectname: {
            type: String, 
            required: true 
        },
        description:{
            type: String, 
            required: true
        },
        teacherId:{
            type:mongoose.Schema.Types.ObjectId, 
            ref:"Teacher",
            required:true
        },
        studentLinks:[{
            link: { 
                type: String, 
                required: true 
            },
            expiresAt: { 
                type: Date, 
                required: true 
            }, // Expiration timestamp
            active: 
            { 
                type: Boolean, 
                default: true 
            }, // Link active status
            redeemedAt: { 
                type: Date 
            }, // When the link was used
            redeemedBy: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: "Student" 
            }
        }
        ],
        createdAt: { 
            type: Date, 
            default: Date.now 
        },
    }
)

export const classes = mongoose.model("Classes",Classes)