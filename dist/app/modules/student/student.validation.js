"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentValidation = void 0;
const zod_1 = require("zod");
const createStudentZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ required_error: 'Name is required' }),
        email: zod_1.z.string({ required_error: 'Email is required' }),
        phone: zod_1.z.string({ required_error: 'Phone Number is required' }),
        address: zod_1.z.string({ required_error: 'Address is required' }),
        password: zod_1.z.string({ required_error: 'Password is required' }),
        profile: zod_1.z.string().optional(),
    }),
});
const updateStudentZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        email: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        profile: zod_1.z.string().optional(),
        password: zod_1.z.string().optional(),
        dateOfBirth: zod_1.z.date().optional(),
        status: zod_1.z.string().optional(),
        gender: zod_1.z
            .enum(['male', 'female', 'other'], {
            invalid_type_error: 'Gender can only be male, female or other',
        })
            .optional(),
        verified: zod_1.z.boolean().optional(),
    }),
});
exports.StudentValidation = {
    createStudentZodSchema,
    updateStudentZodSchema,
};
