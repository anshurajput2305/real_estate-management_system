import { body, query } from 'express-validator';

export const propertyRules = [
  body('title').trim().isLength({ min: 4, max: 180 }),
  body('description').trim().isLength({ min: 20, max: 5000 }),
  body('price').isFloat({ min: 0 }),
  body('listingType').isIn(['rent', 'sale']),
  body('category').isIn(['apartment', 'villa', 'house', 'condo', 'studio', 'commercial', 'land']),
  body('bedrooms').optional().isInt({ min: 0 }),
  body('bathrooms').optional().isInt({ min: 0 }),
  body('squareFeet').isInt({ min: 1 }),
  body('address').trim().notEmpty(),
  body('city').trim().notEmpty(),
  body('state').trim().notEmpty(),
  body('amenities').optional().isArray()
];

export const propertyQueryRules = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 })
];
