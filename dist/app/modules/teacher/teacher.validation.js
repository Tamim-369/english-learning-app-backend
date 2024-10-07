"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherValidation = void 0;
const zod_1 = require("zod");
const createTeacherZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ required_error: 'Name is required' }),
        email: zod_1.z.string({ required_error: 'Email is required' }),
        phone: zod_1.z.string({ required_error: 'Phone Number is required' }),
        stripeAccountId: zod_1.z.string().optional(),
        password: zod_1.z.string({ required_error: 'Password is required' }),
        profile: zod_1.z.string().optional(),
    }),
});
const updateTeacherZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        email: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional(),
        password: zod_1.z.string().optional(),
        profile: zod_1.z.string().optional(),
        location: zod_1.z.string().optional(),
        status: zod_1.z.string().optional(),
        verified: zod_1.z.boolean().optional(),
        country: zod_1.z.string().optional(),
        gender: zod_1.z
            .enum(['male', 'female', 'other'], {
            invalid_type_error: 'Gender can only be male, female or other',
        })
            .optional(),
        dateOfBirth: zod_1.z.date().optional(),
        designation: zod_1.z.string().optional(),
        experience: zod_1.z.number().optional(),
        education: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
exports.TeacherValidation = {
    createTeacherZodSchema,
    updateTeacherZodSchema,
};
