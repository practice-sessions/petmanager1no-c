const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  contactnumber: {
    type: Number,
    required: 'Your contact number is required please',
    unique: true
  },
  email: {
    type: String,
    /*
    required: true,
    unique: true,
    // This should tell mongoDB to allow null values for email,
    // which will be filled in later with 'unique' values [But. No effect. WHY?]
    partial: true
    */
  },
  password: {
    type: String,
   // required: true
  },
  avatar: {
   type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = User = mongoose.model('user', UserSchema);
