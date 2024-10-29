const Movie = require('../models/movie');
const { StatusCodes } = require('http-status-codes');

const getAllMovies = async (req, res) => {
    const movies = await Movie.findAll();
    res.status(StatusCodes.OK).json({ movies });
};

const getMovieById = async (req, res) => {
    const {id} = req.params;
    const movie = await Movie.findByPk(id);
    if(!movie){
        res.status(StatusCodes.NOT_FOUND).json({ message: 'Movie not found' });
    }
    res.status(StatusCodes.OK).json({ movie });
};

const createMovie = async (req, res) => {
    const {title, description, poster, genre, duration} = req.body;
    const movie = await Movie.create({title, description, poster, genre, duration});
    res.status(StatusCodes.CREATED).json({ movie });
};

const updateMovie = async (req, res) => {
    const {id} = req.params;
    const updateData = req.body;
    const movie = await Movie.findByPk(id);
    if(!movie){
        res.status(StatusCodes.NOT_FOUND).json({ message: 'Movie not found' });
    }
    await movie.update(updateData);
    res.status(StatusCodes.OK).json({ movie });
};

const deleteMovie = async (req, res) => {
    const {id} = req.params;
    const movie = await Movie.findByPk(id);
    if(!movie){
        res.status(StatusCodes.NOT_FOUND).json({ message: 'Movie not found' });
    }
    await movie.destroy();
    res.status(StatusCodes.NO_CONTENT).send();
};

module.exports = { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie };
