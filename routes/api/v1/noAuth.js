const express = require('express');
const apiRouter = express.Router();
//const auth = require('../../../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator/check');

const User = require('../../../models/User');

// @route   GET api/v1/noAuth
// @desc    Get user route, for use where no auth is enabled / add user
// @access  Public 
apiRouter.get('/noAuth', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);

  } catch(err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/v1/noAuth  
// @desc    Get token for user added without password
// @access  Public
apiRouter.post(
  '/noAuth',  
  // isNumeric() used for contact number for now, 
  //will change to isMobilePhone() later
  [
    check('contactnumber', 'Your contact number is required')
    .isNumeric().exists(),
    check('email', 'A valid email is required please').isEmail(),
  ], 
  async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { contactnumber, email } = req.body;

  try {
  // Check if user does exist 
  let user = await User.findOne({contactnumber, email});

  if(!user) {
    return res
      .status(400)
      .json({ errors: [{ msg: 'Invalid user details!' }] });
  }

 // const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res
      .status(400)
      .json({ errors: [{ msg: 'Invalid user details!' }] });
  }
   
  const payload = {
    user: {
      id: user.id // Although mongoDB uses _id as ObjectId, 
                  // mongoose allows us use just id
    }
  }

  jwt.sign(
    payload, 
    config.get('jwtSecret'),
    { expiresIn: 360000 },
    (err, token) => {
      if (err) throw err;
      res.json({ token });
    }); // Note: jwtSecret above is in config file' and
    // 360000 used for expiration (in development), use 3600 in production
  
} catch(err) {
  console.error(err.message);
  res.status(500).send('Server error, something went wrong!');
}

});

module.exports = apiRouter;