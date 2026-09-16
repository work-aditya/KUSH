const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateUser } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/authValidator');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');

router.post('/register', registerLimiter, validate(registerSchema), authController.register);
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/admin-login', loginLimiter, validate(loginSchema), authController.adminLogin);
router.post('/logout', authController.logout);
router.get('/me', authenticateUser, authController.getMe);

module.exports = router;
