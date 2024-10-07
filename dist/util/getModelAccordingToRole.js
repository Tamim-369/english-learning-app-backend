"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModelAccordingToRole = void 0;
const http_status_codes_1 = require("http-status-codes");
const student_model_1 = require("../app/modules/student/student.model");
const teacher_model_1 = require("../app/modules/teacher/teacher.model");
const user_1 = require("../enums/user");
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const getModelAccordingToRole = (existUser) => {
    let User;
    if (existUser.role === user_1.USER_ROLES.TEACHER) {
        User = teacher_model_1.Teacher;
    }
    else if (existUser.role === user_1.USER_ROLES.STUDENT) {
        User = student_model_1.Student;
    }
    else {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User Role doesn't exist!");
    }
    return User;
};
exports.getModelAccordingToRole = getModelAccordingToRole;
