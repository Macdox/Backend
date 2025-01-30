import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  console.log("Cookies:", req.cookie);
  console.log("Authorization Header:", req.headers.authorization);

  const token = req.cookie.token || req.headers.authorization?.split(" ")[1];
  console.log("Extracted Token:", token);

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.teacherId || decoded.studentId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
