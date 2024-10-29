const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
class Reservation extends Model {}

Reservation.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'user',
            key: 'id',
        },
    },
    showtime_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'showtime',
            key: 'id',
        },
    },
    total_price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
}, { sequelize, modelName: 'reservation' });

module.exports = Reservation;
