const express = require('express'); 
const apiRouter = express.Router();
const { body, check, validationResult } = require('express-validator');
//const { matchedData } = require('express-validator/filter');
//const gravatar = require('gravatar');
const config = require('config');
//const jwt = require('jsonwebtoken');

// Load PetOwner model
const PetOwner = require('../../../models/v2/PetOwner');

// @route   POST api/v2/pet_owners/add  
// @desc    Register pet owner - (Add pet owner) 
// @access  Public
apiRouter.post(
  '/add',  
  // isNumeric() used for contact number for now, 
  //will change to isMobilePhone() later
  [
    check('name', 'Your name is required please')
      .not()
      .isEmpty(),
    //check('email', 'A valid email is required please').isEmail(), 
    check('contactnumber', 'Your contact number is required')
      .isNumeric() 
  ],  
  async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, contactnumber, email } = req.body;

  try {
  // Check if pet owner does exist
   let pet_owner = await PetOwner.findOne({contactnumber});
  //let pet_owner = await contactnumber.findByContactnumber();

  if(pet_owner) {
    return res.status(400).json({ errors: [{ msg: 'Pet owner already exists' }] });
  }
    /*
    // Get pet owners gravatar/pix if available
    const avatar = gravatar.url(email, {
      s: '200', // Size default 
      r: 'pg', // Rating
      d: 'mm' // Default (hollow image)
    })
    */

    // Create pet owner instance
    pet_owner = new PetOwner({
      name,
      contactnumber,
      email
      //avatar
    })

    // Save pet owner 
    await pet_owner.save();
    return res.json(pet_owner);
{/*
    // Log in pet owner immediately after sign in, 
    // by returning jsonwebtoken
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
      }); // Note: jwtSecret above is in config file' and 360000 used
         //  for expiration (in development), use 3600 in production
    */}
   
} catch(err) {
  console.error(err.message);
  res.status(500).send('Server error, something went wrong!');
}

});


// @route   GET api/v2/pet_owners/pet_owner
// @desc    Get current pet owner using contactnumber (without auth)
// @access  Public (for now). Becomes 'Private' once pet owners' signup / login is enabled

apiRouter.get('/', async (req, res, next) => {
  
  try {
    const pet_owner = await 
      PetOwner
        .findOne({pet_owner: req.body.contactnumber})
        // Pull required data from owner bio data  
        .populate('pet_owner', ['name']);

        //const contactnumber = matchedData(req, { locations: ['body'] });  

        if (!pet_owner) {
          return res.status(400)
            .json({msg: 'There is no owner bio data for this pet owner'});
        }

        res.json(pet_owner);

  } catch(err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }
});


      // @route   GET api/v2/pet_owners 
      // @desc    Get current pet owner by id (without auth) 
      // @access  Public (for now). Becomes 'Private' once pet owners' signup / login is enabled
      apiRouter.get('/n', 
      /*
        [ 
          check('confirmContactnumber', 'Your contact number is required')
            .isNumeric()
        ], 
      */
        [ 
          check('name', 'Your name is required')
            .not()
            .isEmpty()
        ],
        
        async (req, res) => {
      
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
      
        try {
          const pet_owner = await 
            PetOwner
              .findOne({pet_owner: req.body.name})
              // Pull required data from owner bio data 
              .populate('pet_owner', ['contactnumber']);

              if (!pet_owner) {
                return res.status(400)
                  .json({msg: 'There is no owner bio data for this pet owner'});
              }

              res.json(pet_owner);

        } catch(err) {
          console.error(err.message);
          res.status(500).send('Server error, something went wrong!');
        }
      });



        // // @route   POST api/v2/pet_owners/register
        // // @desc    Register pet owner with auth
        // // @access  Public
        // apiRouter.post(
        //   '/register',  
        //   // isNumeric() used for contact number for now, 
        //   //will change to isMobilePhone() later 
        //   [
        //     check('name', 'Your name is required please')
        //       .not()
        //       .isEmpty(),
        //     check('contactnumber', 'Your contact number is required')
        //       .isNumeric(),
        //     check('email', 'A valid email is required please')
        //       .isEmail()
        //       .normalizeEmail(), 
        //     check('password', 'Please a password with 4 or more characters')
        //       .isLength({ min: 4 })
        //   ],  
        //   async (req, res) => {
        //   const errors = validationResult(req);
        //   if(!errors.isEmpty()) {
        //     return res.status(400).json({ errors: errors.array() });
        //   }

        //   const { name, contactnumber, email, password } = req.body;

        //   try {
        //   // Check if pet owner does exist
        //   let pet_owner = await PetOwner.findOne({contactnumber});

        //   if(pet_owner) {
        //     return res.status(400).json({ errors: [{ msg: 'Pet owner already exists' }] });
        //   }
        //     /*
        //     // Get pet owners gravatar/pix if available
        //     const avatar = gravatar.url(email, {
        //       s: '200', // Size default 
        //       r: 'pg', // Rating
        //       d: 'mm' // Default (hollow image)
        //     })
        //     */

        //     // Create pet owner instance
        //     pet_owner = new PetOwner({
        //       name,
        //       contactnumber,
        //       email,
        //       password
        //       //avatar 
        //     })

        //     // Encrypt password 
        //     const salt = await bcrypt.genSalt(10);

        //     pet_owner.password = await bcrypt.hash(password, salt);

        //     // Save pet owner 
        //     await pet_owner.save();

        //     // Log in pet owner immediately after sign in, 
        //     // by returning jsonwebtoken
        //     const payload = {
        //       pet_owner: {
        //         id: pet_owner.id // Reminder: Although mongoDB uses _id as 
        //                     // ObjectId, mongoose allows us use just id
        //       }
        //     }

        //     jwt.sign(
        //       payload, 
        //       config.get('jwtSecret'),
        //       { expiresIn: 360000 },
        //       (err, token) => {
        //         if (err) throw err;
        //         res.json({ token });
        //       }); // Note: jwtSecret above is in config file' and
        //       // 360000 used for expiration (in development), use 3600 in production
          
        // } catch(err) {
        //   console.error(err.message);
        //   res.status(500).send('Server error, something went wrong!');
        // }

        // });

