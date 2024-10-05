import { StatusCodes } from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CourseService } from './course.service';

const createCourse = catchAsync(async (req: Request, res: Response) => {
  const { ...courseData } = req.body;
  const result = await CourseService.createCourseToDB(courseData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Course created successfully',
    data: result,
  });
});

export const CourseController = {
  createCourse,
};
