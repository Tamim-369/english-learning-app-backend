import { StatusCodes } from 'http-status-codes';
import { Student } from '../app/modules/student/student.model';
import { Teacher } from '../app/modules/teacher/teacher.model';
import { USER_ROLES } from '../enums/user';
import ApiError from '../errors/ApiError';

export const getModelAccordingToRole = (existUser: any) => {
  let User;
  if (existUser.role === USER_ROLES.TEACHER) {
    User = Teacher;
  } else if (existUser.role === USER_ROLES.STUDENT) {
    User = Teacher;
  } else if (existUser.role === USER_ROLES.ADMIN) {
    // admin comming soon
    // User = Admin;
  } else {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User Role doesn't exist!");
  }
  return User;
};
