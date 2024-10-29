const { isTokenValid } = require('../utils/jwt');
const UnauthenticatedError = require('../errors/unauthenticated');
const UnauthorizedError = require('../errors/unauthorized');
const authenticate = async (req, res, next) => {
    //check header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthenticatedError('Authentication Invalid');
    }

    try {
        const token = authHeader.split(' ')[1];
        const payload = isTokenValid(token);
        // Attach user to request object
        req.user = {
            userId: payload.userId,
            role: payload.role
        };
        next();
    } catch (error) {
        console.log('auth error:', error);
        throw new UnauthenticatedError('Authentication Invalid');
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new UnauthorizedError('Unauthorized to access this route');
        }
        next();
    };
};

module.exports = { authenticate, authorize };