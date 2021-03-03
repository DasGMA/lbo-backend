const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');
const nodemailer = require('nodemailer');
const Token = require('../models/token');
const crypto = require('crypto');
const secret = config.SECRET;
const tokenSecret = config.TOKEN_SECRET;

const randomTokenString = () => {
    return crypto.randomBytes(40).toString('hex');
}

const sendEmail = async ({ to, subject, html, from = config.EMAIL_FROM }) => {
    const transporter = nodemailer.createTransport(config.SMTP_OPTIONS);
    await transporter.sendMail({ from, to, subject, html });
}

// Generate token using user id that expires in 15 minutes
const generateToken = (user) => {
    const payload = { sub: user._id, id: user._id };
    const options = { expiresIn: '15m', jwtid: tokenSecret };

    return jwt.sign(payload, secret, options);
}

const generateRefreshToken = async (user, ipAddress) => {
    const newToken = new Token({
        user: user._id,
        token: randomTokenString(),
        // Expires in 7 days
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdByIp: ipAddress
    });

    try {
        await newToken.save();
    } catch (error) {
        throw({ Message: error.message});
    }
}

const protected = async (req, res, next) => {
    const { _id } = req.body;
    const token = await Token.findOne({ user: _id });
    const account = await User.findOne({ _id });

    if (!token || !account ) return res.status(401).json({Message: 'Not authorized.'});
   
    jwt.verify(token, secret, (error, user) => {
        if (error) return res.status(401).json({Error: error.message});
        req.user = account;
        next();
    });
}

const sendVerificationEmail = async (user, origin) => {
    let message;
    if (origin) {
        const verifyUrl = `${origin}/account/verify-email?token=${user.verificationToken}`;
        message = `<p>Please click the below link to verify your email address:</p>
                   <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
    } else {
        message = `<p>Please use the below token to verify your email address with the <code>/account/verify-email</code> api route:</p>
                   <p><code>${user.verificationToken}</code></p>`;
    }

    await sendEmail({
        to: user.email,
        subject: 'Sign-up Verification - Verify Email',
        html: `<h4>Verify Email</h4>
               <p>Thanks for registering!</p>
               ${message}`
    });
};

const sendAlreadyRegisteredEmail = async (email, origin) => {
    let message;
    if (origin) {
        message = `<p>If you don't know your password please visit the <a href="${origin}/account/forgot-password">forgot password</a> page.</p>`;
    } else {
        message = `<p>If you don't know your password you can reset it via the <code>/account/forgot-password</code> api route.</p>`;
    }

    await sendEmail({
        to: email,
        subject: 'Sign-up Verification - Email Already Registered',
        html: `<h4>Email Already Registered</h4>
               <p>Your email <strong>${email}</strong> is already registered.</p>
               ${message}`
    });
};

const sendPasswordResetEmail = async (user, origin) => {
    let message;
    if (origin) {
        const resetUrl = `${origin}/account/reset-password?token=${user.resetToken.token}`;
        message = `<p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
                   <p><a href="${resetUrl}">${resetUrl}</a></p>`;
    } else {
        message = `<p>Please use the below token to reset your password with the <code>/account/reset-password</code> api route:</p>
                   <p><code>${user.resetToken.token}</code></p>`;
    }

    await sendEmail({
        to: account.email,
        subject: 'Sign-up Verification - Reset Password',
        html: `<h4>Reset Password Email</h4>
               ${message}`
    });
};

const hash = (password) => {
    return bcrypt.hashSync(password, 12);
};

const userDetails = (user) => {
    const { 
        _id,
        type,
        avatar,
        userName,
        accountType,
        loggedin,
        firstname, 
        lastName,
        email,
        flagged,
        isVerified 
    } = user;

    return { 
        _id,
        type,
        avatar,
        userName, 
        accountType,
        loggedin,
        firstname,
        lastName,
        email,
        flagged,
        isVerified 
    }
}

module.exports = {
    generateToken,
    generateRefreshToken,
    protected,
    randomTokenString,
    hash,
    sendVerificationEmail,
    sendAlreadyRegisteredEmail,
    sendPasswordResetEmail,
    userDetails
}