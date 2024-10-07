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
exports.StudentService = void 0;
const http_status_codes_1 = require("http-status-codes");
const user_1 = require("../../../enums/user");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const emailHelper_1 = require("../../../helpers/emailHelper");
const emailTemplate_1 = require("../../../shared/emailTemplate");
const unlinkFile_1 = __importDefault(require("../../../shared/unlinkFile"));
const generateOTP_1 = __importDefault(require("../../../util/generateOTP"));
const student_model_1 = require("./student.model");
const teacher_model_1 = require("../teacher/teacher.model");
const isDeleted_1 = require("../../../util/isDeleted");
const createStudentToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    //set role
    payload.role = user_1.USER_ROLES.STUDENT;
    const createUser = yield student_model_1.Student.create(payload);
    if (!createUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create user');
    }
    const existTeacher = yield teacher_model_1.Teacher.findOne({ email: createUser.email });
    if (existTeacher) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Email already exist in teacher!');
    }
    //send email
    const otp = (0, generateOTP_1.default)();
    const values = {
        name: createUser.name,
        otp: otp,
        email: createUser.email,
    };
    const createAccountTemplate = emailTemplate_1.emailTemplate.createAccount(values);
    emailHelper_1.emailHelper.sendEmail(createAccountTemplate);
    //save to DB
    const authentication = {
        oneTimeCode: otp,
        expireAt: new Date(Date.now() + 3 * 60000),
    };
    yield student_model_1.Student.findOneAndUpdate({ _id: createUser._id }, { $set: { authentication } });
    return createUser;
});
const getStudentProfileFromDB = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = user;
    const isExistUser = yield student_model_1.Student.isExistStudentById(id);
    const isDeleted = (0, isDeleted_1.isStudentDeleted)(isExistUser);
    if (isDeleted) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'User already deleted!');
    }
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    return isExistUser;
});
const updateProfileToDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistUser = yield student_model_1.Student.isExistStudentById(id);
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    const isDeleted = (0, isDeleted_1.isStudentDeleted)(isExistUser);
    if (isDeleted) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Student deleted!');
    }
    //unlink file here
    if (payload.profile) {
        (0, unlinkFile_1.default)(isExistUser.profile);
    }
    const updateDoc = yield student_model_1.Student.findOneAndUpdate({ _id: id }, payload, {
        new: true,
    });
    return updateDoc;
});
const getAllStudentsFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield student_model_1.Student.find({ status: { $ne: 'delete' } }).select('-cardNumber');
    return result;
});
const getStudentByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield student_model_1.Student.findOne({ _id: id }, { password: 0 });
    const isDeleted = (0, isDeleted_1.isStudentDeleted)(result);
    if (isDeleted) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Student deleted!');
    }
    return result;
});
const deleteStudentFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existStudent = yield student_model_1.Student.isExistStudentById(id);
    if (!existStudent) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Student doesn't exist!");
    }
    if (existStudent.status === 'delete') {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Student already deleted!');
    }
    yield student_model_1.Student.findOneAndUpdate({ _id: id }, { status: 'delete' });
    return { message: 'Student deleted successfully' };
});
exports.StudentService = {
    createStudentToDB,
    getStudentProfileFromDB,
    updateProfileToDB,
    getAllStudentsFromDB,
    getStudentByIdFromDB,
    deleteStudentFromDB,
};
