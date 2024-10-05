import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { TeacherController } from './teacher.controller';
import { TeacherValidation } from './teacher.validation';
const router = express.Router();
// get teacher details including the private information like password
router.get(
  '/profile',
  auth(USER_ROLES.ADMIN, USER_ROLES.TEACHER),
  TeacherController.getTeacherProfile
);
// get all teachers
router.get('/all', TeacherController.getAllTeachers);
// get teacher by id
router.get('/:id', TeacherController.getTeacherById);
// update teacher profile
router.put(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.TEACHER),
  validateRequest(TeacherValidation.updateTeacherZodSchema),
  fileUploadHandler(),
  TeacherController.updateProfile
);

// create new teacher
router
  .route('/')
  .post(
    validateRequest(TeacherValidation.createTeacherZodSchema),
    TeacherController.createUser
  )
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.TEACHER),
    fileUploadHandler(),
    TeacherController.updateProfile
  );

export const TeacherRoutes = router;
