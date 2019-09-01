const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema 
const PetSchema = new Schema({
	/*
	pets: {
		type: [String]
	},
	*/
	petbio: [
		{
			
			petname: {
				type: String,
				required: true 
			},
      pettype: {
				// Array used to enable multiple pet types if needed - changed 
				type: String,
				required: true
			},
			petbreed: {
				type: String
			},
			
		}
	],

	ownbio: {
		type: Schema.Types.ObjectId, 
		ref: 'ownbio'
	},
	petavatar: {
			type: String // this may change to buffer 
		},
  user: {
		type: Schema.Types.ObjectId, 
		ref: 'users'
	},
	age: {
		type: String,
		required: true
	},
	// Serves as unique identifier for each pet registered to owner 
	firsteverarrivaldate: {
		type: Date
	},
	// Owners fullname (first+last) concantenated - for ease of reference
	fullname: {
		type: String
	},
	datecalc: [
		{
			fromarrivaldate: {
				type: Date,
				default: Date.now
			},
			expectedexitdate: {
				type: Date
			},
			toactualexitdate: {
				type: Date
      },
      from: {
        type: String
      },
      to: {
        type: String
      }
    },
	],
	createddate: {
		type: Date,
		default: Date.now
	}
});

module.exports = Pet = mongoose.model('pet', PetSchema); 