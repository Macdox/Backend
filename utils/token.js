import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, teacherId) => {
	const token = jwt.sign({ teacherId }, process.env.JWT_SECRET, {
		expiresIn: "7d",
	});

	res.cookies("token", token, {
		httpOnly: true,
		secure: true,
		sameSite: "strict",
		maxAge: 7 * 24 * 60 * 60 * 1000,
	});

	return token;
};
