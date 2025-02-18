import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
    let token = req.headers.authorization?.split(" ")[1]; // Get token from header
    if (!token) {
        token = req.session?.token; // Get token from sessionStorage
    }
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.userId; // Attach user info to request
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

export { verifyToken };
