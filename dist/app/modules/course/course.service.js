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
exports.CourseService = void 0;
const http_status_codes_1 = require("http-status-codes");
const course_model_1 = require("./course.model");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const teacher_model_1 = require("../teacher/teacher.model");
const user_1 = require("../../../enums/user");
const lecture_model_1 = require("./lecture/lecture.model");
const course_validation_1 = require("./course.validation");
const stripe_1 = __importDefault(require("stripe"));
const config_1 = __importDefault(require("../../../config"));
// without stripe
// const createCourseToDB = async (data: any): Promise<Partial<ICourse>> => {
//   const isExistTeacher = await Teacher.findOne({ _id: data.teacherID });
//   const isTeacherDeleted = isExistTeacher?.status === status.delete;
//   let lectures;
//   if (data.lectures.length > 0) {
//     lectures = data.lectures;
//     delete data.lectures;
//   }
//   if (!isExistTeacher) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'Teacher not found!');
//   }
//   if (isTeacherDeleted) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'Teacher deleted!');
//   }
//   const time = JSON.parse(data.time);
//   data.time = {
//     start: new Date(time.start),
//     end: new Date(time.end),
//   };
//   data.price = Number(data.price);
//   data.studentRange = Number(data.studentRange);
//   data.time.start = data.time.start.toString();
//   data.time.end = data.time.end.toString();
//   const validateData = {
//     body: {
//       ...data,
//     },
//   };
//   await CourseValidation.createCourseZodSchema.parseAsync(validateData);
//   const result = await Course.create(data);
//   if (!result) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'Course not created!');
//   }
//   if (lectures) {
//     const jsonLectures = JSON.parse(lectures);
//     if (!Array.isArray(jsonLectures)) {
//       throw new ApiError(
//         StatusCodes.BAD_REQUEST,
//         'Lectures must be an array of lectures!'
//       );
//     }
//     for (const lecture of jsonLectures) {
//       const resultLecture = await Lecture.create({
//         ...lecture,
//         courseID: result._id,
//       });
//       if (!resultLecture) {
//         throw new ApiError(StatusCodes.BAD_REQUEST, 'Lecture not created!');
//       }
//       await Course.findByIdAndUpdate(result._id, {
//         $push: {
//           lectures: resultLecture._id,
//         },
//       });
//     }
//   } else {
//     await Course.findByIdAndUpdate(result._id, {
//       $push: {
//         lectures: [],
//       },
//     });
//   }
//   return result;
// };
// with stripe
const createCourseToDB = (data) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate the teacher's existence
    const isExistTeacher = yield teacher_model_1.Teacher.findOne({ _id: data.teacherID });
    // @ts-ignore
    const isTeacherDeleted = (isExistTeacher === null || isExistTeacher === void 0 ? void 0 : isExistTeacher.status) === user_1.status.delete;
    let lectures;
    const stripe = new stripe_1.default(config_1.default.stripe_secret_key);
    // Handle lectures if they exist
    if (data.lectures.length > 0) {
        lectures = data.lectures;
        delete data.lectures;
    }
    if (!isExistTeacher) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Teacher not found!');
    }
    if (isTeacherDeleted) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Teacher deleted!');
    }
    // Parse and format time
    const time = JSON.parse(data.time);
    data.time = {
        start: new Date(time.start),
        end: new Date(time.end),
    };
    data.price = Number(data.price);
    data.studentRange = Number(data.studentRange);
    data.time.start = data.time.start.toString();
    data.time.end = data.time.end.toString();
    // Validate the course data
    const validateData = {
        body: Object.assign({}, data),
    };
    yield course_validation_1.CourseValidation.createCourseZodSchema.parseAsync(validateData);
    // Create the course in the database
    const result = yield course_model_1.Course.create(data);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Course not created!');
    }
    // Create a product in Stripe
    let stripeProduct;
    try {
        stripeProduct = yield stripe.products.create({
            name: data.name,
            description: data.details,
            metadata: {
                courseId: result._id.toString(),
            },
        });
        yield stripe.prices.create({
            unit_amount: data.price * 100,
            currency: 'usd',
            product: stripeProduct.id,
        });
    }
    catch (error) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'Stripe product creation failed!');
    }
    // Handle lectures creation if they exist
    if (lectures) {
        const jsonLectures = JSON.parse(lectures);
        if (!Array.isArray(jsonLectures)) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Lectures must be an array of lectures!');
        }
        for (const lecture of jsonLectures) {
            const resultLecture = yield lecture_model_1.Lecture.create(Object.assign(Object.assign({}, lecture), { courseID: result._id }));
            if (!resultLecture) {
                throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Lecture not created!');
            }
            yield course_model_1.Course.findByIdAndUpdate(result._id, {
                $push: {
                    lectures: resultLecture._id,
                },
            });
        }
    }
    else {
        yield course_model_1.Course.findByIdAndUpdate(result._id, {
            $push: {
                lectures: [],
            },
        });
    }
    return result;
});
const updateCourseToDB = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistCourse = yield course_model_1.Course.findOne({ _id: id });
    if (!isExistCourse) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Course not found!');
    }
    const result = yield course_model_1.Course.findByIdAndUpdate(id, data, {
        new: true,
    });
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Course not updated!');
    }
    return result;
});
const getAllCoursesFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield course_model_1.Course.find();
    return result;
});
const getCourseByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield course_model_1.Course.findOne({ _id: id });
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Course not found!');
    }
    if (result.status === user_1.status.delete) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Course deleted!');
    }
    return result;
});
const getCourseByTeacherIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistTeacher = yield teacher_model_1.Teacher.findOne({ _id: id });
    if (!isExistTeacher) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Teacher not found!');
    }
    // @ts-ignore
    if (isExistTeacher.status === user_1.status.delete) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Teacher deleted!');
    }
    const result = yield course_model_1.Course.find({
        teacherID: id,
        status: { $ne: user_1.status.delete },
    });
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Course not found!');
    }
    return result;
});
const getLecturesOfCourseFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existCourse = yield course_model_1.Course.findOne({ _id: id });
    if ((existCourse === null || existCourse === void 0 ? void 0 : existCourse.status) === user_1.status.delete) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Course deleted!');
    }
    if (!existCourse) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Course not found!');
    }
    const result = yield lecture_model_1.Lecture.find({ courseID: id });
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Course not found!');
    }
    return result;
});
const deleteCourseFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existCourse = yield course_model_1.Course.findOne({ _id: id });
    if ((existCourse === null || existCourse === void 0 ? void 0 : existCourse.status) === user_1.status.delete) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Course deleted!');
    }
    if (!existCourse) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Course not found!');
    }
    const result = yield course_model_1.Course.findByIdAndUpdate(id, {
        status: user_1.status.delete,
    });
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Course not deleted!');
    }
    return result;
});
exports.CourseService = {
    createCourseToDB,
    getCourseByTeacherIdFromDB,
    getAllCoursesFromDB,
    getCourseByIdFromDB,
    updateCourseToDB,
    getLecturesOfCourseFromDB,
    deleteCourseFromDB,
};
