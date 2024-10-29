const { Revenue, Movie, Showtime } = require('../models');
const { StatusCodes } = require('http-status-codes');
const sequelize = require('../config/db');

const getRevenue = async (req, res) => {
    try {
        // Get total revenue from Revenue table
        const result = await Revenue.findOne({
            attributes: [
                [sequelize.fn('SUM', sequelize.col('total_revenue')), 'total_revenue'],
                [sequelize.fn('SUM', sequelize.col('total_seats_sold')), 'total_seats']
            ]
        });

        return res.status(StatusCodes.OK).json({
            success: true,
            data: {
                total_revenue: Number(result.getDataValue('total_revenue')) || 0,
                total_seats_sold: Number(result.getDataValue('total_seats')) || 0
            }
        });
    } catch (error) {
        console.error('Error fetching revenue:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error fetching revenue data'
        });
    }
};

const getRevenueById = async (req, res) => {
    try {
        const { showtime_id } = req.params;

        const revenue = await Revenue.findOne({
            where: { showtime_id },
            include: [
                {
                    model: Movie,
                    attributes: ['title']
                },
                {
                    model: Showtime,
                    attributes: ['showtime']
                }
            ]
        });

        if (!revenue) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'No revenue data found for this showtime'
            });
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            data: {
                showtime_id: revenue.showtime_id,
                movie_title: revenue.Movie.title,
                showtime: revenue.Showtime.showtime,
                total_revenue: revenue.total_revenue,
                total_seats_sold: revenue.total_seats_sold,
                showtime_date: revenue.showtime_date
            }
        });
    } catch (error) {
        console.error('Error fetching revenue by ID:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error fetching revenue data'
        });
    }
};

module.exports = { 
    getRevenue, 
    getRevenueById 
};
