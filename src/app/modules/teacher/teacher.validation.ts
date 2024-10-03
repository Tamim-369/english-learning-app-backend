import { z } from 'zod';

const createTeacherZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    email: z.string({ required_error: 'Email is required' }),
    phone: z.string({ required_error: 'Phone Number is required' }),
    password: z.string({ required_error: 'Password is required' }),
    profile: z.string().optional(),
  }),
});

const updateTeacherZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    password: z.string().optional(),
    profile: z.string().optional(),
    location: z.string().optional(),
    status: z.string().optional(),
    verified: z.boolean().optional(),
    country: z.string().optional(),
    gender: z
      .enum(['male', 'female', 'other'], {
        invalid_type_error: 'Gender can only be male, female or other',
      })
      .optional(),
    dateOfBirth: z.date().optional(),
    designation: z.string().optional(),
    experience: z.number().optional(),
    education: z.array(z.string()).optional(),
  }),
});

export const TeacherValidation = {
  createTeacherZodSchema,
  updateTeacherZodSchema,
};
