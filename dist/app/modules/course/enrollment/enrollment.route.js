"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const enrollment_controller_1 = require("./enrollment.controller");
const validateRequest_1 = __importDefault(require("../../../middlewares/validateRequest"));
const enrollment_validation_1 = require("./enrollment.validation");
const router = express_1.default.Router();
router.post('/', 
// auth(USER_ROLES.ADMIN, USER_ROLES.STUDENT),
(0, validateRequest_1.default)(enrollment_validation_1.EnrollmentValidation.createEnrollmentZodSchema), enrollment_controller_1.EnrollmentController.createEnrollment);
exports.EnrollmentRoutes = router;
