import { Router } from 'express';
import { AuthController } from './auth.controller';
import { registerValidation, loginValidation } from './auth.validation';
import { validate } from '../../middleware/validate.middleware';
import { authRateLimiter } from '../../middleware/rate-limit.middleware';

const router = Router();
const authController = new AuthController();

// POST /api/v1/auth/register
router.post(
  '/register',
  authRateLimiter,
  validate(registerValidation),
  authController.register
);

// POST /api/v1/auth/login
router.post(
  '/login',
  authRateLimiter,
  validate(loginValidation),
  authController.login
);

// POST /api/v1/auth/refresh
router.post(
  '/refresh',
  authController.refresh
);

// POST /api/v1/auth/logout
router.post(
  '/logout',
  authController.logout
);

export default router;
