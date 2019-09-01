const express = require('express');
const apiRouter = express.Router();

const auth = require('../../../middleware/auth'); 
const { check, validationResult } = require('express-validator/check');

const User = require('../../../models/v1/User');
const Owner = require('../../../models/v1/Owner');

// @route   GET api/v1/owner 
// @desc    Tests owners route
// @access  Public
apiRouter.get('/', (req, res) => res.send({ message: 'Owners does work!' }));

// @route   GET api/v1/owner/bio 
// @desc    Get current owner's bio data by id 
// @access  Public (for now). Becomes 'Private' once users' signup / login is enabled
apiRouter.get('/bio', auth, async (req, res) => {

  try {
    const owner = await 
      Owner
        .findOne({user: req.user.id})
        .populate('user', ['name', 'contactnumber']);// Pull required data from user profile 

        if (!owner) {
          return res.status(400).json({msg: 'There is no owner bio data for this user'});
        }

        res.json(owner);

  } catch(err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }
}); 

// @route   POST api/v1/owner 
// @desc    Create or update owner bio data 
// @access  Private
apiRouter.post('/', 
[ 
  auth, 
  [
    check('contactnumber', 'Your contact number is required')
      .isNumeric(),
    check('address', 'Address information is required')
      .not()
      .isEmpty()
  ] 
], 
async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const address = req.body.address;

})

module.exports = apiRouter; 