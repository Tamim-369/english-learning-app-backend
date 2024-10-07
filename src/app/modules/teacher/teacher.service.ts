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
import Stripe from 'stripe';
import config from '../../../config';

const stripeSecretKey = config.stripe_secret_key;

if (!stripeSecretKey) {
  throw new Error('Stripe secret key is not defined.');
}

const stripe = new Stripe(stripeSecretKey);

const createTeacherToDB = async (payload: Partial<ITeacher>): Promise<any> => {
  payload.role = USER_ROLES.TEACHER;
  const isExistUser = await Teacher.findOne({ email: payload.email });

  if (isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Teacher already exist!');
  }
  // Create the teacher in the database
  const createTeacher = await Teacher.create(payload);
  if (!createTeacher) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  try {
    // Create the Stripe account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: createTeacher.email,
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
    });

    // Update the teacher's Stripe account ID
    await Teacher.findOneAndUpdate(
      { _id: createTeacher._id },
      { $set: { stripeAccountId: account.id } }
    );

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url:
        'https://b1df-103-144-201-128.ngrok-free.app/api/v1/teachers/', // URL to redirect if the user needs to retry
      return_url: 'https://b1df-103-144-201-128.ngrok-free.app/', // URL to redirect after completion
      type: 'account_onboarding',
    });

    // Update the Stripe account with required information
    await updateTeacherAccount(createTeacher);

    // Redirect the teacher to the onboarding URL
    return { ...createTeacher, onboardingUrl: accountLink.url }; // Return the onboarding URL
  } catch (error) {
    // If there's an error creating the Stripe account, delete the teacher
    await Teacher.findByIdAndDelete(createTeacher._id);

    console.error('Error creating Stripe account:', error);
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to create Stripe account. Teacher has been deleted.'
    );
  }
};

// Function to update teacher's Stripe account with required fields
const updateTeacherAccount = async (teacher: any) => {
  try {
    await stripe.accounts.update(teacher.stripeAccountId, {
      business_profile: {
        mcc: '8299', // Replace with appropriate MCC
        url: 'https://your-business-url.com', // Replace with actual business URL
      },
      settings: {
        payments: {
          statement_descriptor: 'Your Business Name', // Replace with your business name
        },
      },
      // Removed representative and tos_acceptance fields
    });
  } catch (error) {
    console.error('Error updating Stripe account:', error);
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to update Stripe account.'
    );
  }
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

const deleteTeacherFromDB = async (id: string): Promise<Partial<any>> => {
  const result = await Teacher.findOneAndDelete({ _id: id });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Teacher doesn't exist!");
  }
  return { message: 'Teacher deleted successfully' };
};

export const TeacherService = {
  createTeacherToDB,
  getTeacherProfileFromDB,
  updateProfileToDB,
  getAllTeachersFromDB,
  getTeacherByIdFromDB,
  deleteTeacherFromDB,
};
