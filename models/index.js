const sequelize = require('../config/db');

const Movie = require('./movie');
const Showtime = require('./showtime');
const Reservation = require('./reservation');
const Revenue = require('./revenue');
const User = require('./user');
const ReservedSeat = require('./reservedSeat');
const Room = require('./room');
const Seat = require('./seat');
 
// User associations
User.hasMany(Reservation, { foreignKey: 'user_id' });
Reservation.belongsTo(User, { foreignKey: 'user_id' });

// Room associations
Room.hasMany(Seat, { foreignKey: 'room_id' });
Room.hasMany(Showtime, { foreignKey: 'room_id' });

// Seat associations
Seat.belongsTo(Room, { foreignKey: 'room_id' });

// Movie associations
Movie.hasMany(Showtime, {
    foreignKey: 'movie_id',
});

// Showtime associations
Showtime.belongsTo(Movie, {
    foreignKey: 'movie_id',
});
Showtime.belongsTo(Room, { foreignKey: 'room_id' });

// Reservation associations
Reservation.hasMany(ReservedSeat, { foreignKey: 'reservation_id' });
ReservedSeat.belongsTo(Reservation, { foreignKey: 'reservation_id' });

// Seat associations
Seat.hasMany(ReservedSeat, { foreignKey: 'seat_id' });
ReservedSeat.belongsTo(Seat, { foreignKey: 'seat_id' });

Revenue.belongsTo(Movie, { foreignKey: 'movie_id' });
Revenue.belongsTo(Showtime, { foreignKey: 'showtime_id' });

module.exports = { Movie, Showtime, Reservation, Revenue, User, ReservedSeat, Room, Seat };
