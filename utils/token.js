import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (res, userId, rememberMe = false) => {
	const expiresIn = rememberMe ? "30d" : "7d"; 
	const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

	const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn,
	});
	// ✅ Return token in response
	return token;
};

export { generateTokenAndSetCookie };
