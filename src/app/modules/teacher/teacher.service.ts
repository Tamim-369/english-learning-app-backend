import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { ITeacher } from './teacher.interface';
import { Teacher } from './teacher.model';
import Stripe from 'stripe';
import config from '../../../config';

const stripeSecretKey = config.stripe_secret_key;

if (!stripeSecretKey) {
  throw new Error('Stripe secret key is not defined.');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-09-30.acacia',
});

const createTeacherToDB = async (payload: Partial<ITeacher>): Promise<any> => {
  payload.role = USER_ROLES.TEACHER;
  const isExistUser = await Teacher.findOne({ email: payload.email });

  if (isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Teacher already exist!');
  }
  const account = await stripe.accounts.create({
    type: 'express',
    email: payload.email,
    business_type: 'individual',
    individual: {
      first_name: payload.firstName,
      last_name: payload.lastName,
      email: payload.email,
    },
    capabilities: {
      transfers: { requested: true },
    },
  });
  payload.stripeAccountId = account.id;
  const createTeacher = await Teacher.create(payload);
  if (!createTeacher) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }
  return createTeacher;
};

const getTeacherProfileFromDB = async (
  teacher: JwtPayload
): Promise<Partial<ITeacher>> => {
  const { id } = teacher;
  const isExistTeacher = await Teacher.isExistTeacherById(id);
  if (!isExistTeacher) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Teacher doesn't exist!");
  }

  return isExistTeacher;
};

const updateProfileToDB = async (
  id: string,
  payload: Partial<ITeacher>
): Promise<Partial<ITeacher | null>> => {
  const isExistUser = await Teacher.findById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Teacher doesn't exist!");
  }

  //unlink file here
  if (payload.profile) {
    unlinkFile(isExistUser.profile!);
  }

  const updateDoc = await Teacher.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};

const getAllTeachersFromDB = async (): Promise<Partial<ITeacher>[]> => {
  const result = await Teacher.find({}, { password: 0 });
  return result;
};
const getTeacherByIdFromDB = async (
  id: string
): Promise<Partial<ITeacher | null>> => {
  const result = await Teacher.findOne({ _id: id }, { password: 0 });
  return result;
};

const deleteTeacherFromDB = async (id: string): Promise<Partial<any>> => {
  const result = await Teacher.findOneAndDelete({ _id: id });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Teacher doesn't exist!");
  }
  return { message: 'Teacher deleted successfully' };
};

export const TeacherService = {
  createTeacherToDB,
  getTeacherProfileFromDB,
  updateProfileToDB,
  getAllTeachersFromDB,
  getTeacherByIdFromDB,
  deleteTeacherFromDB,
};
