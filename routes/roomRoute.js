const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const {
    getAllRooms,
    getRoomById,
    createRoom,
    updateRoom,
} = require('../controllers/roomController');

// Public routes
router.get('/', getAllRooms);
router.get('/:id', getRoomById);

// Admin only routes
router.post('/', authenticate, authorize('admin'), createRoom);
router.patch('/:id', authenticate, authorize('admin'), updateRoom);

module.exports = router;
