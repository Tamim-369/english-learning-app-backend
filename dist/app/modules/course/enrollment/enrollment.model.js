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
exports.Enrollment = void 0;
const http_status_codes_1 = require("http-status-codes");
const mongoose_1 = require("mongoose");
const ApiError_1 = __importDefault(require("../../../../errors/ApiError"));
const student_model_1 = require("../../student/student.model");
const course_model_1 = require("../course.model");
const enrollmentSchema = new mongoose_1.Schema({
    studentID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    courseID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    paymentIntentId: {
        type: String,
        required: true,
    },
}, { timestamps: true });
enrollmentSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const isExistCourse = yield course_model_1.Course.findOne({ _id: this.courseID });
        if (!isExistCourse) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Course not found!');
        }
        const isExistStudent = yield student_model_1.Student.findOne({ _id: this.studentID });
        if (!isExistStudent) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Student not found!');
        }
        next();
    });
});
exports.Enrollment = (0, mongoose_1.model)('Enrollment', enrollmentSchema);
