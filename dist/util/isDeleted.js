"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isStudentDeleted = void 0;
const user_1 = require("../enums/user");
const isStudentDeleted = (student) => {
    if (student) {
        if (student.status === user_1.status.delete) {
            return true;
        }
        return false;
    }
    return false;
};
exports.isStudentDeleted = isStudentDeleted;
