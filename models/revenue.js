const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
class Revenue extends Model {}

Revenue.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    showtime_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'showtime',
            key: 'id',
        },
    },
    movie_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'movie',
            key: 'id',
        },
    },
    total_seats_sold: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    total_revenue: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    showtime_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, { sequelize,
     modelName: 'revenue',
     indexes: [
        {
            fields: ['showtime_id'],
        },
        {
            fields: ['showtime_date'],
        }
     ] });

module.exports = Revenue;
