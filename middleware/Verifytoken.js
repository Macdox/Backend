import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  console.log("Cookies:", req.cookies);

  let token = req.cookies.token;

  if (!token && req.headers.authorization) {
    const authHeaderParts = req.headers.authorization.split(" ");
    if (authHeaderParts.length === 2 && authHeaderParts[0] === "Bearer") {
      token = authHeaderParts[1];
    }
  }

  console.log("Extracted Token:", token);

  if (!token) {
    return res.status(403).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded.teacherId && !decoded.studentId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.userId = decoded.teacherId || decoded.studentId;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

export { verifyToken };
