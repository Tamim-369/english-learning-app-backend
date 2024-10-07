"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseValidation = void 0;
const zod_1 = require("zod");
const createCourseZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ required_error: 'Course Name is required' }),
        details: zod_1.z.string({ required_error: 'Course Description is required' }),
        banner: zod_1.z.string().optional(),
        price: zod_1.z.number({ required_error: 'Course Price is required' }),
        studentRange: zod_1.z.number({ required_error: 'Student Range is required' }),
        duration: zod_1.z
            .string({ required_error: 'Course Duration is required' })
            .regex(/^[0-9]+(m|h|d|w)$/, { message: 'Invalid duration format' }),
        time: zod_1.z.object({
            start: zod_1.z.string({ required_error: 'Start time is required' }),
            end: zod_1.z.string({ required_error: 'End time is required' }),
        }),
        teacherID: zod_1.z
            .string({ required_error: 'Teacher ID is required' })
            .optional(),
        lectures: zod_1.z
            .array(zod_1.z.object({
            title: zod_1.z.string({ required_error: 'Lecture title is required' }),
            date: zod_1.z.string({ required_error: 'Lecture date is required' }),
        }), { invalid_type_error: 'Lectures must be an array' })
            .optional(),
    }),
});
const updateCourseValidation = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        details: zod_1.z.string().optional(),
        banner: zod_1.z.string().optional(),
        price: zod_1.z.number().optional(),
        studentRange: zod_1.z.number().optional(),
        duration: zod_1.z
            .string({ required_error: 'Course Duration is required' })
            .regex(/^[0-9]+(m|h|d|w)$/, { message: 'Invalid duration format' })
            .optional(),
        time: zod_1.z
            .object({
            start: zod_1.z.string({ required_error: 'Start time is required' }),
            end: zod_1.z.string({ required_error: 'End time is required' }),
        })
            .optional(),
        teacherID: zod_1.z
            .string({ required_error: 'Teacher ID is required' })
            .optional(),
        lectures: zod_1.z
            .array(zod_1.z.object({
            title: zod_1.z.string({ required_error: 'Lecture title is required' }),
            date: zod_1.z.string({ required_error: 'Lecture date is required' }),
        }), { invalid_type_error: 'Lectures must be an array' })
            .optional(),
    }),
});
exports.CourseValidation = {
    createCourseZodSchema,
    updateCourseValidation,
};
