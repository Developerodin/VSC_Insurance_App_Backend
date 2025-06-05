import httpStatus from 'http-status';
import {catchAsync} from '../utils/catchAsync.js';
import { createUser, getUserByEmail, generateOTP, updateUserById } from '../services/user.service.js';
import { generateAuthTokens,generateResetPasswordToken,generateVerifyEmailToken } from '../services/token.service.js';
import { loginUserWithEmailAndPassword,logout as logout2,refreshAuth,resetPassword as resetPassword2,verifyEmail as verifyEmail2  } from '../services/auth.service.js';
import { sendResetPasswordEmail,sendVerificationEmail as sendVerificationEmail2, sendEmailOtp } from '../services/email.service.js';
import otpStore from '../utils/otpStore.js';
// import { authService, userService, tokenService, emailService } from '../services/index.js';
// import { authService, userService, tokenService, emailService } from '../services';


const register = catchAsync(async (req, res) => {
  const user = await createUser(req.body);
  const tokens = await generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await loginUserWithEmailAndPassword(email, password);
  const tokens = await generateAuthTokens(user);
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await logout2(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await generateResetPasswordToken(req.body.email);
  await sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await resetPassword2(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await generateVerifyEmailToken(req.user);
  await sendVerificationEmail2(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await verifyEmail2(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

const registerWithEmailOtp = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  let user = await getUserByEmail(email);
  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  if (user) {
    if (user.isEmailVerified) {
      throw new Error('Email already registered. Please login.');
    }
    // Resend OTP
    user.emailVerification = {
      token: otp,
      expiresAt: otpExpires,
      verified: false,
    };
    await user.save();
    await sendEmailOtp(email, otp);
    return res.status(httpStatus.OK).send({ message: 'OTP resent to email.' });
  }
  // Create new user (partial)
  user = await createUser({ email, password, isEmailVerified: false, emailVerification: { token: otp, expiresAt: otpExpires, verified: false } });
  await sendEmailOtp(email, otp);
  res.status(httpStatus.CREATED).send({ message: 'OTP sent to email.' });
});

const verifyEmailOtp = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  const user = await getUserByEmail(email);
  if (!user) throw new Error('User not found');
  if (!user.emailVerification || user.emailVerification.token !== otp || user.emailVerification.expiresAt < new Date()) {
    throw new Error('Invalid or expired OTP');
  }
  user.isEmailVerified = true;
  user.emailVerification.verified = true;
  await user.save();
  const tokens = await generateAuthTokens(user);
  res.send({ user, tokens });
});

const loginOrSendOtp = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await getUserByEmail(email);
  if (user) {
    // User exists, login
    if (!(await user.isPasswordMatch(password))) {
      return res.status(httpStatus.UNAUTHORIZED).send({ message: 'Invalid credentials' });
    }
    const tokens = await generateAuthTokens(user);
    return res.send({ user, tokens });
  }
  // User does not exist, send OTP
  const otp = generateOTP();
  const expiresAt = Date.now() + 10 * 60 * 1000;
  otpStore.set(email, { otp, password, expiresAt });
  await sendEmailOtp(email, otp);
  res.send({ message: 'OTP sent to email' });
});

 const registerWithOtp = catchAsync(async (req, res) => {
  const { email, password, otp } = req.body;
  const entry = otpStore.get(email);
  if (!entry || entry.otp !== otp || entry.password !== password || entry.expiresAt < Date.now()) {
    return res.status(httpStatus.BAD_REQUEST).send({ message: 'Invalid or expired OTP' });
  }
  // Create user
  const user = await createUser({ email, password, isEmailVerified: true });
  otpStore.delete(email);
  const tokens = await generateAuthTokens(user);
  res.send({ user, tokens });
});

export {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  registerWithEmailOtp,
  verifyEmailOtp,
  loginOrSendOtp,
  registerWithOtp,
};
