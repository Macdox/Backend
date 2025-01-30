import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (res, teacherId) => {
	const token = jwt.sign({ teacherId }, process.env.JWT_SECRET, {
		expiresIn: "7d",
	});
	return res.cookie("token", token, {
		httpOnly: true,
		secure: true,
		sameSite: "none",
		maxAge: 7 * 24 * 60 * 60 * 1000,
	});
};

export { generateTokenAndSetCookie };
