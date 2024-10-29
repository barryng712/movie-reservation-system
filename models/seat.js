const {DataTypes, Model} = require('sequelize');
const sequelize = require('../config/db');

class Seat extends Model {}

Seat.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    room_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'room',
            key: 'id'
        }
    },
    seat_number: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tier: {
        type: DataTypes.ENUM('STANDARD', 'PREMIUM', 'VIP'),
        allowNull: false
    },

}, {
    sequelize, 
    modelName: 'seat',
}
);

module.exports = Seat;