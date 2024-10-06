import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { ITeacher } from './teacher.interface';
import { Teacher } from './teacher.model';

const stripe = require('stripe')(
  process.env.STRIPE_SECRET_KEY ||
    'sk_test_51Q6nR92LZOEqC8MeWGXjg2bIBhFLkms1rUPAIumJwZHGZd6POrz5B1yFZGoNQ9TEnw5OtVGE5yq9RYjcwucTgfAi00tVo7w6V6'
);
const createTeacherToDB = async (
  payload: Partial<ITeacher>
): Promise<ITeacher> => {
  // Set role
  payload.role = USER_ROLES.TEACHER;

  // Create teacher in the database
  const createTeacher = await Teacher.create(payload);
  if (!createTeacher) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  // Create a new Stripe account
  const account = await stripe.accounts.create({
    type: 'express', // Use 'standard' or 'express' based on your needs
    country: 'US', // Change based on the country of the teacher
    email: createTeacher.email, // Use the teacher's email
    capabilities: {
      transfers: { requested: true },
      card_payments: { requested: true },
    },
  });

  // Save the Stripe account ID to the teacher's record in the database
  await Teacher.findOneAndUpdate(
    { _id: createTeacher._id },
    { $set: { stripeAccountId: account.id } } // Make sure your Teacher model has a field for stripeAccountId
  );

  // Set the required fields for account activation
  // const representative = {
  //   dob: {
  //     day: 1, // Example day, replace with actual data from the teacher
  //     month: 1, // Example month, replace with actual data from the teacher
  //     year: 1990, // Example year, replace with actual data from the teacher
  //   },
  //   email: createTeacher.email, // Teacher's email
  //   first_name: createTeacher.name.split(' ')[0], // Assuming the first part of the name is the first name
  //   last_name: createTeacher.name.split(' ')[1] || '', // Assuming the second part of the name is the last name
  // };

  // Update the Stripe account with additional required information
  await stripe.accounts.update(account.id, {
    business_profile: {
      mcc: '1234', // Replace with actual MCC
      url: 'http://localhost:5000/api/v1/teachers/' + createTeacher._id,
    },
    business_type: 'individual', // Specify the business type
    // representative: representative,
    settings: {
      payments: {
        statement_descriptor: 'Teacher', // Your statement descriptor
      },
    },
    tos_acceptance: {
      date: Math.floor(Date.now() / 1000), // Current timestamp
      ip: '192.0.2.1', // Replace with the actual IP address
    },
  });

  // Send email
  const otp = generateOTP();
  const values = {
    name: createTeacher.name,
    otp: otp,
    email: createTeacher.email!,
  };
  const createAccountTemplate = emailTemplate.createAccount(values);
  emailHelper.sendEmail(createAccountTemplate);

  // Save OTP to the teacher's authentication details
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };
  await Teacher.findOneAndUpdate(
    { _id: createTeacher._id },
    { $set: { authentication } }
  );

  return createTeacher;
};

const getTeacherProfileFromDB = async (
  teacher: JwtPayload
): Promise<Partial<ITeacher>> => {
  const { id } = teacher;
  const isExistTeacher = await Teacher.isExistTeacherById(id);
  if (!isExistTeacher) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Teacher doesn't exist!");
  }

  return isExistTeacher;
};

const updateProfileToDB = async (
  id: string,
  payload: Partial<ITeacher>
): Promise<Partial<ITeacher | null>> => {
  const isExistUser = await Teacher.isExistTeacherById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Teacher doesn't exist!");
  }

  //unlink file here
  if (payload.profile) {
    unlinkFile(isExistUser.profile);
  }

  const updateDoc = await Teacher.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};

const getAllTeachersFromDB = async (): Promise<Partial<ITeacher>[]> => {
  const result = await Teacher.find({}, { password: 0 });
  return result;
};
const getTeacherByIdFromDB = async (
  id: string
): Promise<Partial<ITeacher | null>> => {
  const result = await Teacher.findOne({ _id: id }, { password: 0 });
  return result;
};

export const TeacherService = {
  createTeacherToDB,
  getTeacherProfileFromDB,
  updateProfileToDB,
  getAllTeachersFromDB,
  getTeacherByIdFromDB,
};
