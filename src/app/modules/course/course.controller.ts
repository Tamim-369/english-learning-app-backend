import { StatusCodes } from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CourseService } from './course.service';
import { logger } from '../../../shared/logger';

const createCourse = catchAsync(async (req: Request, res: Response) => {
  const { ...courseData } = req.body;
  let banner;
  if (req.files && 'banner' in req.files && req.files.banner[0]) {
    banner = `/banners/${req.files.banner[0].filename}`;
  }
  const data = {
    banner,
    ...courseData,
  };
  logger.info(JSON.stringify(data));
  const result = await CourseService.createCourseToDB(data);

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
