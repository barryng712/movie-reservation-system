const express = require('express');
const router = express.Router();
const {authenticate, authorize} = require('../middlewares/auth');
const { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie } = require('../controllers/movieController');

router.route('/').get(getAllMovies).post(authenticate, authorize('admin'), createMovie);
router.route('/:id').get(getMovieById).patch(authenticate, authorize('admin'), updateMovie).delete(authenticate, authorize('admin'), deleteMovie);

module.exports = router;

