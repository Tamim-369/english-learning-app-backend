import { Model } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';
import { Education } from '../../../types/teacher';

export type ITeacher = {
  name: string;
  role?: USER_ROLES;
  phone: string;
  email: string;
  password: string;
  location: string;
  profile?: string;
  country?: string;
  gender?: string;
  status?: string;
  verified?: boolean;
  dateOfBirth?: Date;
  designation?: string;
  experience?: Number;
  stripeAccountId?: string;
  education?: [Education];
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
};

export type TeacherModel = {
  isExistTeacherById(id: string): any;
  isExistTeacherByEmail(email: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<ITeacher>;
