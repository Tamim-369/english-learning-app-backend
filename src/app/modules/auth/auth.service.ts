import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { jwtHelper } from '../../../helpers/jwtHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import {
  IAuthResetPassword,
  IChangePassword,
  ILoginData,
  IVerifyEmail,
} from '../../../types/auth';
import cryptoToken from '../../../util/cryptoToken';
import generateOTP from '../../../util/generateOTP';
import { ResetToken } from '../resetToken/resetToken.model';
import { Student } from '../student/student.model';
import e from 'cors';
import { Teacher } from '../teacher/teacher.model';
import { findInStudentAndTeacher } from '../../../util/findInStudentAndTeacher';
import { USER_ROLES } from '../../../enums/user';
import { getModelAccordingToRole } from '../../../util/getModelAccordingToRole';
import { logger } from '../../../shared/logger';

//login

const loginUserFromDB = async (payload: ILoginData) => {
  const { email, password } = payload;

  const existUser: any = await findInStudentAndTeacher(email, 'password');
  // checking if existUser is null
  if (!existUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // Retrieve the model based on the user's role
  let User = await getModelAccordingToRole(existUser);

  // Check if user is verified
  if (!existUser.verified) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please verify your account, then try to login again'
    );
  }

  // Check if user's account is deactivated
  if (existUser.status === 'delete') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You don’t have permission to access this content. It looks like your account has been deactivated.'
    );
  }

  // Check if the password matches
  if (
    password &&
    !(await User?.isMatchPassword(password, existUser.password))
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect!');
  }

  // Create token for the user
  const createToken = jwtHelper.createToken(
    { id: existUser._id, role: existUser.role, email: existUser.email },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string
  );

  return { createToken };
};

//forget password
const forgetPasswordToDB = async (email: string) => {
  // Check if user exists in Student or Teacher collections
  const isExistUser: any = await findInStudentAndTeacher(email);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // Retrieve the model based on the user's role
  const User = getModelAccordingToRole(isExistUser);

  // Generate OTP
  const otp = generateOTP();

  // Prepare email template data
  const emailData = {
    otp,
    email: isExistUser.email,
  };

  // Send reset password email
  const resetPasswordEmail = emailTemplate.resetPassword(emailData);
  emailHelper.sendEmail(resetPasswordEmail);

  // Save OTP and expiration time to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000), // OTP expires in 3 minutes
  };

  // Update the user's authentication data with the OTP and expiration time
  await User?.findOneAndUpdate(
    { email: isExistUser.email },
    { $set: { authentication } }
  );
};

//verify email

const verifyEmailToDB = async (payload: IVerifyEmail) => {
  const { email, oneTimeCode } = payload;

  // Check if user exists in both Student and Teacher collections
  const isExistUserStudent = await Student.findOne({ email }).select(
    '+authentication'
  );
  const isExistUserTeacher = await Teacher.findOne({ email }).select(
    '+authentication'
  );

  // Determine which user model to use
  let isExistUser;
  let User;
  if (isExistUserStudent) {
    isExistUser = isExistUserStudent;
    User = Student; // Set the model to Student
  } else if (isExistUserTeacher) {
    isExistUser = isExistUserTeacher;
    User = Teacher; // Set the model to Teacher
  } else {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // Ensure that an OTP is provided
  if (!oneTimeCode) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please provide the OTP. Check your email for the verification code.'
    );
  }

  // Check if the OTP matches
  if (isExistUser.authentication?.oneTimeCode !== oneTimeCode) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'The OTP you provided is incorrect.'
    );
  }

  // Check if the OTP has expired
  const currentTime = new Date();
  if (currentTime > isExistUser.authentication?.expireAt) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'The OTP has expired. Please request a new one.'
    );
  }

  let message;
  let data;

  // If the user is not verified, verify the email and clear the OTP
  if (!isExistUser.verified) {
    await User.findOneAndUpdate(
      { _id: isExistUser._id },
      {
        $set: {
          verified: true,
          'authentication.oneTimeCode': null,
          'authentication.expireAt': null,
        },
      }
    );
    message = 'Email verified successfully';
  } else {
    // If the user is already verified, generate a reset token for password reset
    const createToken = cryptoToken(); // Secure token generation
    await ResetToken.create({
      user: isExistUser._id,
      token: createToken,
      expireAt: new Date(Date.now() + 5 * 60000), // Token valid for 5 minutes
    });

    // Mark the user as in reset password mode and clear the OTP
    await User.findOneAndUpdate(
      { _id: isExistUser._id },
      {
        $set: {
          'authentication.isResetPassword': true,
          'authentication.oneTimeCode': null,
          'authentication.expireAt': null,
        },
      }
    );

    message =
      'Verification successful. Please securely store this code to reset your password.';
    data = createToken;
  }

  return { data, message };
};

//forget password
const resetPasswordToDB = async (
  token: string,
  payload: IAuthResetPassword
) => {
  const { newPassword, confirmPassword } = payload;

  // Check if the reset token exists
  const isExistToken = await ResetToken.isExistToken(token);
  if (!isExistToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized.');
  }

  // Check for the user in both Student and Teacher collections
  const isExistUserStudent = await Student.findById(isExistToken.user).select(
    '+authentication'
  );
  const isExistUserTeacher = await Teacher.findById(isExistToken.user).select(
    '+authentication'
  );

  let isExistUser;
  if (isExistUserStudent) {
    isExistUser = isExistUserStudent; // User is a Student
  } else if (isExistUserTeacher) {
    isExistUser = isExistUserTeacher; // User is a Teacher
  } else {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // Ensure the user has permission to reset the password
  if (!isExistUser?.authentication?.isResetPassword) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "You don't have permission to change the password. Please initiate the 'Forgot Password' process again."
    );
  }

  // Check if the token is expired
  const isValid = await ResetToken.isExpireToken(token);
  if (!isValid) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Token expired. Please initiate the "Forgot Password" process again.'
    );
  }

  // Check if the new password and confirm password match
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "New password and Confirm password don't match!"
    );
  }

  // Hash the new password
  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  // Prepare the update data
  const updateData = {
    password: hashPassword,
    authentication: {
      isResetPassword: false,
    },
  };

  // Update the user's password and reset the authentication state
  await (isExistUser instanceof Student ? Student : Teacher).findOneAndUpdate(
    { _id: isExistUser._id },
    updateData,
    { new: true }
  );
};

const changePasswordToDB = async (
  user: JwtPayload,
  payload: IChangePassword
) => {
  const { currentPassword, newPassword, confirmPassword } = payload;
  const isExistUser = await findInStudentAndTeacher(user.email, 'password');
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  const User = getModelAccordingToRole(isExistUser);
  //current password match
  if (
    currentPassword &&
    !(await User?.isMatchPassword(currentPassword, isExistUser.password))
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect');
  }

  //newPassword and current password
  if (currentPassword === newPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please give different password from current password'
    );
  }
  //new password and confirm password check
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Password and Confirm password doesn't matched"
    );
  }

  //hash password
  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const updateData = {
    password: hashPassword,
  };
  await User?.findOneAndUpdate({ _id: user.id }, updateData, { new: true });
};

export const AuthService = {
  verifyEmailToDB,
  loginUserFromDB,
  forgetPasswordToDB,
  resetPasswordToDB,
  changePasswordToDB,
};
