import httpStatus from 'http-status';
import {catchAsync} from '../utils/catchAsync.js';
import { createUser, getUserByEmail, updateUserById } from '../services/user.service.js';
import { generateOTP } from '../utils/otp.js';
import { generateAuthTokens,generateResetPasswordToken,generateVerifyEmailToken } from '../services/token.service.js';
import { loginUserWithEmailAndPassword,logout as logout2,refreshAuth,resetPassword as resetPassword2,verifyEmail as verifyEmail2  } from '../services/auth.service.js';
import { sendResetPasswordEmail,sendVerificationEmail as sendVerificationEmail2, sendEmailOtp, sendPasswordResetOtp } from '../services/email.service.js';
import otpStore from '../utils/otpStore.js';
import walletService from '../services/wallet.service.js';
// import { authService, userService, tokenService, emailService } from '../services/index.js';
// import { authService, userService, tokenService, emailService } from '../services';


const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await loginUserWithEmailAndPassword(email, password);
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

  // Create wallet for the new user
  const wallet = await walletService.getOrCreateWallet(user._id);

  // Delete OTP entry
  otpStore.delete(email);

  // Generate auth tokens
  const tokens = await generateAuthTokens(user);

  res.send({ user, wallet, tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const user = await getUserByEmail(email);
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).send({ message: 'No user found with this email' });
  }
  const otp = generateOTP();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  otpStore.set(email, { otp, expiresAt });
  await sendPasswordResetOtp(email, otp);
  res.send({ message: 'Password reset OTP sent to email' });
});

const verifyForgotPasswordOtp = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  const entry = otpStore.get(email);
  if (!entry || entry.otp !== otp || entry.expiresAt < Date.now()) {
    return res.status(httpStatus.BAD_REQUEST).send({ message: 'Invalid or expired OTP' });
  }
  // OTP is valid, generate a temporary token for password reset
  const user = await getUserByEmail(email);
  const resetToken = await generateAuthTokens(user);
  otpStore.delete(email);
  res.send({ message: 'OTP verified successfully', resetToken });
});

const updatePassword = catchAsync(async (req, res) => {
  const { newPassword } = req.body;
  const userId = req.user.id;
  
  // Update user's password
  const user = await updateUserById(userId, { password: newPassword });
  
  res.send({ message: 'Password updated successfully' });
});

export {
  login,
  loginOrSendOtp,
  registerWithOtp,
  forgotPassword,
  verifyForgotPasswordOtp,
  updatePassword,
};
