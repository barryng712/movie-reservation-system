const {DataTypes, Model} = require('sequelize');
const sequelize = require('../config/db');

class Room extends Model {}

Room.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    total_seats: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {sequelize, modelName: 'room'});

module.exports = Room;