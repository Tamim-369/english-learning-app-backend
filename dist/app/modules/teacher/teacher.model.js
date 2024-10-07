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
exports.Teacher = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_codes_1 = require("http-status-codes");
const mongoose_1 = require("mongoose");
const config_1 = __importDefault(require("../../../config"));
const user_1 = require("../../../enums/user");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const teacherSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: user_1.USER_ROLES.TEACHER,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    phone: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        select: 0,
        minlength: 8,
    },
    location: {
        type: String,
    },
    profile: {
        type: String,
        default: 'https://i.ibb.co/z5YHLV9/profile.png',
    },
    status: {
        type: String,
        enum: ['active', 'delete'],
        default: 'active',
    },
    verified: {
        type: Boolean,
        default: false,
    },
    country: {
        type: String,
    },
    gender: {
        type: String,
        default: 'male',
        enum: ['male', 'female', 'other'],
    },
    dateOfBirth: {
        type: Date,
    },
    designation: {
        type: String,
    },
    experience: {
        type: Number,
    },
    stripeAccountId: {
        type: String,
        default: null,
    },
    education: [
        {
            degree: {
                type: String,
                required: true,
            },
            institute: {
                type: String,
                required: true,
            },
        },
    ],
    authentication: {
        type: {
            isResetPassword: {
                type: Boolean,
                default: false,
            },
            oneTimeCode: {
                type: Number,
                default: null,
            },
            expireAt: {
                type: Date,
                default: null,
            },
        },
        select: 0,
    },
}, { timestamps: true });
//exist Teacher check
teacherSchema.statics.isExistTeacherById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield exports.Teacher.findById(id);
    return isExist;
});
teacherSchema.statics.isExistTeacherByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield exports.Teacher.findOne({ email });
    return isExist;
});
//is match password
teacherSchema.statics.isMatchPassword = (password, hashPassword) => __awaiter(void 0, void 0, void 0, function* () {
    return yield bcrypt_1.default.compare(password, hashPassword);
});
//check Teacher
teacherSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        //check Teacher
        const isExist = yield exports.Teacher.findOne({ email: this.email });
        if (isExist) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Email already exist!');
        }
        //password hash
        this.password = yield bcrypt_1.default.hash(this.password, Number(config_1.default.bcrypt_salt_rounds));
        next();
    });
});
exports.Teacher = (0, mongoose_1.model)('Teacher', teacherSchema);
