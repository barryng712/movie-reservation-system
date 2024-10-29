const { Showtime, Movie, Room, ReservedSeat, Reservation, Seat } = require('../models/index');
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const sequelize = require('../config/db');
const getAllShowtimes = async (req, res) => {
    const showtimes = await Showtime.findAll({
        include: [
            {
                model: Movie,
                attributes: ['title', 'duration', 'poster']
            },
            {
                model: Room,
                attributes: ['name', 'total_seats']
            }
        ]
    });
    res.status(StatusCodes.OK).json({ showtimes });
};

const getShowtimeById = async (req, res) => {
    const { id } = req.params;
    
    const showtime = await Showtime.findByPk(id, {
        include: [
            {
                model: Movie,
                attributes: ['title', 'duration', 'poster']
            },
            {
                model: Room,
                attributes: ['name', 'total_seats'],
            }
        ]
    });

    if (!showtime) {
        res.status(StatusCodes.NOT_FOUND).json({ message: 'Showtime not found' });
    }
    res.status(StatusCodes.OK).json({ showtime });
};

const createShowtime = async (req, res) => {
    const { movie_id, room_id, showtime, standard_price, premium_price, vip_price } = req.body;

    // Check if room and movie exist
    const room = await Room.findByPk(room_id);
    if (!room) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Room not found' });
    }

    const movie = await Movie.findByPk(movie_id);
    if (!movie) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Movie not found' });
    }

    const newShowtimeDate = new Date(showtime);
    // Check for conflicts
    const conflictingShowtime = await Showtime.findOne({
        where: {
            room_id,
            showtime: {
                [Op.between]: [
                    new Date(newShowtimeDate.getTime() - (180 * 60000)), // 3 hours before
                    new Date(newShowtimeDate.getTime() + (180 * 60000))  // 3 hours after
                ]
            }
        }
    });

    if (conflictingShowtime) {
        return res.status(StatusCodes.BAD_REQUEST).json({ 
            message: 'Cannot book this time slot. There is another movie scheduled nearby.'
        });
    }

    const newShowtime = await Showtime.create({
        movie_id,
        room_id,
        showtime,
        standard_price,
        premium_price,
        vip_price
    });

    res.status(StatusCodes.CREATED).json({ showtime: newShowtime });
};

const updateShowtime = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const showtime = await Showtime.findByPk(id);
    if (!showtime) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Showtime not found' });
    }

    // Check if showtime has any reservations
    /** 
    const hasReservations = await ReservedSeat.count({ where: { showtime_id: id } });
    if (hasReservations > 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({ 
            message: 'Cannot update showtime with existing reservations' 
        });
    }
    */

    // If updating showtime, check for conflicts
    if (updateData.showtime) {
        const newShowtimeDate = new Date(updateData.showtime);
        
        const conflictingShowtime = await Showtime.findOne({
            where: {
                room_id: showtime.room_id,
                id: { [Op.ne]: id }, // Exclude current showtime
                showtime: {
                    [Op.between]: [
                        new Date(newShowtimeDate.getTime() - (180 * 60000)), // 3 hours before
                        new Date(newShowtimeDate.getTime() + (180 * 60000))  // 3 hours after
                    ]
                }
            }
        });

        if (conflictingShowtime) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                message: 'Cannot update to this time slot. There is another movie scheduled nearby.'
            });
        }
    }

    await showtime.update(updateData);
    res.status(StatusCodes.OK).json({ showtime });
};

const deleteShowtime = async (req, res) => {
    const { id } = req.params;
    
    const showtime = await Showtime.findByPk(id);
    if (!showtime) {
        throw new NotFoundError('Showtime not found');
    }

    // Check if showtime has any reservations
    const hasReservations = await ReservedSeat.count({ where: { showtime_id: id } });
    if (hasReservations > 0) {
        throw new BadRequestError('Cannot delete showtime with existing reservations');
    }

    await showtime.destroy();
    res.status(StatusCodes.NO_CONTENT).send();
};

const getAvailableSeats = async (req, res) => {
    const { id: showtimeId } = req.params;

    try {
        // Input validation
        if (!showtimeId || isNaN(showtimeId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                message: 'Invalid showtime ID' 
            });
        }

        // Check if showtime exists
        const showtime = await Showtime.findByPk(showtimeId);
        if (!showtime) {
            return res.status(StatusCodes.NOT_FOUND).json({ 
                message: 'Showtime not found' 
            });
        }

        // Get available seats using a parameterized query for security
        const availableSeats = await Seat.findAll({
            where: { 
                room_id: showtime.room_id,
                id: {
                    [Op.notIn]: sequelize.literal('(SELECT seat_id FROM reserved_seats WHERE showtime_id = ?)')
                }
            },
            attributes: ['id', 'seat_number', 'tier'],
            replacements: [showtimeId],
            order: [['seat_number', 'ASC']] // Consistent ordering
        });

        // Return success response
        return res.status(StatusCodes.OK).json({
            data: {
                showtime_id: parseInt(showtimeId),
                available_seats: availableSeats,
                total_available: availableSeats.length
            }
        });

    } catch (error) {
        // Log error for debugging
        console.error('Error in getAvailableSeats:', error);
        
        // Return generic error to client
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            message: 'An error occurred while retrieving available seats',
        });
    }
};


module.exports = {
    getAllShowtimes,
    getShowtimeById,
    createShowtime,
    updateShowtime,
    deleteShowtime,
    getAvailableSeats
};
