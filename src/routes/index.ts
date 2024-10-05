import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { StudentRoutes } from '../app/modules/student/student.route';
import { TeacherRoutes } from '../app/modules/teacher/teacher.route';
import { CourseRoutes } from '../app/modules/course/course.route';
const router = express.Router();

const apiRoutes = [
  {
    path: '/students',
    route: StudentRoutes,
  },
  {
    path: '/courses',
    route: CourseRoutes,
  },
  {
    path: '/teachers',
    route: TeacherRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
