const express = require('express'); 
const apiRouter = express.Router();
const mongoose = require('mongoose'); 
const { check, validationResult } = require('express-validator');
//const gravatar = require('gravatar');
// const bcrypt = require('bcryptjs'); 
//const jwt = require('jsonwebtoken');
//const config = require('config');

// Load Client model
const Client = require('../../../models/v3/Client'); 

// @route   GET api/v3/clients/add 
// @desc    Show add client FORM view - (Admin add client)
// @access  Public
apiRouter.get('/add', (req, res) => {
  res.render('client/add', { 
    title: 'Add new Client',
    name: '',
    contactnumbers: '',
    email: '',
    avatar: ''
  });
});

// @route   POST api/v3/clients/add  
// @desc    Admin add client 
// @access  Public (only accessed internally by admin)
apiRouter.post(
  '/add',  
  // isNumeric() used for contact number for now, 
  //will change to isMobilePhone() later
  [
    check('contactnumber', 'Your contact number is required')
      .isNumeric(),
    check('firstname', 'First name is required please')
      .not()
      .isEmpty(),
    check('lastname', 'Last name is required please')
      .not()
      .isEmpty()
    //check('email', 'A valid email is required please').isEmail().normalizeEmail()
  ],  
  async (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstname, lastname, contactnumber, email } = req.body;

  try {
  // Check if client does exist
  let client = await Client.findOne({contactnumber});

  if(client) {
    // Pull error msg from errors() array declared above
    res.status(400).json({ errors: [{ msg: 'Client already exists' }] });
  }
                      /*
                      // Get clients gravatar/pix if available
                      const avatar = gravatar.url(email, {
                        s: '200', // Size default 
                        r: 'pg', // Rating
                        d: 'mm' // Default (hollow image)
                      })
                      */

    // Create client instance 
    client = new Client({
      // Id used as an internally generated (unique) key 
      _id: mongoose.Types.ObjectId(),
      firstname,
      lastname,
      contactnumber,
      email
      //avatar 
    });

    // Save client
    await client.save();
    //next(); 
    
    // Dummy client saved 
    res.send('Dummy client added');

} catch(err) {
  console.error(err.message);
  res.status(500).send('Server error, something went wrong!');
}

}); 
 
module.exports = apiRouter;