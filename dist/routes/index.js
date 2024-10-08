"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_route_1 = require("../app/modules/auth/auth.route");
const student_route_1 = require("../app/modules/student/student.route");
const teacher_route_1 = require("../app/modules/teacher/teacher.route");
const course_route_1 = require("../app/modules/course/course.route");
const reviews_route_1 = require("../app/modules/reviews/reviews.route");
const router = express_1.default.Router();
const apiRoutes = [
    {
        path: '/students',
        route: student_route_1.StudentRoutes,
    },
    {
        path: '/courses',
        route: course_route_1.CourseRoutes,
    },
    {
        path: '/reviews',
        route: reviews_route_1.ReviewsRoutes,
    },
    {
        path: '/teachers',
        route: teacher_route_1.TeacherRoutes,
    },
    {
        path: '/auth',
        route: auth_route_1.AuthRoutes,
    },
];
apiRoutes.forEach(route => router.use(route.path, route.route));
exports.default = router;
