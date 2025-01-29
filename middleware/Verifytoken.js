import jwt from "jsonwebtoken";
import express from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());

export const verifyToken = (req, res, next) => {
	console.log(req.cookies);
	const token = req.cookies.token;
	console.log("token:", req.cookies);
	if (!token) return res.status(401).json({ success: false, message: "Unauthorized - no token provided" });
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (!decoded) return res.status(401).json({ success: false, message: "Unauthorized - invalid token" });
		req.userId = decoded.teacherId;
		//console.log("decoded-teacher:", req.userId);	
		next();
	} catch (error) {
		//console.log("Error in verifyToken ", error);
		return res.status(500).json({ success: false, message: "Server error" });
	}
};
