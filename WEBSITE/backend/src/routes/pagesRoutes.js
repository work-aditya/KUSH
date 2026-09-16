const express = require('express');
const router = express.Router();
const pagesController = require('../controllers/pagesController');

router.get('/:slug', pagesController.getPageBySlug);

module.exports = router;
