import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
    let token = req.headers.authorization?.split(" ")[1]; // Get token from header
    console.log("Token from header: ", token);
    if (!token) {
        token = req.session?.token; // Get token from sessionStorage
        console.log("Token from session: ", token);
    }
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.userId; // Attach user info to request
        console.log("Decoded: ", decoded);
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

export { verifyToken };
