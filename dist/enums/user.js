"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.status = exports.USER_ROLES = void 0;
var USER_ROLES;
(function (USER_ROLES) {
    USER_ROLES["ADMIN"] = "ADMIN";
    // USER = 'USER',
    USER_ROLES["STUDENT"] = "STUDENT";
    USER_ROLES["TEACHER"] = "TEACHER";
})(USER_ROLES || (exports.USER_ROLES = USER_ROLES = {}));
var status;
(function (status) {
    status["active"] = "active";
    status["delete"] = "delete";
})(status || (exports.status = status = {}));
