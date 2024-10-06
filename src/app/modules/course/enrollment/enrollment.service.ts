import { StatusCodes } from 'http-status-codes';
import config from '../../../../config';
import { Course } from '../course.model';
import { Enrollment } from './enrollment.model';
import Stripe from 'stripe';
import ApiError from '../../../../errors/ApiError';
import { Teacher } from '../../teacher/teacher.model';

const stripe = new Stripe(config.stripe_secret_key!);

const createEnrollmentToDB = async (data: any) => {
  // Step 1: Check if the course exists
  const isExistCourse = await Course.findOne({ _id: data.courseID });

  if (!isExistCourse) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Course not found');
  }
  const teacher = await Teacher.findOne({ _id: isExistCourse.teacherID });
  // Step 2: Create a payment intent with Stripe
  let paymentIntent;
  try {
    paymentIntent = await stripe.paymentIntents.create({
      amount: isExistCourse.price * 100, // Assuming price is in dollars, converted to cents
      currency: 'usd', // Define your currency
      payment_method: data.paymentMethodId, // Payment method ID from frontend
      confirm: true, // Automatically confirm the payment
      automatic_payment_methods: {
        enabled: true, // Allow multiple payment methods
        allow_redirects: 'never', // Prevent redirect-based methods like 3D Secure
      },
      metadata: {
        courseID: data.courseID,
        studentID: data.studentID,
      },
    });
  } catch (error) {
    console.error(error);
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Payment failed');
  }

  // Step 3: Create the enrollment record in the database
  const enrollmentData = {
    studentID: data.studentID,
    courseID: data.courseID,
    paymentIntentId: paymentIntent.id, // Store the payment intent ID
  };

  const result = await Enrollment.create(enrollmentData);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Enrollment not recorded');
  }

  // Step 4: Update the course with the new enrollment
  const updatedCourse = await Course.findOneAndUpdate(
    { _id: data.courseID },
    { $push: { enrollmentsID: result._id } },
    { new: true }
  );

  if (!updatedCourse) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Enrollment update failed');
  }

  // Step 5: Calculate the teacher's share (80%)
  const teacherShare = isExistCourse.price * 0.8 * 100; // Calculate the share in cents

  // Step 6: Transfer funds to the teacher's Stripe account
  try {
    await stripe.transfers.create({
      amount: teacherShare, // Amount to transfer in cents
      currency: 'usd', // Define your currency
      destination: teacher?.stripeAccountId!,
      transfer_group: paymentIntent.id, // Group the transfer with the payment intent
    });
  } catch (error) {
    console.error('Transfer failed:', error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to transfer funds to teacher'
    );
  }

  return result;
};

export const EnrollmentService = {
  createEnrollmentToDB,
};
