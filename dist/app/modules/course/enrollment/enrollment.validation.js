"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentValidation = void 0;
const zod_1 = require("zod");
const createEnrollmentZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        courseID: zod_1.z.string({ required_error: 'Course ID is required' }),
        studentID: zod_1.z.string({ required_error: 'Student ID is required' }),
    }),
});
exports.EnrollmentValidation = {
    createEnrollmentZodSchema,
};
