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
        studentLinks: [
            {
                link: { type: String, required: true },
                expiresAt: { type: Date, required: true },
                redeemedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }
            }
        ],
        subjectCode:{
            type:String
        },
        file: [
            {
                file: { type: String, required: true },
                lectureTitle: { type: String, required: true },
            }
        ],
		url: {
			type: String,
		},
        createdAt: { 
            type: Date, 
            default: Date.now 
        },
    }
)

export const classes = mongoose.model("Classes",Classes)