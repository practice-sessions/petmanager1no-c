const express = require('express');
/* Include {mergeParams; true} in file where the nested params reside. 
	mergeParams tells apiRouter to merge parameters that are created on 
	this set of routes with the ones from its parents  
*/
const apiRouter = express.Router({ mergeParams: true });

const auth = require('../../../middleware/auth'); 
const { check, validationResult } = require('express-validator');
//const jwt = require('jsonwebtoken');
//const config = require('config');

const OwnBio = require('../../../models/v10/OwnBio');
const User = require('../../../models/v1/User');

// @route   GET api/v10/ownbio
// @desc    Tests owners route
// @access  Public
apiRouter.get('/', (req, res) => res.send({ message: 'Owners does work!' }));

// @route   POST api/v10/ownbio 
// @desc    Create or update owner bio data 
// @access  Private
apiRouter.post('/add-owner-bio', 
[ 
  auth, 
  [
    check('vetname', 'Your vets name and number is required')
      .not()
      .isEmpty(),
    check('specialneeds', 
      'Briefly provide any special needs info for your pet, if any please')
      .not()
      .isEmpty()
  ] 
], 
async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { 
    vetname, 
    specialneeds 
  } = req.body;

  // Build owner bio object
  const ownerBioFields = {};

  ownerBioFields.user = req.user.id;

  if(vetname) ownerBioFields.vetname = vetname;
  if(specialneeds) {
    ownerBioFields.specialneeds = specialneeds.split(',').map(specialneed => specialneed.trim());
  }
  
  try {
    let ownbio = await OwnBio.findOne({ user: req.user.id });

    if (ownbio) {
      // Update owner bio 
      ownbio = await OwnBio.findOneAndUpdate(
        { user: req.user.id }, 
        { $set: ownerBioFields },
        { new: true }
      );

      return res.json(ownbio);
    }

    // Create owner bio fields
    ownbio = new OwnBio(ownerBioFields);

    await ownbio.save();

    res.json(ownbio); 

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  } 

});

// @route   GET api/v10/ownbio/named
// @desc    Get current owner's bio data by id 
// @access  Public (for now). Becomes 'Private' once users' signup / login is enabled
apiRouter.get('/named', auth, async (req, res) => {

  try {
    const ownbio = await 
      OwnBio
        .findOne({user: req.user.id})
        .populate('user', ['firstname', 'lastname', 'contactnumber']);// Pull required data from user profile 

        if (!ownbio) {
          return res.status(400).json({msg: 'There is no owner bio data for this user'});
        }

        res.json(ownbio);

  } catch(err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }
});

// @route   GET api/v10/ownbio/all
// @desc    Get all owners' bio data 
// @access  Public 
apiRouter.get('/all', async (req, res) => {
  try {
    
    const ownbios = await OwnBio.find().populate('user', ['firstname', 'lastname', 'contactnumber', 'avatar']);
    if (ownbios == 0 ) {
      return res.status(400).json({msg: 'There is no owner bio data!'});
    }
    res.json(ownbios);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }
}); 

// @route   GET api/v10/ownbio/user/:user_id
// @desc    Get owner bio data by user id
// @access  Public 
apiRouter.get('/user/:user_id', async (req, res) => {
  try {
    const ownbio = await OwnBio
      .findOne({ user: req.params.user_id })
      .populate('user', ['firstname', 'lastname', 'contactnumber', 'avatar']);

      if(!ownbio) 
        return res.status(400).json({ msg: 'No owner bio for this user!' });

    res.json(ownbio);

  } catch (err) {
    console.error(err.message);

    // To minimise chancing of malicious "fishing", or random non-formatted 
    // ObjectId probing in search address params, add if statement to make it
    // more difficult by trying to avoid server error message in the "catch"
    if(err.kind == 'ObjectId') {
      return res.status(400)
        .json({ msg: 'No owner bio for this user!' });
    }

    res.status(500).send('Server error, something went wrong!');
  }
});

// @route   DELETE api/v10/ownbio/delete
// @desc    Delete owner bio data, user, & pets data
// @access  Private
apiRouter.delete('/delete', auth, async (req, res) => {
  try {
    // *** Code. To. Remove owner-users pets here ***

    //Remove owners bio
    await OwnBio.findOneAndRemove({ user: req.user.id });

    // Remove user - we use _id here because user is not a field in user model
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: 'User deleted' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }
}); 

// @route   POST api/v10/ownbio/address-to-bio // POST request used, rather than a  
// PUT although we are updating data in an existing collection - personal preference
// @desc    Add address to owner bio data 
// @access  Private 
apiRouter.post('/address-to-bio', 
[ 
  auth, 
  [
    check('house', 'A house name or street number is required please')
      .not()
      .isEmpty(),
    check('postcode', 'A postcode is required please')
      .not()
      .isEmpty(),
    check('city', 'A town or city name is required please')
      .not()
      .isEmpty()
  ] 
], async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    house,
    street,
    street2,
    postcode,
    city
  } = req.body;

  const addy = {
    house,
    street,
    street2,
    postcode,
    city
  }

  try {
    // Fetch owner bio to add address 
    const ownbio = await OwnBio.findOne({ user: req.user.id });

    // What if user has no bio?
    if(!ownbio) {
      return res.status(400)
        .json({ msg: 'No owner bio for this user!' }); 
    }

    // Push address array onto the owner bio using unshift (not PUSH) so it goes
    // into the beginning rather than at the end so we get the most recent first 
    ownbio.address.unshift(addy);

    await ownbio.save();

    res.json(ownbio);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }

});

// @route   DELETE api/v10/ownbio/address/:addy_id
// @desc    Delete address from owner bio 
// @access  Private
apiRouter.delete('/address/:addy_id', auth, async (req, res) => {
  try {
    const ownbio = await OwnBio.findOne({ user: req.user.id });

    // To get the right address to remove, get remove index 
    const removeIndex = ownbio.address
      .map(item => item.id)
      .indexOf(req.params.addy_id);
    
    ownbio.address.splice(removeIndex, 1);

    await ownbio.save();

    res.json(ownbio);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }
});

// @route   POST api/v10/ownbio/addpet-to-ownbio // POST request used, rather than a  
// PUT although we are updating data in an existing collection - personal preference
// @desc    Create pet, and add to owner bio data
// @access  Private 
apiRouter.post('/addpet-to-ownbio', 
[ 
  auth, 
  [
  /*
    check('firsteverarrivaldate', 'Is this first time pet has been here?')
      .not()
      .isEmpty()
  */ 
    check('age', 'How old is your pet?')
      .not()
      .isEmpty()
  ] 
], async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const newPet = new Pet({ age: req.body.age });

const pet = await newPet.save();

  try {
    // Fetch owner bio to add pet data 
    const ownbio = await OwnBio.findOne({ user: req.user.id });
    //const ownbio = await OwnBio.findOne({ pets: req.pet.id }); 

    // What if user has no bio?
    if(!ownbio) {
      return res.status(400)
        .json({ msg: 'No owner bio for this user!' }); 
    }

    // Push pets array onto the owner bio using unshift (not PUSH) so it goes
    // into the beginning rather than at the end so we get the most recent first 
    ownbio.pets.unshift(newPet);

    await ownbio.save();

    res.json(ownbio);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }

});

module.exports = apiRouter; 