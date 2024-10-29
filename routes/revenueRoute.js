const express = require('express');
const router = express.Router();
const {getRevenue, getRevenueById} = require('../controllers/revenueController');
const { authenticate, authorize } = require('../middlewares/auth.js');

router.get('/', authenticate, authorize('admin'), getRevenue);
router.get('/:show_id', authenticate, authorize('admin'), getRevenueById);

module.exports = router;