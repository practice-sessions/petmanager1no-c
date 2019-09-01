const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = async function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token') || req.body.token || req.query.token;

  // Check, if no token 
  if(!token) {
    return res.status(401).json({ msg: 'Authorisation denied! No user token' });
  }

  // If token available. Decode token - no verification since
  // only admin backend user with full read/write access
  try {
    // Decode token to get client id in payload data
    decoded = jwt.decode(token, {complete: true});
    // const decoded = jwt.verify(token, config.get('jwtSecret'));

    req.client = decoded.client;
    next();

  } catch(err) {
    res.status(401).json({ msg: 'Invalid client token' });
  }
};

// const jwt = require('jsonwebtoken');
      // //const config = require('config');

      // module.exports = async function(req, res, next) {
      //   // Get token from header 
      //   const token = req.header('x-auth-token') || req.body.token || req.query.token;

      //   // Check, if no token
      //   if(!token) {
      //     return res.status(401).json({ msg: 'Authorisation denied! No client token' });
      //   }

      //   // If token available. Decode token - no verification since 
      //   // only admin backend user with full read/write access
      //   try {
      //     // Decode token to get client id in payload data
      //     decoded = jwt.decode(token, {complete: true});
      //       req.client = decoded.client; 
      //       next();
      //     /*  
      //     }
      //     const decoded = jwt.verify(token, config.get('jwtSecret'));

      //     req.client = decoded.client;
      //     next();
      //     */
      //   } catch(err) {
      //     res.status(401).json({ msg: 'Invalid client token' });
      //   }

      //   /*

      //   const token = await req.header('x-auth-token') || req.body.token || req.query.token;
            
      //     if (token) {
      //       payload = {
      //         client: { id: client.id }
      //       };

      //     token = jwt.sign(
      //       payload, 
      //       config.get('jwtSecret'),
      //       { expiresIn: '3h' },
      //       (err, token) => {
      //         if (err) throw err;
      //         res.json({ token });
      //         next();
      //       });

      //     // Decode token to get client id in payload data
      //     decoded = jwt.decode(token, {complete: true});
      //       req.client = decoded.client; 
      //       next();
      //     }

      //   */
      // };