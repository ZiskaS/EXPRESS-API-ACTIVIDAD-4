const express = require('express');
const createError = require('http-errors');
const app = express();
const routeConfig = require('./config/route.config');
const dbConfig = require('./config/db.config');
const User = require('./models/user.model');

// Use body-parser middleware to parse JSON data
app.use(express.json());

// Connect to the MongoDB database
dbConfig.connect();

// Use the routeConfig middleware for /api route
app.use('/api', routeConfig);

// Route to handle the default route '/'
app.get('/', (req, res) => {
  res.send('Welcome to My Express API');
});

app.get('/api/activate/:token', async (req, res) => {
  const token = req.params.token;
  console.log('Received activation token:', token);
  try {
    const user = await User.findOne({ activationToken: token });
    console.log('Found user:', user);
    if (!user || user.active) {
      console.log('Invalid or expired activation token');
      return res.status(400).json({ message: 'Invalid or expired activation token. Account activation failed.' });
    }
    // Update the user's account to "active: true" and clear the activation token
    await User.findByIdAndUpdate(user._id, { active: true, activationToken: null });
    res.status(200).json({ message: 'Account activated successfully.' });
  } catch (err) {
    console.error('Error during activation:', err);
    res.status(400).json({ message: 'Invalid or expired activation token. Account activation failed.' });
  }
});


// Error Handling for Route Not Found
app.use((req, res, next) => {
  next(createError(404, 'Route not found'));
});

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.info(`Application running at port ${port}`);
  console.log('Ready!');
});
