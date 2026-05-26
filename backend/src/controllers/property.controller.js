import slugify from 'slugify';
import { ApiError, asyncHandler, getPagination, send } from '../utils/api.js';
import { Property } from '../models/Property.js';
import { Review } from '../models/Review.js';
import { Wishlist } from '../models/Wishlist.js';
import { uploadBufferToCloudinary } from '../services/media.service.js';

const buildFilter = (query, user) => {
  const filter = {};
  if (query.mine === 'true' && user?.role === 'agent') filter.agent = user._id;
  if (query.status) filter.status = query.status;
  if (!query.status && (!user || user.role === 'customer')) filter.status = 'active';
  if (query.listingType) filter.listingType = query.listingType;
  if (query.category) filter.category = query.category;
  if (query.city) filter.city = new RegExp(query.city, 'i');
  if (query.state) filter.state = new RegExp(query.state, 'i');
  if (query.featured) filter.featured = query.featured === 'true';
  if (query.minPrice || query.maxPrice) filter.price = {};
  if (query.minPrice) filter.price.$gte = Number(query.minPrice);
  if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  if (query.bedrooms) filter.bedrooms = { $gte: Number(query.bedrooms) };
  if (query.amenities) filter.amenities = { $all: query.amenities.split(',').map((item) => item.trim()) };
  if (query.q) filter.$text = { $search: query.q };
  return filter;
};

const uniqueSlug = async (title, currentId = null) => {
  const base = slugify(title, { lower: true, strict: true });
  let slug = base;
  let count = 1;
  while (await Property.exists({ slug, ...(currentId ? { _id: { $ne: currentId } } : {}) })) {
    slug = `${base}-${count++}`;
  }
  return slug;
};

export const listProperties = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = buildFilter(req.query, req.user);
  const sort = req.query.sort || '-createdAt';
  const [items, total] = await Promise.all([
    Property.find(filter).populate('agent', 'name email phone avatar').sort(sort).skip(skip).limit(limit),
    Property.countDocuments(filter)
  ]);
  send(res, 200, 'Properties fetched', items, { page, limit, total, pages: Math.ceil(total / limit) });
});

export const featuredProperties = asyncHandler(async (_req, res) => {
  const items = await Property.find({ status: 'active', featured: true }).populate('agent', 'name avatar').sort('-createdAt').limit(12);
  send(res, 200, 'Featured properties fetched', items);
});

export const getProperty = asyncHandler(async (req, res) => {
  const property = await Property.findOne({ slug: req.params.slug }).populate('agent', 'name email phone avatar');
  if (!property) throw new ApiError(404, 'Property not found');
  const reviews = await Review.find({ property: property._id, status: 'published' }).populate('user', 'name avatar').sort('-createdAt');
  send(res, 200, 'Property fetched', { property, reviews });
});

export const createProperty = asyncHandler(async (req, res) => {
  const slug = await uniqueSlug(req.body.title);
  const property = await Property.create({ ...req.body, slug, agent: req.user._id, status: req.user.role === 'admin' ? 'active' : 'pending' });
  send(res, 201, 'Property created', property);
});

export const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, 'Property not found');
  if (req.user.role !== 'admin' && property.agent.toString() !== req.user._id.toString()) throw new ApiError(403, 'Not allowed');
  Object.assign(property, req.body);
  if (req.body.title) property.slug = await uniqueSlug(req.body.title, property._id);
  if (req.user.role !== 'admin' && ['active', 'verified', 'featured'].some((field) => field in req.body)) throw new ApiError(403, 'Only admins can moderate listings');
  await property.save();
  send(res, 200, 'Property updated', property);
});

export const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, 'Property not found');
  if (req.user.role !== 'admin' && property.agent.toString() !== req.user._id.toString()) throw new ApiError(403, 'Not allowed');
  property.status = 'archived';
  await property.save();
  send(res, 200, 'Property archived');
});

export const similarProperties = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, 'Property not found');
  const items = await Property.find({
    _id: { $ne: property._id },
    status: 'active',
    listingType: property.listingType,
    category: property.category,
    city: property.city
  }).limit(8);
  send(res, 200, 'Similar properties fetched', items);
});

export const toggleWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOneAndUpdate({ user: req.user._id }, { $setOnInsert: { user: req.user._id } }, { upsert: true, new: true });
  const exists = wishlist.properties.some((id) => id.toString() === req.params.id);
  wishlist.properties = exists ? wishlist.properties.filter((id) => id.toString() !== req.params.id) : [...wishlist.properties, req.params.id];
  await wishlist.save();
  send(res, 200, exists ? 'Removed from wishlist' : 'Added to wishlist', wishlist);
});

export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('properties');
  send(res, 200, 'Wishlist fetched', wishlist || { user: req.user._id, properties: [] });
});

export const uploadPropertyAssets = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, 'Property not found');
  if (req.user.role !== 'admin' && property.agent.toString() !== req.user._id.toString()) throw new ApiError(403, 'Not allowed');
  const files = req.files || [];
  if (!files.length) throw new ApiError(400, 'No files uploaded');

  const uploaded = await Promise.all(files.map((file) => uploadBufferToCloudinary(file, `rems/properties/${property._id}`)));
  const documents = uploaded.filter((file) => file.name.toLowerCase().endsWith('.pdf'));
  const images = uploaded.filter((file) => !file.name.toLowerCase().endsWith('.pdf')).map((file) => ({ ...file, caption: req.body.caption || '' }));

  property.images.push(...images);
  property.documents.push(...documents);
  await property.save();
  send(res, 200, 'Property assets uploaded', property);
});
