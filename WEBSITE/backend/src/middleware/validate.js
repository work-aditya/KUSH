const { sendError } = require('../utils/response');

/**
 * Higher-order middleware to validate incoming request data using Zod
 * @param {import('zod').ZodSchema} schema - Zod schema containing body, query, or params
 */
const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // Replace request parts with sanitized/parsed data if available
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;

    next();
  } catch (error) {
    if (error.errors) {
      const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return sendError(res, 'VALIDATION_ERROR', messages, 400, error.errors);
    }
    return sendError(res, 'VALIDATION_ERROR', 'Invalid request data', 400);
  }
};

module.exports = validate;
