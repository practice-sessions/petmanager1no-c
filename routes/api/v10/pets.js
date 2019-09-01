const express = require('express');
const apiRouter = express.Router();

const auth = require('../../../middleware/auth'); 
const { check, validationResult } = require('express-validator');

const Pet = require('../../../models/v1/Pet');
const OwnBio = require('../../../models/v10/OwnBio');
const User = require('../../../models/v1/User');


// @route   POST api/v10/pets/add-petbio
// @desc    Add pet bio to pet data
// @access  Private 
apiRouter.post('/add-petbio', 
[
  auth, 
  [
    check('petname', 'Please enter pet name')
      .not()
      .isEmpty(),
    check('pettype', 'Please enter pet type')
      .not()
      .isEmpty(),
    check('petbreed', 'Please enter pet breed')
      .not()
      .isEmpty()
  ]
], 
async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {

    const {
      petname,
      pettype,
      petbreed
    } = req.body;

    const petbio = {
      petname,
      pettype,
      petbreed
    };

    // Fetch pet object to add pet bio data
    let pet = await Pet.findOneAndUpdate(
      { pet: req.params.id },
      { $addToSet: 
        { 
          petbio 
        }  
      },
      { new: true }
    ); 

     res.json(pet);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }

});

      // // @route   POST api/v10/pets/register
      // // @desc    Register pet route 
      // // @access   Private
      // apiRouter.post('/reg', 
      // [
      //   auth, 
      //   [
      //     /*
      //     check('petname', 'Please enter pet name')
      //       .not()
      //       .isEmpty(),
      //     check('pettype', 'Please enter pet type')
      //       .not()
      //       .isEmpty(),
      //     check('petbreed', 'Please enter pet breed')
      //       .not()
      //       .isEmpty(),
      //       */
      //     check('age', 'How old is your pet please?')
      //       .not()
      //       .isEmpty()
      //   ]
      // ], 
      // async (req, res) => {
      //   const errors = validationResult(req);
      //   if(!errors.isEmpty()) {
      //     return res.status(400).json({ errors: errors.array() });
      //   }

      //   const {
      //     age,
      //     firsteverarrivaldate
      //   } = req.body;

      //   /*
      //   const newPet = new Pet({
      //     age: req.body.age,
      //     firsteverarrivaldate: req.body.firsteverarrivaldate
      //     //user: req.user.id,
      //     //ownbio: req.ownbio.id
      //   });


      //     // To reference owner of pet
      //   const user = await User.findById(req.user.id).select('-password');
      //   //const ownbio = await OwnBio.findById(req.ownbio.id); 
      //   */

      //   // Build pet snapshot object
      //   const petSnapshot = {};

      //   //petSnapshot.user = req.user.id;
      //   petSnapshot.ownbio = req.params.id;

      //   if(age) petSnapshot.age = age;
      //   if(firsteverarrivaldate) petSnapshot.firsteverarrivaldate = firsteverarrivaldate;


      //   try {

        

      //         // const newPet = new Pet({
      //         //   petname: req.body.petname,
      //         //   pettype: req.body.pettype,
      //         //   petbreed: req.body.petbreed,
      //         //   //age: req.body.age,
      //         //   petavatar: req.body.petavatar,
      //         //   firsteverarrivaldate: req.body.firsteverarrivaldate,
      //         //   avatar: user.avatar,
      //         //   user: req.user.id,
      //         //   pets: req.params.id
      //         // // fullname: user.fullname 
      //         // });

      //   //const pet = await newPet.save(); 

      //   let pet = await Pet.findOne({ ownbio: req.ownbio.id }); 

      //   if(pet) {
      //     // Update pet 
      //     pet = await Pet.findOneAndUpdate(
      //       { ownbio: req.ownbio.id }, 
      //       { $set: petSnapshot },
      //       { new: true }
      //     );
      //   }
            
      //       // pet.pets.unshift(newPet);

      //     res.json(pet);

      //     // Create pet snapshot fields
      //     pet = new Pet(petSnapshot);

      //     await pet.save();

      //     res.json(pet); 

      //   } catch (err) {
      //     console.error(err.message);
      //     res.status(500).send('Server error, something went wrong!');
      //   }

      // });

// @route   GET api/v10/pets/all
// @desc    Get all pets data 
// @access  Private
apiRouter.get('/all', auth, async (req, res) => {
  try {
    const pets = await Pet.find().sort({ date: -1 });

    res.json(pets);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }
});

// @route   GET api/v10/pets/:id
// @desc    Get pet data by id
// @access  Private 
apiRouter.get('/:id', auth, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if(!pet) {
      return res.status(400).json({ msg: 'Pet not found!' });
    }

    res.json(pet);
    
  } catch (err) {
    console.error(err.message);

    // To prevent status(500) error down below running prematurely when
    // non-formatted ObjectId-type possibly mis-spell or malicious (input) 
    // checking, we use the status(400) error handler as below 
    if(err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Pet not found!' });
    }

    res.status(500).send('Server error, something went wrong!');
  }
});

// @route   DELETE api/v10/pets/:id
// @desc    Delete pet data 
// @access  Private
apiRouter.get('/:id', auth, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if(!pet) {
      return res.status(400).json({ msg: 'Pet not found!' });
    }

    // Check user to confirm its the right pet owner.
    // But logged in user (req.user.id) is a string, and pet.user is
    // and ObjectId (not a string), use toString to prevent conflict errors
    if(pet.user.toString !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorised!' })
    }

    await pet.remove();

    res.json({ msg: 'Pet removed' });
    
  } catch (err) {
    console.error(err.message);

    // To prevent status(500) error down below running prematurely when
    // non-formatted ObjectId-type possibly mis-spell or malicious (input) 
    // checking, we use the status(400) error handler as below
    if(err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Pet not found!' });
    }

    res.status(500).send('Server error, something went wrong!');
  }
});

module.exports = apiRouter; 