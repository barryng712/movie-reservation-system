const jwt = require('jsonwebtoken');

const createJWT = ({ payload }) => {
    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_LIFETIME || "4h",});
    return token;
};

const isTokenValid = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        console.log('Token verification error:', error);
        throw error;
    }
};
const createTokenUser = (user) => {
    return { name: user.name, userId: user.id, role: user.role };
}

const attachCookiesToResponse = ({res, user}) => {
    const token = createJWT({payload: user});
    const oneDay = 1000 * 60 * 60 * 24;
    res.cookie('token', token, {httpOnly: true, expires: new Date(Date.now() + oneDay), secure: process.env.NODE_ENV === 'production', signed: true});
};

const checkPermissions = (requestUser, resourceUserId) => {
    if (requestUser.role === 'admin') return;
    if (requestUser.userId === resourceUserId.toString()) return;
    throw new UnauthorizedError('Not authorized to access this route');
}

module.exports = { createJWT, isTokenValid, createTokenUser, attachCookiesToResponse, checkPermissions };

