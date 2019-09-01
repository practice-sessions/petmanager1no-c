const express = require('express');
/* Include {mergeParams; true} in file where the nested params reside. 
	mergeParams tells apiRouter to merge parameters that are created on 
	this set of routes with the ones from its parents  
*/
const apiRouter = express.Router({ mergeParams: true });

//const auth = require('../../../middleware/auth3');
const { body, check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');

const Client = require('../../../models/v3/Client');
const ClientBio = require('../../../models/v3/ClientBio');

// @route   GET api/v3/client_bio
// @desc    Tests client bio route
// @access  Public
apiRouter.get('/', (req, res) => res.send({ message: 'Client does work!' }));

// @route   GET api/v3/client_bio/named
// @desc    Get named client bio by id??? 
// @access  Public (for now). Becomes 'Private' once users' signup / login is enabled
apiRouter.get('/named', 
[
 // check('lastname', 'Owners last name is required please')
 //   .not()
 //   .isEmpty(),
  check('contactnumber', 'Enter clients contact number please') 
    .isNumeric()
], 
async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { lastname, contactnumber } = req.body;

  try {
    let client = await Client.findOne({lastname}, {contactnumber});

    if (!client) {
      res.status(400).json({msg: 'The client information given is invalid'});
    }
    
  /*  
    // Get decoded token 
    const token = await req.header('x-auth-token') || req.body.token || req.query.token;
      
    if (token) {

    payload = {
      client: { id: client.id }
    }; 

  token = jwt.sign(
    payload, 
    config.get('jwtSecret'),
    { expiresIn: '3h' },
    (err, token) => {
      if (err) throw err;
      res.json({ token });
      next();
    }); 
  }

   
   // Decode token to get client id in payload data
    //decoded = jwt.decode(token, {complete: true});
    const decoded = jwt.verify(token, config.get('jwtSecret'));
      req.client = decoded.client; 
      //client.id = decoded.id;
      //var clientId = decoded.id;
      console.log(client);
      //next(); 
    }
*/ 
    const id = req.client;
    /*
    client_bio = await ClientBio
      .findOne({_client: req.client.id,
get client() {
        return this._client;
      },
set client(value) {
        this._client = value;
      },
})
*/  
    client_bio = await ClientBio
      .findOne({_client: req.client.id})
      .populate('client', ['firstname', 'lastname']); 
      if(!client_bio) {
        res.status(400).json({msg: 'The client bio information given is invalid'});
      }

      res.status(200).json(client_bio);

  } catch(err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }
}); 

// @route   POST api/v3/client_bio 
// @desc    Add or update client bio data with id
// @access  Private 
apiRouter.post('/add_client_bio', 
[
  check('vetname', 'Vet doctors name is required please')
    .not()
    .isEmpty(),
  check('contactnumber', 'Enter clients contact number please') 
    .isNumeric()
  /*
    .exists()
    ,
  check('house', 'Enter house name and/or number please')
    .not()
    .isEmpty(),
  check('postcode', 'Enter post code please')
    .not()
    .isEmpty(),
  check('city', 'Enter city please')
    .not()
    .isEmpty()
  */
 ], 
 async (req, res, next) => {
   const errors = validationResult(req);
   if(!errors.isEmpty()) {
     return res.status(400).json({ errors: errors.array() });
   }
 
   const { contactnumber } = req.body;
 
   try {
     let client = await Client.findOne({contactnumber}); 
 
     if (!client) {
       res.status(400).json({msg: 'The client information given is invalid'});
     }
     
     // Get decoded token 
     const token = await req.header('x-auth-token') || req.body.token || req.query.token;
       
     if (token) {
 
     payload = {
       client: { id: client.id }
     }; 
 
    token = jwt.sign(
      payload, 
      config.get('jwtSecret'),
      { expiresIn: '3h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
        next();
      }); 
 
     // Decode token to get client id in payload data
     decoded = jwt.decode(token, {complete: true});
       req.client = decoded.client; 
       next();
     } 

     const {
       vetname,
       specialneed
     } = req.body;

// Build client bio object 
  const clientBioFields = {};

  clientBioFields.client = req.client.id;

  if(vetname) clientBioFields.vetname = vetname;
  if(specialneed) clientBioFields.specialneed = specialneed;

  // So contactnumber does not update to an empty array 
  let newContactnumber = '';
  if(contactnumber !== newContactnumber) clientBioFields.contactnumber = contactnumber;
  
/*  
  const {
    house,
    street,
    street2,
    postcode,
    city
  } = req.body;

  const newAddress = {
    house,
    street,
    street2,
    postcode,
    city
  }

  try {
    client_bio = await ClientBio.findOne({ client: req.client.id });

    client_bio.address.unshift(newAddress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }

*/  
    client_bio = await ClientBio.findOne({ client: req.client.id });

    if(client_bio) {
      // Update client bio
      client_bio = await ClientBio.findOneAndUpdate(
        { client: req.client.id }, 
        {
          $set: 
            { clientBioFields },
          $currentDate: { lastModified: true }
        },
        { new: true
          //,
          //upsert: true 
        }
      );

      res.json(client_bio); 
    }

    // Create client bio fields  
    //if (!client_bio) {
      client_bio = new ClientBio(clientBioFields);
    
    await client_bio.save();
   // }

    res.send('New client bio added');
  
  } catch(err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }

});

