// routes/movies.js

const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

// GET all movies
router.get('/', movieController.getAllMovies);

// GET a single movie by ID
router.get('/:id', movieController.getMovieById);

// POST a new movie
router.post('/', movieController.createMovie);

// PUT update a movie by ID
router.put('/:id', movieController.updateMovie);

// DELETE a movie by ID
router.delete('/:id', movieController.deleteMovie);

module.exports = router;
