import { Router } from 'express';
import { allowRoles, optionalAuth, protect } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { validate } from '../middlewares/validate.js';
import { propertyQueryRules, propertyRules } from '../validators/property.validators.js';
import { createProperty, deleteProperty, featuredProperties, getProperty, getWishlist, listProperties, similarProperties, toggleWishlist, updateProperty, uploadPropertyAssets } from '../controllers/property.controller.js';

const router = Router();

router.get('/', optionalAuth, propertyQueryRules, validate, listProperties);
router.get('/featured', featuredProperties);
router.get('/wishlist/me', protect, allowRoles('customer'), getWishlist);
router.get('/:id/similar/list', similarProperties);
router.get('/:slug', getProperty);
router.post('/', protect, allowRoles('agent', 'admin'), propertyRules, validate, createProperty);
router.patch('/:id', protect, allowRoles('agent', 'admin'), updateProperty);
router.delete('/:id', protect, allowRoles('agent', 'admin'), deleteProperty);
router.post('/:id/assets', protect, allowRoles('agent', 'admin'), upload.array('assets', 8), uploadPropertyAssets);
router.post('/:id/wishlist', protect, allowRoles('customer'), toggleWishlist);

export default router;
