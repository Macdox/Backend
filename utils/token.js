import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, teacherId) => {
	const token = jwt.sign({ teacherId }, process.env.JWT_SECRET, {
		expiresIn: "7d",
	});

	localStorage.setItem("token", token);

	return token;
};
