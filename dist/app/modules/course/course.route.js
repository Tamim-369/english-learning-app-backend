"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseRoutes = void 0;
const express_1 = __importDefault(require("express"));
const course_controller_1 = require("./course.controller");
const fileUploadHandler_1 = __importDefault(require("../../middlewares/fileUploadHandler"));
const lecture_route_1 = require("./lecture/lecture.route");
const enrollment_route_1 = require("./enrollment/enrollment.route");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const router = express_1.default.Router();
router
    .post('/', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.TEACHER), (0, fileUploadHandler_1.default)(), course_controller_1.CourseController.createCourse)
    .get('/', course_controller_1.CourseController.getAllCourses)
    .get('/:id', course_controller_1.CourseController.getCourseById)
    .get('/teacher/:teacherID', course_controller_1.CourseController.getCourseByTeacherId)
    .get('/:id/lectures', course_controller_1.CourseController.getLecturesOfCourseByID)
    .patch('/:id', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.TEACHER), (0, fileUploadHandler_1.default)(), course_controller_1.CourseController.updateCourse)
    .delete('/:id', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.TEACHER), course_controller_1.CourseController.deleteCourse);
router.use('/lectures', lecture_route_1.LectureRoutes);
router.use('/enrollments', enrollment_route_1.EnrollmentRoutes);
exports.CourseRoutes = router;
