const { StatusCodes } = require('http-status-codes');
const { Reservation, Seat, ReservedSeat, Showtime, Revenue, Movie } = require('../models');
const sequelize = require('../config/db');

const createReservation = async (req, res) => {
    let transaction;
    try {
        const { showtime_id, seat_numbers } = req.body;
        const user_id = req.user.userId;

        // Input validation
        if (!showtime_id || !seat_numbers) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Showtime ID and seat number(s) are required'
            });
        }

        // Convert to array if single seat number is provided
        const seatArray = Array.isArray(seat_numbers) ? seat_numbers : [seat_numbers];

        transaction = await sequelize.transaction();

        // Get showtime with movie details
        const showtime = await Showtime.findByPk(showtime_id, { 
            include: [{ model: Movie }],
            transaction 
        });
        if (!showtime) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Showtime not found'
            });
        }

        // Get seats
        const seats = await Seat.findAll({
            where: {
                seat_number: seatArray,
                room_id: showtime.room_id
            },
            transaction
        });

        // Validate seats
        if (seats.length !== seatArray.length) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'One or more invalid seat numbers',
                requested: seatArray,
                found: seats.map(s => s.seat_number)
            });
        }

        // Check if seats are already reserved
        const reservedSeats = await ReservedSeat.findAll({
            where: {
                showtime_id,
                seat_id: seats.map(seat => seat.id)
            },
            transaction
        });

        if (reservedSeats.length > 0) {
            return res.status(StatusCodes.CONFLICT).json({
                success: false,
                message: 'One or more seats already reserved'
            });
        }

        // Calculate total price
        let total_price = 0;
        for (const seat of seats) {
            let seatPrice = 0;
            const tier = seat.tier?.toUpperCase();
            
            switch(tier) {
                case 'STANDARD':
                    seatPrice = Number(showtime.standard_price) || 0;
                    break;
                case 'PREMIUM':
                    seatPrice = Number(showtime.premium_price) || 0;
                    break;
                case 'VIP':
                    seatPrice = Number(showtime.vip_price) || 0;
                    break;
                default:
                    seatPrice = 0;
            }
            total_price += seatPrice;
        }

        // Create reservation
        const reservation = await Reservation.create({
            showtime_id,
            user_id,
            total_price
        }, { transaction });

        // Create reserved seats
        await ReservedSeat.bulkCreate(
            seats.map(seat => ({
                reservation_id: reservation.id,
                showtime_id,
                seat_id: seat.id
            })),
            { transaction }
        );

        // Update or create revenue record
        await Revenue.findOrCreate({
            where: {
                showtime_id,
                movie_id: showtime.movie_id,
                showtime_date: showtime.showtime
            },
            defaults: {
                total_seats_sold: seats.length,
                total_revenue: total_price,
                showtime_date: showtime.showtime
            },
            transaction
        }).then(async ([revenue, created]) => {
            if (!created) {
                await revenue.increment({
                    total_seats_sold: seats.length,
                    total_revenue: total_price
                }, { transaction });
            }
        });

        await transaction.commit();

        return res.status(StatusCodes.CREATED).json({
            success: true,
            data: {
                reservation_id: reservation.id,
                total_price,
                seats: seats.map(seat => ({
                    number: seat.seat_number,
                    tier: seat.tier
                }))
            }
        });

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Reservation error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error creating reservation'
        });
    }
};

const getAllReservations = async (req, res) => {
    const reservations = await Reservation.findAll();
    res.status(StatusCodes.OK).json({reservations});
};

const getReservations = async (req, res) => {
    try {
        const userId = req.user.userId;
        const reservations = await Reservation.findAll({
            where: { user_id: userId },
            include: [{
                model: ReservedSeat,
                include: [{ model: Seat }]
            }],
            order: [['createdAt', 'DESC']]
        });

        return res.status(StatusCodes.OK).json({
            success: true,
            data: reservations
        });
    } catch (error) {
        console.error('Get reservations error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error fetching reservations'
        });
    }
};

const cancelReservation = async (req, res) => {
    let transaction;
    try {
        const { id } = req.params;
        const user_id = req.user.userId;

        transaction = await sequelize.transaction();

        // Get reservation with reserved seats and showtime
        const reservation = await Reservation.findOne({
            where: { id, user_id },
            include: [
                { 
                    model: ReservedSeat,
                    attributes: ['id']  // We only need the count
                },
                {
                    model: Showtime,
                    attributes: ['id', 'movie_id', 'showtime']
                }
            ],
            transaction
        });

        if (!reservation) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Reservation not found'
            });
        }

        // Get number of seats and total price to subtract from revenue
        const seatsCount = reservation.ReservedSeats.length;
        const priceToSubtract = reservation.total_price;

        // Update revenue record
        await Revenue.findOne({
            where: {
                showtime_id: reservation.showtime_id,
                movie_id: reservation.Showtime.movie_id,
                showtime_date: reservation.Showtime.showtime
            },
            transaction
        }).then(async (revenue) => {
            if (revenue) {
                await revenue.decrement({
                    total_seats_sold: seatsCount,
                    total_revenue: priceToSubtract
                }, { transaction });
            }
        });

        // Delete reserved seats
        await ReservedSeat.destroy({
            where: { reservation_id: id },
            transaction
        });

        // Delete reservation
        await reservation.destroy({ transaction });

        await transaction.commit();

        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Reservation cancelled successfully'
        });

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Cancel reservation error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error cancelling reservation'
        });
    }
};

module.exports = {
    createReservation,
    getAllReservations,
    getReservations,
    cancelReservation
};