// @route   POST api/v3/client_bio 
// @desc    Add address to client bio data
// @access  Private 
apiRouter.post('/address_to_bio', 
[
  check('confirmContactnumber', 'Confirm clients contact number please')
    .isNumeric()
  /*
  check('contactnumber', 'Enter clients contact number please') 
    .isNumeric() 
  check('lastname', 'Owners last name is required please')
    .not()
    .isEmpty(),
  check('address', 'Address information is required') 
    .not()
    .isEmpty()
  */ 
, 
/*
body('confirmContactnumber')
    .custom((value, { req }) => {
      if (value !== req.body.contactnumber) {
        throw new Error("Invalid contact number");
      } 
        return true;
    }),
*/ 
],
/*
 
async (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstname, lastname, contactnumber, email, pets, avatar } = req.body;
  //const { confirmContactnumber } = ''; 

try {
    let client = await Client.findOne({contactnumber});
    
     if (!client) {
      res.status(400).json({msg: 'Invalid client information'});
     }

     else if (confirmContactnumber !== contactnumber) {
      throw new Error("Invalid contact number");
    } 
      next(); 

    body('confirmContactnumber', 'Confirm clients contact number please')
    .custom((value, { req }) => {
      if (value + 0 !== req.body.contactnumber) {
        throw new Error("Invalid contact number");
      } 
        //return true; 
        console.log(client.id);
    }), 
    
body('confirmContactnumber')
  .custom((value, { req }) => {
    if (value !== req.body.contactnumber) {
      throw new Error("Invalid contact number");
    } 
      return true;
}),
*/ 
async (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstname, lastname, contactnumber, email, pets, avatar } = req.body;
  //const confirmContactnumber = ''; 

try {
    let client = await Client.findOne({client: req.client.id});
    
     if (!client) {
      res.status(400).json({msg: 'The information given is invalid'});
      }
    
    // Compare contact numbers' function here? 
    body('confirmContactnumber', 'Confirm clients contact number please')
    .custom((value, { req }) => {
      if (value + 0 !== req.body.contactnumber) {
        throw new Error("Invalid contact number");
      } 
        //return true; 
        console.log(client.id);
        next();
    });


  // Build client bio object



  // Build client bio object
  const clientBioFields = {};

  clientBioFields.client = req.client.id;  
  if(firstname) clientBioFields.firstname = firstname;
  if(lastname) clientBioFields.lastname = lastname;
  if(contactnumber) clientBioFields.contactnumber = contactnumber;
  if(email) clientBioFields.email = email;
  if(pets) clientBioFields.pets = pets;
  if(avatar) clientBioFields.avatar = avatar;
 // if(address) clientBioFields.address = address; 
/*
  if(address) {
    clientBioFields.address = address.split(',').map(address => address.trim()); 
  }
*/
  
    client_bio = await ClientBio.findOne({ client: req.client.id });

    if(client_bio) {
      // Update client bio 
      client_bio = await ClientBio.findOneAndUpdate(
        { client: req.client.id }, 
        {
          $set: 
            { clientBioFields },
          $currentDate: { lastModified: true }
        },
        { new: true }
      );

      res.json(client_bio); 
    }

    // Create client bio fields  
    if (!client_bio) {
      client_bio = new ClientBio(clientBioFields);
    
    await client_bio.save();
    }

    res.send('Client bio added');
  
  } catch(err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }

});

// @route   GET api/v3/client_bio/all
// @desc    Get all client bios
// @access  Public (for now). Becomes 'Private' once users' signup / login is enabled
apiRouter.get('/all', async (req, res) => {
  try {
    const client_bios = await ClientBio.find()
      .populate('client', ['name', 'contactnumber', 'address', 'pets']);
      return res.json(client_bios);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }
});

module.exports = apiRouter;

/*
function clientId(client) {
  return client.id;
}
*/