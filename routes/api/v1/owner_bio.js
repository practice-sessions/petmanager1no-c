const express = require('express');
const apiRouter = express.Router();

//const auth = require('../../../middleware/auth'); 
const { check, validationResult } = require('express-validator');

const User = require('../../../models/v1/User');
const OwnerBio = require('../../../models/v1/OwnerBio');

// @route   GET api/v1/owner_bio 
// @desc    Tests owner bio route
// @access  Public
apiRouter.get('/', (req, res) => res.send({ message: 'Owners does work!' }));


// @route   POST api/v1/owner_bio/add 
// @desc    Add or update pet owner bio without auth - (Admin add pet owner bio)  
// @access  Public
apiRouter.post(
  '/addBio',  
  // isNumeric() used for contact number for now, 
  //will change to isMobilePhone() later
  [
    check('lastname', 'Owners last name is required please')
      .not()
      .isEmpty(),
    //check('email', 'A valid email is required please').isEmail()
    /*
    check('contactnumber', 'Enter contact number please')
      .isNumeric(),
    */ 
    check('confirmContactnumber', 'Confirm contact number please')
      .isNumeric(),
    check('address', 'Address information is required')
      .not()
      .isEmpty() 
  ],  
  async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // const { lastname, email } = await User.findOne({user: req.params.contactnumber});
  const { contactnumber, confirmContactnumber } = req.body;

  try {
  // Check if a bio exists for pet owner 
  let owner_bio = await OwnerBio.findOne({ contactnumber });

  if(owner_bio) {
    return res.status(400).json({ errors: [{ msg: 'Pet owner already has a bio' }] });

    // If no bio found. Compare contact number from user with contact number entered by admin
    //await OwnerBio.findOne({ confirmContactnumber });  
  } 
  /*
  else if (contactnumber !== confirmContactnumber) {
    return res.status(400).json({ errors: [{ msg: 'Contact number entered does not match' }] });
  } else {
  */
  //await OwnerBio.findOne()

  const { address } = req.body; 

  // Build ownerBioFields object
  const ownerBioFields = {};

  ownerBioFields.user = {user: req.body.user};
  if (address) {
    ownerBioFields.address = address.split(',').map(address => address.trim());
  }

  // Update owner bio fields 
  owner_bio = await OwnerBio.findOneAndUpdate(
    { user: req.body.id },
    { $set: 
        {
        ownerBioFields: {address} 
        }
    },
    { new: true }
  );

  return res.json(owner_bio);

  // Create owner bio and fields
  owner_bio = new OwnerBio(ownerBioFields);

  await owner_bio.save();
  res.json(owner_bio);

// Commented out elseif and else here
  //}
  {/*
    
    // Create pet owner instance
    owner_bio = new OwnerBio({
      firstname,
      lastname,
      contactnumber,
      email
      //avatar
    })

    // Save pet owner 
    await owner_bio.save();
    return res.json(owner_bio);

    // Log in pet owner immediately after sign in, 
    // by returning jsonwebtoken
    const payload = {
      owner_bio: {
        id: owner_bio.id // Although mongoDB uses _id as ObjectId, 
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
      }); // Note: jwtSecret above is in config file' and 360000 used
         //  for expiration (in development), use 3600 in production 
    */}
   
} catch(err) {
  console.error(err.message);
  res.status(500).send('Server error, something went wrong!');
}

});


// @route   GET api/v1/owner_bio/named
// @desc    Get named owner bio by contact number
// @access  Public (for now). Becomes 'Private' once users' signup / login is enabled
apiRouter.get('/named', 
[
  // isNumeric() used for contact number for now, 
  //will change to isMobilePhone() later
  check('lastname', 'Owners last name is required please')
    .not()
    .isEmpty(),
    //check('email', 'A valid email is required please').isEmail(),
  check('contactnumber', 'Confirm your contact number please')
    .isNumeric() 
],

async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { contactnumber } = req.body;

  try {
    const owner_bio = await 
      OwnerBio
        .findOne({ contactnumber })
        //.findOne({user: req.user.id}) 
        // Pull required data from user profile
        .populate('user', ['firstname', 'lastname', 'email', 'address', 'avatar']); 

        if (!owner_bio) {
          return res.status(400).json({msg: 'There is no bio data for this owner'}); 
        }

        res.json(owner_bio);

  } catch(err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }
});

    // // @route   POST api/v1/owner_bio
    // // @desc    Create or update owner bio data 
    // // @access  Private
    // apiRouter.post('/', 
    // [
    //   check('lastname', 'Owners last name is required please')
    //     .not()
    //     .isEmpty(),
    //   check('contactnumber', 'Owners contact number is required')
    //       .isNumeric()
    //   /*    
    //       ,
    //   check('address', 'Address information is required')
    //     .not()
    //     .isEmpty()
    //   */
    // ], 
    // async (req, res) => {
    //   const errors = validationResult(req);
    //   if(!errors.isEmpty()) {
    //     return res.status(400).json({ errors: errors.array() });
    //   }

    //   const address = req.body.address;
      

    // })

module.exports = apiRouter; 