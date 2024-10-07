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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LectureService = void 0;
const course_model_1 = require("../course.model");
const lecture_model_1 = require("./lecture.model");
const getLectureByIDFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield lecture_model_1.Lecture.findOne({ _id: id });
    if (!result) {
        throw new Error('Lecture not found');
    }
    return result;
});
const updateLectureToDB = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistLecture = yield lecture_model_1.Lecture.findOne({ _id: id });
    if (!isExistLecture) {
        throw new Error('Lecture not found');
    }
    const result = yield lecture_model_1.Lecture.findByIdAndUpdate(id, data, {
        new: true,
    });
    if (!result) {
        throw new Error('Lecture not updated');
    }
    return result;
});
const deleteLectureFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistLecture = yield lecture_model_1.Lecture.findOne({ _id: id });
    if (!isExistLecture) {
        throw new Error('Lecture not found');
    }
    const result = yield lecture_model_1.Lecture.deleteOne({ _id: id });
    if (!result) {
        throw new Error('Lecture not deleted');
    }
    return result;
});
const createLectureToDB = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistCourse = yield course_model_1.Course.findOne({ _id: data.courseID });
    if (!isExistCourse) {
        throw new Error('Course not found');
    }
    const result = yield lecture_model_1.Lecture.create(data);
    if (!result) {
        throw new Error('Lecture not created');
    }
    const pushed = yield course_model_1.Course.findOneAndUpdate({ _id: data.courseID }, { $push: { lectures: result._id } }, { new: true });
    if (!pushed) {
        throw new Error('Lecture not created');
    }
    return result;
});
exports.LectureService = {
    getLectureByIDFromDB,
    updateLectureToDB,
    deleteLectureFromDB,
    createLectureToDB,
};
