const createError = require('http-errors');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');


// Registration logic
module.exports.register = async (req, res, next) => {
  try {
    const { name, email, password, bio } = req.body;

    console.log('Contraseña sin cifrar (before hashing):', password);
  
    // Check for validation errors
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
     return res.status(400).json({ errors: errors.array() });
   }

   // Additional validation for empty fields
   if (!name || !email || !password || !bio) {
    return res.status(400).json({ errors: [{ msg: 'All fields must contain information' }] });
  }

    // Additional validation for password minimum length
    if (password.length < 8) {
      return res.status(400).json({ errors: [{ msg: 'Password must be at least 8 characters long' }] });
    }

    // Generate an activation token
    const activationToken = jwt.sign({ email }, 'your-secret-key', {
      expiresIn: '1d', // Token expires in 1 day
    });

    console.log('Generated activation token:', activationToken); // Log the token

    // Create a new user with the provided information and set the activation token
    const user = new User({ name, email, password, bio, activationToken });

    // Log the activation token before saving it to the database
    console.log('Activation token before saving to the database:', user.activationToken);


    // Save the user to the database (password will be hashed automatically by the middleware)
    await user.save();

    // Register the user successfully and return the user object as a response
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};




// Login logic
module.exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  // Additional validation for empty fields
  if (!email || !password) {
    return res.status(400).json({ errors: [{ msg: 'Email and password are required' }] });
  }

  // Check for validation errors
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Simulate a query to the database to find the user by email
  const user = await User.findOne({ email });

  console.log('User:', user); // Print the user object

  if (!user) {
    return next(createError(401, 'Credenciales inválidas'));
  }

  if (!user.active) {
    return next(createError(401, 'Usuario no activo')); // Add this check
  }

  // Verify the hash stored in the database
  const storedHash = user.password; // Get the hash stored in the database
  console.log('Hash almacenado en la base de datos:', storedHash);

  const isMatch = await bcrypt.compare(password, storedHash);

  console.log('Resultado de la comparación de contraseñas:', isMatch);

  if (!isMatch) {
    console.log('Contraseña incorrecta.');
    return next(createError(401, 'Credenciales inválidas'));
  }

  // Generate a JWT token and respond with it
  const token = jwt.sign({ sub: user._id }, 'super secreto', {
    expiresIn: '1h',
  });

  res.status(200).json({ token });
};
