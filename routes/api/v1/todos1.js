const express = require('express');
const apiRouter = express.Router();

// @route   GET api/todos
// @desc    Tests todo route
// @access   Public
apiRouter.get('/', (req, res) => res.send({ message: 'Todos does work!' }));

module.exports = apiRouter;