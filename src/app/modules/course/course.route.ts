import express from 'express';
import { CourseController } from './course.controller';
import validateRequest from '../../middlewares/validateRequest';
import { CourseValidation } from './course.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
const router = express.Router();

router.post(
  '/',
  // validateRequest(CourseValidation.createCourseZodSchema),
  fileUploadHandler(),
  CourseController.createCourse
);

export const CourseRoutes = router;
