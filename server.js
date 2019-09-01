const express = require('express');
const connectDB = require('./config/db');

const app = express();

// Connect Database 
connectDB();

// Initialise middleware 
app.use(express.json({ extended: false })); 

// End points
app.get('/', (req, res) => res.send('API connected..'));

// Define Routes 
app.use('/api/v1/users', require('./routes/api/v1/users')); 
app.use('/api/v1/auth', require('./routes/api/v1/auth'));
app.use('/api/v1/owner_bio', require('./routes/api/v1/owner_bio'));
app.use('/api/v1/pet', require('./routes/api/v1/pet1'));
app.use('/api/v1/todos', require('./routes/api/v1/todos1'));

//app.use('/api/v2/auth', require('./routes/api/v2/auth2'));
//app.use('/api/v2/pet_owners', require('./routes/api/v2/pet_owners'));
//app.use('/api/v2/pet2', require('./routes/api/v2/pet2'));
//app.use('/api/v2/todos2', require('./routes/api/v2/todos2')); 

//app.use('/api/v3/auth', require('./routes/api/v3/auth3'));
//app.use('/api/v3/clients', require('./routes/api/v3/clients'));
//app.use('/api/v3/client_bio', require('./routes/api/v3/client_bio'));

app.use('/api/v10/auth', require('./routes/api/v10/auth10'));
//app.use('/api/v10/users', require('./routes/api/v10/users'));
app.use('/api/v10/ownbio', require('./routes/api/v10/ownbio'));
app.use('/api/v10/pets', require('./routes/api/v10/pets'));
app.use('/api/v10/todos', require('./routes/api/v10/todos'));
 
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('Server running on port ', PORT)
});
