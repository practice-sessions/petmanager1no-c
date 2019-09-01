const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId
  },
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  contactnumber: {
    type: [Number],
    required: true,
    unique: true
  },
  /* 
  confirmContactnumber: {
		type: Number,
		//required: 'true' 
	},
  */
  email: {
    type: String
    /*,
    //required: true,
    unique: true,
    partial: true // This should tell mongoDB to allow null values for email,
    // which will be filled in later with 'unique' values [But. No effect. WHY?] 
    */
  },
  /*
  password: {
    type: String,
   // required: true 
  },
  */ 
  avatar: {
   type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});


// findByContactnumber method 
// - note: this would be defined/declared in the document (not necessarily here)
ClientSchema.methods.findByContactnumber = function (contactnumber) {
  return this.model('Client').find({ contactnumber: this.contactnumber }, contactnumber);
};
/*
// findByContactnumber static
ClientSchema.static('findByContactnumber', function(contactnumber) {
  return this.find({ contactnumber });
});
*/

module.exports = Client = mongoose.model('client', ClientSchema);
