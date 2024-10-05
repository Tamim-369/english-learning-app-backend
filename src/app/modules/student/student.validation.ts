import { z } from 'zod';

const createStudentZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    email: z.string({ required_error: 'Email is required' }),
    phone: z.string({ required_error: 'Phone Number is required' }),
    address: z.string({ required_error: 'Address is required' }),
    password: z.string({ required_error: 'Password is required' }),
    profile: z.string().optional(),
  }),
});

export const StudentValidation = {
  createStudentZodSchema,
};
