import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { TeacherService } from './teacher.service';
import ApiError from '../../../errors/ApiError';
import { logger } from '../../../shared/logger';

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...userData } = req.body;
    const result = await TeacherService.createTeacherToDB(userData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User created successfully',
      data: result,
    });
  }
);

const getTeacherProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await TeacherService.getTeacherProfileFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

//update profile

const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    let profile;
    if (req.files && 'profile' in req.files && req.files.profile[0]) {
      profile = `/profiles/${req.files.profile[0].filename}`;
    }

    const data = {
      profile,
      ...req.body,
    };
    const result = await TeacherService.updateProfileToDB(id, data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile updated successfully',
      data: result,
    });
  }
);

const getAllTeachers = catchAsync(async (req: Request, res: Response) => {
  const result = await TeacherService.getAllTeachersFromDB();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Teachers retrieved successfully',
    data: result,
  });
});

const getTeacherById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TeacherService.getTeacherByIdFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Teacher retrieved successfully',
    data: result,
  });
});

export const TeacherController = {
  createUser,
  getTeacherProfile,
  updateProfile,
  getTeacherById,
  getAllTeachers,
};
