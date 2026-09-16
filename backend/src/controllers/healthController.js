const mongoose = require('mongoose');

const getHealth = (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';

  const isHealthy = dbState === 1;

  return res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    checks: {
      api: 'ok',
      database: dbStatus,
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  getHealth,
};
