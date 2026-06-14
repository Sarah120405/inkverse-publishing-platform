import jwt from "jsonwebtoken";

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
}

const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
}

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    try {
        req.user = verifyToken(token);
        next();
    } catch {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export { generateToken, verifyToken, authMiddleware };