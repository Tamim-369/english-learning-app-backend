"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_codes_1 = require("http-status-codes");
const config_1 = __importDefault(require("../../../config"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const emailHelper_1 = require("../../../helpers/emailHelper");
const jwtHelper_1 = require("../../../helpers/jwtHelper");
const emailTemplate_1 = require("../../../shared/emailTemplate");
const cryptoToken_1 = __importDefault(require("../../../util/cryptoToken"));
const generateOTP_1 = __importDefault(require("../../../util/generateOTP"));
const resetToken_model_1 = require("../resetToken/resetToken.model");
const student_model_1 = require("../student/student.model");
const teacher_model_1 = require("../teacher/teacher.model");
const findInStudentAndTeacher_1 = require("../../../util/findInStudentAndTeacher");
const getModelAccordingToRole_1 = require("../../../util/getModelAccordingToRole");
// login
const loginUserFromDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = payload;
    const existUser = yield (0, findInStudentAndTeacher_1.findInStudentAndTeacher)(email, 'password');
    if (!existUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    const User = (0, getModelAccordingToRole_1.getModelAccordingToRole)(existUser);
    if (!existUser.verified) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Please verify your account, then try to login again');
    }
    if (existUser.status === 'delete') {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'You don’t have permission to access this content. It looks like your account has been deactivated.');
    }
    if (password && !(yield User.isMatchPassword(password, existUser.password))) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Password is incorrect!');
    }
    const createToken = jwtHelper_1.jwtHelper.createToken({ id: existUser._id, role: existUser.role, email: existUser.email }, config_1.default.jwt.jwt_secret, config_1.default.jwt.jwt_expire_in);
    return { createToken };
});
// forget password
const forgetPasswordToDB = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistUser = yield (0, findInStudentAndTeacher_1.findInStudentAndTeacher)(email);
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    const User = (0, getModelAccordingToRole_1.getModelAccordingToRole)(isExistUser);
    const otp = (0, generateOTP_1.default)();
    const emailData = { otp, email: isExistUser.email };
    const resetPasswordEmail = emailTemplate_1.emailTemplate.resetPassword(emailData);
    emailHelper_1.emailHelper.sendEmail(resetPasswordEmail);
    const authentication = {
        oneTimeCode: otp,
        expireAt: new Date(Date.now() + 3 * 60000), // OTP expires in 3 minutes
    };
    // @ts-ignore
    yield User.findOneAndUpdate({ email: isExistUser.email }, { $set: { authentication } });
});
// verify email
const verifyEmailToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { email, oneTimeCode } = payload;
    const isExistUserStudent = yield student_model_1.Student.findOne({ email }).select('+authentication');
    const isExistUserTeacher = yield teacher_model_1.Teacher.findOne({ email }).select('+authentication');
    let isExistUser;
    let User;
    if (isExistUserStudent) {
        isExistUser = isExistUserStudent;
        User = student_model_1.Student;
    }
    else if (isExistUserTeacher) {
        isExistUser = isExistUserTeacher;
        User = teacher_model_1.Teacher;
    }
    else {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    if (!oneTimeCode) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Please provide the OTP. Check your email for the verification code.');
    }
    if (((_a = isExistUser.authentication) === null || _a === void 0 ? void 0 : _a.oneTimeCode) !== oneTimeCode) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'The OTP you provided is incorrect.');
    }
    const currentTime = new Date();
    if (currentTime > ((_b = isExistUser.authentication) === null || _b === void 0 ? void 0 : _b.expireAt)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'The OTP has expired. Please request a new one.');
    }
    let message;
    let data;
    if (!isExistUser.verified) {
        // @ts-ignore
        yield User.findOneAndUpdate({ _id: isExistUser._id }, {
            $set: {
                verified: true,
                'authentication.oneTimeCode': null,
                'authentication.expireAt': null,
            },
        });
        message = 'Email verified successfully';
    }
    else {
        const createToken = (0, cryptoToken_1.default)();
        yield resetToken_model_1.ResetToken.create({
            user: isExistUser._id,
            token: createToken,
            expireAt: new Date(Date.now() + 5 * 60000),
        });
        // @ts-ignore
        yield User.findOneAndUpdate({ _id: isExistUser._id }, {
            $set: {
                'authentication.isResetPassword': true,
                'authentication.oneTimeCode': null,
                'authentication.expireAt': null,
            },
        });
        message =
            'Verification successful. Please securely store this code to reset your password.';
        data = createToken;
    }
    return { data, message };
});
// reset password
const resetPasswordToDB = (token, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { newPassword, confirmPassword } = payload;
    const isExistToken = yield resetToken_model_1.ResetToken.isExistToken(token);
    if (!isExistToken) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'You are not authorized.');
    }
    const isExistUserStudent = yield student_model_1.Student.findById(isExistToken.user).select('+authentication');
    const isExistUserTeacher = yield teacher_model_1.Teacher.findById(isExistToken.user).select('+authentication');
    let isExistUser;
    if (isExistUserStudent) {
        isExistUser = isExistUserStudent;
    }
    else if (isExistUserTeacher) {
        isExistUser = isExistUserTeacher;
    }
    else {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    if (!((_a = isExistUser === null || isExistUser === void 0 ? void 0 : isExistUser.authentication) === null || _a === void 0 ? void 0 : _a.isResetPassword)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "You don't have permission to change the password. Please initiate the 'Forgot Password' process again.");
    }
    const isValid = yield resetToken_model_1.ResetToken.isExpireToken(token);
    if (!isValid) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Token expired. Please initiate the "Forgot Password" process again.');
    }
    if (newPassword !== confirmPassword) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "New password and Confirm password don't match!");
    }
    const hashPassword = yield bcrypt_1.default.hash(newPassword, Number(config_1.default.bcrypt_salt_rounds));
    const updateData = {
        password: hashPassword,
        authentication: {
            isResetPassword: false,
        },
    };
    // @ts-ignore
    yield isExistUser.findOneAndUpdate({ _id: isExistUser._id }, updateData, {
        new: true,
    });
});
const changePasswordToDB = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { currentPassword, newPassword, confirmPassword } = payload;
    const isExistUser = yield (0, findInStudentAndTeacher_1.findInStudentAndTeacher)(user.email, 'password');
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    const User = (0, getModelAccordingToRole_1.getModelAccordingToRole)(isExistUser);
    if (currentPassword &&
        !(yield User.isMatchPassword(currentPassword, isExistUser.password))) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Password is incorrect');
    }
    if (currentPassword === newPassword) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Please give different password from current password');
    }
    if (newPassword !== confirmPassword) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Password and Confirm password doesn't matched");
    }
    const hashPassword = yield bcrypt_1.default.hash(newPassword, Number(config_1.default.bcrypt_salt_rounds));
    const updateData = { password: hashPassword };
    // @ts-ignore
    yield User.findOneAndUpdate({ _id: user.id }, updateData, { new: true });
});
exports.AuthService = {
    verifyEmailToDB,
    loginUserFromDB,
    forgetPasswordToDB,
    resetPasswordToDB,
    changePasswordToDB,
};
