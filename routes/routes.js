const express = require('express');
const router = express.Router();

const bookRoutes = require('./books');
const movieRoutes = require('./movies');

router.use('/books', bookRoutes);
router.use('/movies', movieRoutes);

module.exports = router;
