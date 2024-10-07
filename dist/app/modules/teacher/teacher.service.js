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
exports.TeacherService = void 0;
const http_status_codes_1 = require("http-status-codes");
const user_1 = require("../../../enums/user");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const emailHelper_1 = require("../../../helpers/emailHelper");
const emailTemplate_1 = require("../../../shared/emailTemplate");
const unlinkFile_1 = __importDefault(require("../../../shared/unlinkFile"));
const generateOTP_1 = __importDefault(require("../../../util/generateOTP"));
const teacher_model_1 = require("./teacher.model");
const stripe_1 = __importDefault(require("stripe"));
const config_1 = __importDefault(require("../../../config"));
const stripeSecretKey = config_1.default.stripe_secret_key;
if (!stripeSecretKey) {
    throw new Error('Stripe secret key is not defined.');
}
const stripe = new stripe_1.default(stripeSecretKey);
const createTeacherToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    payload.role = user_1.USER_ROLES.TEACHER;
    const createTeacher = yield teacher_model_1.Teacher.create(payload);
    if (!createTeacher) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create user');
    }
    const account = yield stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: createTeacher.email,
        capabilities: {
            transfers: { requested: true },
            card_payments: { requested: true },
        },
    });
    yield teacher_model_1.Teacher.findOneAndUpdate({ _id: createTeacher._id }, { $set: { stripeAccountId: account.id } });
    yield stripe.accounts.update(account.id, {
        business_profile: {
            mcc: '8299',
            url: `http://${config_1.default.domain_stripe}/teachers/${createTeacher._id}`,
        },
        business_type: 'individual',
        settings: {
            payments: {
                statement_descriptor: 'EnglishLearningApp',
            },
        },
        tos_acceptance: {
            date: Math.floor(Date.now() / 1000),
            ip: config_1.default.ip_address || '192.168.10.192',
        },
    });
    const otp = (0, generateOTP_1.default)();
    const values = {
        name: createTeacher.name,
        otp: otp,
        email: createTeacher.email,
    };
    const createAccountTemplate = emailTemplate_1.emailTemplate.createAccount(values);
    emailHelper_1.emailHelper.sendEmail(createAccountTemplate);
    const authentication = {
        oneTimeCode: otp,
        expireAt: new Date(Date.now() + 3 * 60000),
    };
    yield teacher_model_1.Teacher.findOneAndUpdate({ _id: createTeacher._id }, { $set: { authentication } });
    return createTeacher;
});
const getTeacherProfileFromDB = (teacher) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = teacher;
    const isExistTeacher = yield teacher_model_1.Teacher.isExistTeacherById(id);
    if (!isExistTeacher) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Teacher doesn't exist!");
    }
    return isExistTeacher;
});
const updateProfileToDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistUser = yield teacher_model_1.Teacher.isExistTeacherById(id);
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Teacher doesn't exist!");
    }
    //unlink file here
    if (payload.profile) {
        (0, unlinkFile_1.default)(isExistUser.profile);
    }
    const updateDoc = yield teacher_model_1.Teacher.findOneAndUpdate({ _id: id }, payload, {
        new: true,
    });
    return updateDoc;
});
const getAllTeachersFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield teacher_model_1.Teacher.find({}, { password: 0 });
    return result;
});
const getTeacherByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield teacher_model_1.Teacher.findOne({ _id: id }, { password: 0 });
    return result;
});
const deleteTeacherFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield teacher_model_1.Teacher.findOneAndDelete({ _id: id });
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Teacher doesn't exist!");
    }
    return { message: 'Teacher deleted successfully' };
});
exports.TeacherService = {
    createTeacherToDB,
    getTeacherProfileFromDB,
    updateProfileToDB,
    getAllTeachersFromDB,
    getTeacherByIdFromDB,
    deleteTeacherFromDB,
};
