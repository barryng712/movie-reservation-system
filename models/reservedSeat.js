const {DataTypes, Model} = require('sequelize');
const sequelize = require('../config/db');

class ReservedSeat extends Model {}

ReservedSeat.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    reservation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'reservation',
            key: 'id',
        },
    },
    showtime_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'showtime',
            key: 'id',
        },
    },
    seat_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'seat',
            key: 'id',
        },
    },
}, {
    sequelize,
    modelName: 'reserved_seat', 
    indexes: [
        {
            unique: true,
            fields: ['showtime_id', 'seat_id']
        }
    ]
}); 

module.exports = ReservedSeat;  


