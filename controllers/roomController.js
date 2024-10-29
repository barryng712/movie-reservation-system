const { Room, Seat } = require('../models/index');
const { StatusCodes } = require('http-status-codes');

const getAllRooms = async (req, res) => {
    const rooms = await Room.findAll({
        include: [{
            model: Seat,
            attributes: ['id', 'seat_number', 'tier']
        }]
    });
    res.status(StatusCodes.OK).json({ rooms });
};

const getRoomById = async (req, res) => {
    const { id } = req.params;
    const room = await Room.findByPk(id, {
        include: [{
            model: Seat,
            attributes: ['id', 'seat_number', 'tier']
        }]
    });
    
    if (!room) {
        throw new NotFoundError('Room not found');
    }
    res.status(StatusCodes.OK).json({ room });
};

const createRoom = async (req, res) => {
    const { name, rowConfig } = req.body;

    // Validate rowConfig
    if (!Array.isArray(rowConfig)) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: 'rowConfig must be an array' });
    }

    // Start transaction
    const transaction = await Room.sequelize.transaction();

    try {
        // Calculate total seats
        const totalSeats = rowConfig.reduce((sum, row) => sum + row.seats, 0);

        // Create room
        const room = await Room.create({ 
            name,
            total_seats: totalSeats
        }, { transaction });

        // Generate seats based on rowConfig
        const seatsToCreate = [];
        
        for (const row of rowConfig) {
            const { row: rowLetter, seats: seatCount, tier } = row;
            
            // Validate tier
            if (!['STANDARD', 'PREMIUM', 'VIP'].includes(tier)) {
                res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid tier. Must be STANDARD, PREMIUM, or VIP' });
            }

            // Create seats for this row
            for (let i = 1; i <= seatCount; i++) {
                seatsToCreate.push({
                    room_id: room.id,
                    seat_number: `${rowLetter}${i}`,
                    tier
                });
            }
        }

        // Bulk create all seats
        await Seat.bulkCreate(seatsToCreate, { transaction });

        await transaction.commit();

        // Fetch the created room with its seats
        const createdRoom = await Room.findByPk(room.id, {
            include: [{
                model: Seat,
                attributes: ['id', 'seat_number', 'tier']
            }]
        });

        res.status(StatusCodes.CREATED).json({ room: createdRoom });
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const updateRoom = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body; // Only allow updating room name

    const room = await Room.findByPk(id);
    if (!room) {
        res.status(StatusCodes.NOT_FOUND).json({ message: 'Room not found' });
    }

    await room.update({ name });
    
    const updatedRoom = await Room.findByPk(id, {
        include: [{
            model: Seat,
            attributes: ['id', 'seat_number', 'tier']
        }]
    });
    
    res.status(StatusCodes.OK).json({ room: updatedRoom });
};

module.exports = {
    getAllRooms,
    getRoomById,
    createRoom,
    updateRoom,
};
