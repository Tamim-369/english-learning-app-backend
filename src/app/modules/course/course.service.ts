import { StatusCodes } from 'http-status-codes';
import { ICourse } from './course.interface';
import { Course } from './course.model';
import ApiError from '../../../errors/ApiError';
import { Teacher } from '../teacher/teacher.model';
import { status } from '../../../enums/user';
import { Lecture } from './lecture/lecture.model';

const createCourseToDB = async (data: any): Promise<Partial<ICourse>> => {
  const isExistTeacher = await Teacher.findOne({ _id: data.teacherID });
  const isTeacherDeleted = (await isExistTeacher?.status) === status.delete;
  if (data?.lectures.length === 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Lectures not found!');
  }
  if (!data?.lectures) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Lectures not found!');
  }
  let lectures;
  if (data.lectures.length > 0) {
    lectures = data.lectures;
    delete data.lectures;
  }
  if (!isExistTeacher) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Teacher not found!');
  }
  if (isTeacherDeleted) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Teacher deleted!');
  }
  const time = JSON.parse(data.time);
  data.time = {
    start: new Date(time.start),
    end: new Date(time.end),
  };
  const result = await Course.create(data);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Course not created!');
  }
  if (lectures) {
    const jsonLectures = JSON.parse(lectures);
    if (!Array.isArray(jsonLectures)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Lectures must be an array of lectures!'
      );
    }
    for (const lecture of jsonLectures) {
      const resultLecture = await Lecture.create({
        ...lecture,
        courseID: result._id,
      });
      if (!resultLecture) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Lecture not created!');
      }
      await Course.findByIdAndUpdate(result._id, {
        $push: {
          lectures: resultLecture._id,
        },
      });
    }
  }
  return result;
};

export const CourseService = {
  createCourseToDB,
};
