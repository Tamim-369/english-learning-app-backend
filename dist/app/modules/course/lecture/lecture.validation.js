"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LectureValidation = void 0;
const zod_1 = require("zod");
const createLectureZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        courseID: zod_1.z.string({ required_error: 'Course ID is required' }),
        title: zod_1.z.string({ required_error: 'Lecture title is required' }),
        date: zod_1.z.string({ required_error: 'Lecture date is required' }),
    }),
});
const updateLectureZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().optional(),
        date: zod_1.z.string().optional(),
    }),
});
exports.LectureValidation = {
    createLectureZodSchema,
    updateLectureZodSchema,
};
