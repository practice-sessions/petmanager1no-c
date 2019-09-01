const express = require('express');
const apiRouter = express.Router();
const auth = require('../../../middleware/auth2');
//const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator/check');

const PetOwner = require('../../../models/v2/PetOwner');

// @route   GET api/v2/auth2
// @desc    Get pet owner, for use where auth is not enabled 
// @access  Public 
apiRouter.get('/', auth, async (req, res) => {
  try {
    const pet_owner = await PetOwner.findOne(req.pet_owner.contactnumber);
    if(!pet_owner) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Invalid pet owner details!' }] });
    }

    return res.json(pet_owner); 
    
  } catch(err) {
    console.error(err.message);
    res.status(500).send('Server error!!');
  }
});
 
// @route   POST api/v2/auth2 
// @desc    Authenticate user without password, get token
// @access  Public
apiRouter.post(
  '/',  
  // isNumeric() used for contact number for now, 
  // may replace with isMobilePhone() later 
  [
    check('contactnumber', 'Pet owner contact number is required')
    .isNumeric()
    //check('email', 'A valid email is required please').isEmail(), 
    //custom email validation method may be needed
    //check('password', 'Password is required please').exists()
  ], 
  async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { contactnumber } = req.body;

  try {
  // Check if pet owner does exist 
  let pet_owner = await PetOwner.findOne({contactnumber});

  if(!pet_owner) {
    return res
      .status(400)
      .json({ errors: [{ msg: 'Invalid pet owner details!' }] });
  }

  
  const payload = {
    pet_owner: {
      id: pet_owner.id // Although mongoDB uses _id as ObjectId, 
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

/*

// @route   GET api/v2/auth2
// @desc    Get pet owner route, for use where auth is enabled
// @access  Public 
apiRouter.get('/', auth, async (req, res) => {
  try {
    const pet_owner = await PetOwner.findById(req.pet_owner.id).select('-password');
    res.json(pet_owner); 
    console.log(pet_owner.id);

  } catch(err) {
    console.error(err.message);
    res.status(500).send('Server error!!');
  }
});

// @route   POST api/v2/auth2  
// @desc    Authenticate user with password, get token
// @access  Public
apiRouter.post(
  '/',  
  // isNumeric() used for contact number for now, 
  //will change to isMobilePhone() later 
  [
    check('contactnumber', 'Pet owner contact number is required')
    .isNumeric(),
    //check('email', 'A valid email is required please').isEmail(),
    //custom email validation method may be needed 
    check('password', 'Password is required please')
    .exists()
  ], 
  async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { contactnumber, password } = req.body;

  try {
  // Check if pet owner does exist 
  let pe_towner = await PetOwner.findOne({contactnumber});

  if(!pet_owner) {
    return res
      .status(400)
      .json({ errors: [{ msg: 'Invalid pet owner details!' }] });
  }

  const isMatch = await bcrypt.compare(password, pet_owner.password);

  if (!isMatch) {
    return res
      .status(400)
      .json({ errors: [{ msg: 'Invalid pet owner details!' }] });
  }
   
  const payload = {
    pet_owner: {
      id: pet_owner.id // Although mongoDB uses _id as ObjectId, 
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

*/

module.exports = apiRouter;