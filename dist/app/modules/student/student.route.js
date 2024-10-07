"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const fileUploadHandler_1 = __importDefault(require("../../middlewares/fileUploadHandler"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const student_controller_1 = require("./student.controller");
const student_validation_1 = require("./student.validation");
const router = express_1.default.Router();
router
    .get('/', student_controller_1.StudentController.getAllStudents)
    .get('/:id', student_controller_1.StudentController.getStudentById)
    .patch('/:id', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.STUDENT), (0, fileUploadHandler_1.default)(), student_controller_1.StudentController.updateProfile)
    .delete('/:id', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.STUDENT), student_controller_1.StudentController.deleteStudent)
    .route('/')
    .post((0, validateRequest_1.default)(student_validation_1.StudentValidation.createStudentZodSchema), student_controller_1.StudentController.createStudent)
    .patch((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.STUDENT), (0, fileUploadHandler_1.default)(), student_controller_1.StudentController.updateProfile);
exports.StudentRoutes = router;
