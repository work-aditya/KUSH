const ContactMessage = require('../models/ContactMessage');
const { sendSuccess } = require('../utils/response');
const logger = require('../config/logger');

/**
 * Submit contact inquiry
 */
const submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, phone, message } = req.body;

    const contact = await ContactMessage.create({
      name,
      email: email.toLowerCase().trim(),
      phone: phone || '',
      message,
      status: 'new',
    });

    logger.info('New contact message received', { contactId: contact._id, email: contact.email });

    return sendSuccess(
      res,
      { id: contact._id },
      'Thank you for reaching out! Coach Kush will review your message shortly.',
      201
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContactMessage,
};
