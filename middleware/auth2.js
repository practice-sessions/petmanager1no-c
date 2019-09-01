const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = async function(req, res, next) {
  // Get token from header 
  const token = await req.header('x-auth-token') || req.body.token || req.query.token;

  // Check, if no token 
  if(!token) {
    return res.status(401).json({ msg: 'Authorisation denied! No pet owner token' });
  }

  // If token available. Verify token
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));

    req.pet_owner = decoded.pet_owner;
    next();

  } catch(err) {
    res.status(401).json({ msg: 'Invalid pet owner token' });
  }
};