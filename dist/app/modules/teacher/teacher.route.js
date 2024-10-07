"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const fileUploadHandler_1 = __importDefault(require("../../middlewares/fileUploadHandler"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const teacher_controller_1 = require("./teacher.controller");
const teacher_validation_1 = require("./teacher.validation");
const router = express_1.default.Router();
router
    .get('/profile', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.TEACHER), teacher_controller_1.TeacherController.getTeacherProfile)
    .get('/all', teacher_controller_1.TeacherController.getAllTeachers)
    .get('/:id', teacher_controller_1.TeacherController.getTeacherById)
    .patch('/:id', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.TEACHER), (0, validateRequest_1.default)(teacher_validation_1.TeacherValidation.updateTeacherZodSchema), (0, fileUploadHandler_1.default)(), teacher_controller_1.TeacherController.updateProfile)
    .delete('/:id', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.TEACHER), teacher_controller_1.TeacherController.deleteTeacher)
    .route('/')
    .post((0, validateRequest_1.default)(teacher_validation_1.TeacherValidation.createTeacherZodSchema), teacher_controller_1.TeacherController.createUser)
    .patch((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.TEACHER), (0, fileUploadHandler_1.default)(), teacher_controller_1.TeacherController.updateProfile);
exports.TeacherRoutes = router;
