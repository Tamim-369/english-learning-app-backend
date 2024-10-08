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
exports.EnrollmentService = void 0;
const http_status_codes_1 = require("http-status-codes");
const config_1 = __importDefault(require("../../../../config"));
const course_model_1 = require("../course.model");
const enrollment_model_1 = require("./enrollment.model");
const stripe_1 = __importDefault(require("stripe"));
const ApiError_1 = __importDefault(require("../../../../errors/ApiError"));
const teacher_model_1 = require("../../teacher/teacher.model");
const stripe = new stripe_1.default(config_1.default.stripe_secret_key);
const createEnrollmentToDB = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const isExistCourse = yield course_model_1.Course.findOne({ _id: data.courseID });
    if (!isExistCourse) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Course not found');
    }
    const teacher = yield teacher_model_1.Teacher.findOne({ _id: isExistCourse.teacherID });
    let paymentIntent;
    try {
        paymentIntent = yield stripe.paymentIntents.create({
            amount: isExistCourse.price * 100,
            currency: 'usd',
            payment_method: data.paymentMethodId,
            confirm: true,
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never',
            },
            metadata: {
                courseID: data.courseID,
                studentID: data.studentID,
            },
        });
    }
    catch (error) {
        console.error(error);
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Payment failed');
    }
    const enrollmentData = {
        studentID: data.studentID,
        courseID: data.courseID,
        paymentIntentId: paymentIntent.id,
    };
    const result = yield enrollment_model_1.Enrollment.create(enrollmentData);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Enrollment not recorded');
    }
    const updatedCourse = yield course_model_1.Course.findOneAndUpdate({ _id: data.courseID }, { $push: { enrollmentsID: result._id } }, { new: true });
    if (!updatedCourse) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Enrollment update failed');
    }
    const teacherShare = isExistCourse.price * 0.8 * 100;
    try {
        // Check if teacher's account has 'transfers' capability
        const account = yield stripe.accounts.retrieve(teacher === null || teacher === void 0 ? void 0 : teacher.stripeAccountId);
        if (!((_a = account.capabilities) === null || _a === void 0 ? void 0 : _a.transfers) ||
            ((_b = account.capabilities) === null || _b === void 0 ? void 0 : _b.transfers) !== 'active') {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Teacher's account does not have transfers capability enabled.");
        }
        // Proceed with the transfer
        yield stripe.transfers.create({
            amount: teacherShare,
            currency: 'usd',
            destination: teacher === null || teacher === void 0 ? void 0 : teacher.stripeAccountId,
            transfer_group: paymentIntent.id,
        });
    }
    catch (error) {
        console.error('Transfer failed:', error);
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to transfer funds to teacher');
    }
    return result;
});
exports.EnrollmentService = {
    createEnrollmentToDB,
};
