import { verifyToken } from "./auth.jwtToken.js";
import response from "../utils/response.js";

const authorize = (roles = []) => {

    if (typeof roles == 'string')
        roles = [roles];
    return (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                const result = response(401, false, "Unauthorized: No token provided", null, "No token");
                return res.status(result.status).json(result);
            }
            const token = authHeader.split(' ')[1];
            const decoded = verifyToken(token);

            if (roles.length && !roles.includes(decoded.role)) {
                const result = response(403, false, "You don't have permission to access this resource", null, "Access denied");
                return res.status(result.status).json(result);
            }
            req.user = decoded;
            next();
        } catch (error) {
            const result = response(401, false, "Unauthorized: Invalid Token", null, error);
            return res.status(result.status).json(result);
        }

    }
}

export { authorize };