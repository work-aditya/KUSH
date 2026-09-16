const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const validate = require('../middleware/validate');
const { contactSchema } = require('../validators/contactValidator');
const { contactLimiter } = require('../middleware/rateLimiter');

router.post('/', contactLimiter, validate(contactSchema), contactController.submitContactMessage);

module.exports = router;
