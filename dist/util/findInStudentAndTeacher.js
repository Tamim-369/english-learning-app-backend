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
exports.findInStudentAndTeacher = void 0;
const http_status_codes_1 = require("http-status-codes");
const student_model_1 = require("../app/modules/student/student.model");
const teacher_model_1 = require("../app/modules/teacher/teacher.model");
const ApiError_1 = __importDefault(require("../errors/ApiError"));
// first we define a variable called existUser it's initially null then we start checking if there is any user with that email if it doesn't we check if there is any teacher with that email if it doesn't exist we throw an error and if anything exist using this email we store that in existUser and continue the process with exist user
const findInStudentAndTeacher = (email_1, ...args_1) => __awaiter(void 0, [email_1, ...args_1], void 0, function* (email, selectItem = '') {
    let existUser = null;
    const isExistUser = yield student_model_1.Student.findOne({ email }).select(`+${selectItem}`);
    if (!isExistUser) {
        const isExistTeracher = yield teacher_model_1.Teacher.findOne({ email }).select(`+${selectItem}`);
        if (isExistTeracher) {
            existUser = isExistTeracher;
        }
        else {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
        }
    }
    else {
        existUser = isExistUser;
    }
    return existUser;
});
exports.findInStudentAndTeacher = findInStudentAndTeacher;
