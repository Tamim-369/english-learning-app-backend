"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LectureRoutes = void 0;
const express_1 = __importDefault(require("express"));
const lecture_controller_1 = require("./lecture.controller");
const validateRequest_1 = __importDefault(require("../../../middlewares/validateRequest"));
const lecture_validation_1 = require("./lecture.validation");
const user_1 = require("../../../../enums/user");
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const router = express_1.default.Router();
router
    .get('/:id', lecture_controller_1.LectureController.getLectureByID)
    .post('/', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.TEACHER), (0, validateRequest_1.default)(lecture_validation_1.LectureValidation.createLectureZodSchema), lecture_controller_1.LectureController.createLecture)
    .patch('/:id', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.TEACHER), (0, validateRequest_1.default)(lecture_validation_1.LectureValidation.updateLectureZodSchema), lecture_controller_1.LectureController.updateLecture)
    .delete('/:id', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.TEACHER), lecture_controller_1.LectureController.deleteLecture);
exports.LectureRoutes = router;
