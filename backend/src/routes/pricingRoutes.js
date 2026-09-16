const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricingController');

router.get('/', pricingController.getPricingPlans);
router.get('/:id', pricingController.getPricingPlanById);

module.exports = router;
