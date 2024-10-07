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
exports.Course = void 0;
const http_status_codes_1 = require("http-status-codes");
const mongoose_1 = require("mongoose");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const teacher_model_1 = require("../teacher/teacher.model");
const courseSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    banner: {
        type: String,
        required: true,
    },
    details: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['platform', 'freelancer'],
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    studentRange: {
        type: Number,
        required: true,
    },
    teacherID: {
        type: String,
        required: true,
    },
    enrollmentsID: {
        type: [String],
        required: false,
    },
    lectures: {
        type: [String],
        required: true,
    },
    time: {
        start: { type: Date, required: true },
        end: { type: Date, required: true },
    },
    status: {
        type: String,
        enum: ['active', 'delete'],
        default: 'active',
    },
}, { timestamps: true });
courseSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        //check user
        const isExistTecher = yield teacher_model_1.Teacher.findOne({ _id: this.teacherID });
        if (!isExistTecher) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Teacher not found!');
        }
        next();
    });
});
exports.Course = (0, mongoose_1.model)('Course', courseSchema);
