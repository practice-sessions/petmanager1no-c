const express = require('express');
const apiRouter = express.Router();

// @route   GET api/pets
// @desc    Tests pets route
// @access   Public
apiRouter.get('/', (req, res) => res.send({ message: 'Pet does work!' }));

module.exports = apiRouter;