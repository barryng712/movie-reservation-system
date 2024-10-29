const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
class Showtime extends Model {}

Showtime.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    movie_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'movie',
            key: 'id',
        },
    },
    room_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'room',
            key: 'id',
        },
    },
    showtime: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    standard_price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    premium_price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    vip_price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
}, { sequelize, modelName: 'showtime' });

module.exports = Showtime;