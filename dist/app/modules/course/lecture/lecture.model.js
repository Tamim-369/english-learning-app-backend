"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lecture = void 0;
const mongoose_1 = require("mongoose");
const lectureSchema = new mongoose_1.Schema({
    courseID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'Course ID is required'],
    },
    title: {
        type: String,
        required: [true, 'Lecture title is required'],
    },
    date: {
        type: Date,
        required: [true, 'Lecture date is required'],
    },
}, { timestamps: true });
exports.Lecture = (0, mongoose_1.model)('Lecture', lectureSchema);
