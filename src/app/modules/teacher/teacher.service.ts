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

const createTeacherToDB = async (
  payload: Partial<ITeacher>
): Promise<ITeacher> => {
  //set role
  payload.role = USER_ROLES.TEACHER;
  const createTeacher = await Teacher.create(payload);
  if (!createTeacher) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  //send email
  const otp = generateOTP();
  const values = {
    name: createTeacher.name,
    otp: otp,
    email: createTeacher.email!,
  };
  const createAccountTemplate = emailTemplate.createAccount(values);
  emailHelper.sendEmail(createAccountTemplate);

  //save to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };
  await Teacher.findOneAndUpdate(
    { _id: createTeacher._id },
    { $set: { authentication } }
  );

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
  const isExistUser = await Teacher.isExistTeacherById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Teacher doesn't exist!");
  }

  //unlink file here
  if (payload.profile) {
    unlinkFile(isExistUser.profile);
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

export const TeacherService = {
  createTeacherToDB,
  getTeacherProfileFromDB,
  updateProfileToDB,
  getAllTeachersFromDB,
  getTeacherByIdFromDB,
};
