import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { ReviewValidation } from './reviews.validation';
import { ReviewsController } from './reviews.controller';

const router = express.Router();

router
  .post(
    '/',
    auth(USER_ROLES.ADMIN, USER_ROLES.TEACHER),
    validateRequest(ReviewValidation.createReviewsZodSchema),
    ReviewsController.createReviews
  )
  .get('/:id', ReviewsController.getAllReviews);
  .get('/:id', ReviewsController.getSingleReview)

export const ReviewsRoutes = router;
