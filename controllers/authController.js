const User = require('../models/user');
const Auth = require('../utils/auth');
const { StatusCodes } = require('http-status-codes');
const BadRequestError = require('../errors/bad-request');
const UnauthenticatedError = require('../errors/unauthenticated');
const { createTokenUser, createJWT } = require('../utils/jwt');

const register = async (req, res) => {
    const { name, email, password, role } = req.body;
    const emailAlreadyExists = await User.findOne({ where: { email } });
    if (emailAlreadyExists) {
        throw new BadRequestError('Email already exists');
    }

    const user = await User.create({ name, email, password, role: role || 'user' });
    const tokenUser = createTokenUser(user);
   // attachCookiesToResponse({ res, user: tokenUser });
    res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new BadRequestError('Please provide email and password');
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new UnauthenticatedError('Invalid Credentials');
    }
    
    const isPasswordCorrect = await Auth.comparePassword(password, user.password);

    if (!isPasswordCorrect) {
        throw new UnauthenticatedError('Invalid Credentials');
    }
    const tokenUser = createTokenUser(user);
    const token = createJWT({payload: tokenUser});
    //attachCookiesToResponse({ res, user: tokenUser });
    res.status(StatusCodes.OK).json({ user: tokenUser , token: token});
};

const logout = async (req, res) => {    
    res.cookie('token', 'logout', { httpOnly: true, expires: new Date(Date.now()) });
    res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
};


module.exports = { register, login, logout };