// @route   GET api/v2/pet_owners/bio
// @desc    Get current pet owner's bio data  
// @access  Public (for now). Becomes 'Private' once pet owners' signup / login is enabled
apiRouter.get('/bio', async (req, res) => {

  try {
    const pet_owner = await 
      PetOwner
        .findOne({pet_owner: req.body.contactnumber})
        // Pull required data from owner bio data
        .populate('pet_owner', ['name', 'id']);

        if (!pet_owner) {
          return res.status(400).json({msg: 'There is no owner bio data for this pet owner'});
        }

        res.json(pet_owner);

  } catch(err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }
}); 


// @route   POST api/v2/pet_owners/ownerBio
// @desc    Create or update pet owner bio data 
// @access  Private
apiRouter.post('/ownerBio', 
  [ 
   
    check('name', 'Your name is required please')
      .not()
      .isEmpty(),
    check('contactnumber', 'Your contact number is required')
      .isNumeric().equals()
  /*  
    check('pets', 'Pet information is required')
      .not()
      .isEmpty()
     
    check('address', 'Address information is required')
      .not()
      .isEmpty(),
  */     
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

  const { 
   name, 
   contactnumber, 
  // pets,
  //  address
  } = req.body;

  // Build owner ownerBio object 
  const ownerBioFields = {};
  ownerBioFields.pet_owner = req.body.id;

  if(name) ownerBioFields.name = name;
  if(contactnumber) ownerBioFields.contactnumber = contactnumber;
  //if(address) ownerBioFields.address = address;
  /*
  // For use later, if contact number is array, 
  // to enable multiple numbers' entry - **needs attention**
  if(contactnumber) {
    ownerBioFields.contactnumber = contactnumber.split(',').map(contactnumber => contactnumber.trim());
  }
  */


 try {
  let pet_owner = await PetOwner.findOne({ pet_owner: req.body.id });

  if(pet_owner) {
    // Update - updateOne was used instead of findOneAndUpdate
    pet_owner = await PetOwner.findOneAndUpdate(
      { pet_owner: req.body.id },
      { $set: ownerBioFields },
      { new: true }
    );

    return res.json(pet_owner);
  }

  // Create
  pet_owner = new PetOwner(ownerBioFields);

  await pet_owner.save();
  console.log(pet_owner);

} catch(err) {
  console.error(err.message);
  res.status(500).send('Server error, something went wrong!');
}

  
  // try {
  //   let ownerBio = await PetOwner.findOne({ pet_owner: req.body.id });

  //   if(ownerBio) {
  //     // Update - updateOne was used instead of findOneAndUpdate
  //     ownerBio = await PetOwner.findOneAndUpdate(
  //       { pet_owner: req.body.id },
  //       { $set: ownerBioFields },
  //       { new: true }
  //     );

  //     return res.json(ownerBio);
  //   }

  //   // Create
  //   ownerBio = new PetOwner(ownerBioFields);

  //   await ownerBio.save();
  //   console.log(ownerBio);

  // } catch(err) {
  //   console.error(err.message);
  //   res.status(500).send('Server error, something went wrong!');
  // }


});



module.exports = apiRouter;