const express = require('express');
const router = express.Router();
const {authenticate, authorize} = require('../middlewares/auth');
const {getReservations,
        getAllReservations,
        createReservation, 
        cancelReservation, } = require('../controllers/reservationController');

router.route('/')
    .get(authenticate, getReservations)
    .post(authenticate, createReservation)
    .get(authenticate, authorize('admin'), getAllReservations)


router.route('/:id').delete(authenticate, cancelReservation);

module.exports = router;
