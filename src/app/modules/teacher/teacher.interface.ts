import { Model } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';
import { Education } from '../../../types/teacher';

export type ITeacher = {
  name: string;
  role?: USER_ROLES;
  phone: string;
  email: string;
  password: string;
  location?: string;
  profile?: string;
  country?: string;
  gender?: 'male' | 'female' | 'other'; // Consider using a union type for clarity
  status?: 'active' | 'deleted'; // Consider using a union type for clarity
  verified?: boolean; // Optional
  dateOfBirth?: Date; // Optional
  designation?: string; // Optional
  experience?: number; // Changed to lowercase 'number'
  stripeAccountId?: string; // Optional
  education?: Education[]; // Changed to use array notation directly
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode?: number; // Made optional in case not set
    expireAt?: Date; // Made optional in case not set
  };
};

export type TeacherModel = {
  isExistTeacherById(id: string): Promise<ITeacher | null>; // Specify return type more clearly
  isExistTeacherByEmail(email: string): Promise<ITeacher | null>; // Specify return type more clearly
  isMatchPassword(password: string, hashPassword: string): Promise<boolean>; // Specify return type more clearly
} & Model<ITeacher>;
