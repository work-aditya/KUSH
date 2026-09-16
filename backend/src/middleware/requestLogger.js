const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');

const requestLogger = (req, res, next) => {
  req.requestId = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-ID', req.requestId);

  const startHrTime = process.hrtime();

  res.on('finish', () => {
    const elapsedHrTime = process.hrtime(startHrTime);
    const responseTimeMs = (elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6).toFixed(2);

    logger.info('HTTP Request Handled', {
      requestId: req.requestId,
      method: req.method,
      route: req.originalUrl || req.url,
      status: res.statusCode,
      responseTime: `${responseTimeMs}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
    });
  });

  next();
};

module.exports = requestLogger;
