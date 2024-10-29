const express = require('express');
const router = express.Router();
const {authenticate, authorize} = require('../middlewares/auth');
const { getAllShowtimes, getShowtimeById, createShowtime, updateShowtime, deleteShowtime, getAvailableSeats } = require('../controllers/showtimeController');

router.route('/').get(getAllShowtimes).post(authenticate, authorize('admin'), createShowtime);
router.route('/:id').get(getShowtimeById).patch(authenticate, authorize('admin'), updateShowtime).delete(authenticate, authorize('admin'), deleteShowtime);

router.route('/:id/seats').get(getAvailableSeats);

module.exports = router;
