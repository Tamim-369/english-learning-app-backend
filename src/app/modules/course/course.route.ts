import express from 'express';
import { CourseController } from './course.controller';
import validateRequest from '../../middlewares/validateRequest';
import { CourseValidation } from './course.validation';
const router = express.Router();

router.post(
  '/',
  validateRequest(CourseValidation.createCourseZodSchema),
  CourseController.createCourse
);

export const CourseRoutes = router;
