const SENSITIVE_KEYS = [
  'password',
  'passwordhash',
  'jwt',
  'token',
  'authorization',
  'cookie',
  'coachkush_session',
  'mongo_uri',
  'razorpay_key_secret',
  'razorpay_webhook_secret',
  'keysecret',
  'clientsecret',
  'smtp_password',
  'admin_password',
  'rawresponse',
];

const redact = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(redact);

  const safe = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive))) {
      safe[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      safe[key] = redact(value);
    } else {
      safe[key] = value;
    }
  }
  return safe;
};

const formatLog = (level, message, meta = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...redact(meta),
  };
  return JSON.stringify(logEntry);
};

const logger = {
  info: (message, meta) => {
    console.log(formatLog('INFO', message, meta));
  },
  warn: (message, meta) => {
    console.warn(formatLog('WARN', message, meta));
  },
  error: (message, meta) => {
    console.error(formatLog('ERROR', message, meta));
  },
  debug: (message, meta) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(formatLog('DEBUG', message, meta));
    }
  },
  redact,
};

module.exports = logger;
