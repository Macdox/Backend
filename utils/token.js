import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (res, userId, rememberMe = false) => {
	const expiresIn = rememberMe ? "30d" : "7d"; // 30 days if rememberMe is true, otherwise 7 days
	const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000; // 30 days in milliseconds or 7 days

	const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn,
	});
	res.cookie("token", token, {
		httpOnly: true,
		secure: true,
		sameSite: "none",
		maxAge,
	});
	return token;
};

export { generateTokenAndSetCookie };
