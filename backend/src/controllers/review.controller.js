import { ApiError, asyncHandler, send } from '../utils/api.js';
import { Property } from '../models/Property.js';
import { Review } from '../models/Review.js';

export const createReview = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.body.property);
  if (!property) throw new ApiError(404, 'Property not found');
  const review = await Review.create({ ...req.body, user: req.user._id, agent: property.agent });
  const aggregate = await Review.aggregate([
    { $match: { property: property._id, status: 'published' } },
    { $group: { _id: '$property', rating: { $avg: '$rating' }, reviews: { $sum: 1 } } }
  ]);
  property.rating = aggregate[0]?.rating || 0;
  property.reviews = aggregate[0]?.reviews || 0;
  await property.save({ validateBeforeSave: false });
  send(res, 201, 'Review published', review);
});

export const listReviews = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.property) filter.property = req.query.property;
  if (req.query.agent) filter.agent = req.query.agent;
  const reviews = await Review.find(filter).populate('user', 'name avatar').sort('-createdAt');
  send(res, 200, 'Reviews fetched', reviews);
});

export const hideReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { status: 'hidden' }, { new: true });
  if (!review) throw new ApiError(404, 'Review not found');
  send(res, 200, 'Review hidden', review);
});
