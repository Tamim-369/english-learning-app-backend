import express from 'express';
import { CourseController } from './course.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { CourseValidation } from './course.validation';
const router = express.Router();

router.post('/', fileUploadHandler(), CourseController.createCourse);

export const CourseRoutes = router;
