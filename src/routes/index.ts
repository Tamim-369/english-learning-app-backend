import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/student/user.route';
import { TeacherRoutes } from '../app/modules/teacher/teacher.route';
const router = express.Router();

const apiRoutes = [
  {
    path: '/student',
    route: UserRoutes,
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
