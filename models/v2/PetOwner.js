const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema - "PetOwner" == pet owner
const PetOwnerSchema = new Schema({
	name: {
		type: String,
		required: 'I need a name for the pet owner or client'
	}, 
	contactnumber: {
		type: [Number],
		required: 'Pet owners contact number is required',
		unique: true
	},
	confirmContactnumber: {
		type: Number,
		required: 'Confirm contact number entered above please'
	},
	address: [
		{
			house: {
				type: String,
				required: 'A flat house name and/or number is required please'
      },
      street: {
				type: String,
				//required: 'A street name, and possible building number is needed please'
      }, 
      street2: {
        type: String
      },
      postcode: {
				type: String,
				required: 'A postcode is needed for your address please'
      },
      city: {
				type: String,
				required: 'A town or city name is needed please'
      },
    }
  ],
	pets: [
		{
			// Array allows possibility of more than one pet 
			type: Schema.Types.ObjectId,
			ref: 'pet'
		}
	],
	email: {
		type: String
	},
	password: {
		type: String
	},
	avatar: {
		type: String
	},
	date: {
		type: Date,
		default: Date.now
	}
}); 
 
module.exports = PetOwner = mongoose.model('pet_owner', PetOwnerSchema); 
