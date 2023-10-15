const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt'); // Require the bcrypt module

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (email) => {
        // Use a regular expression to validate the email format
        return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email);
      },
      message: 'Invalid email format',
    },
  },
  password: {
    type: String,
    required: true,
  },
  bio: String,
  active: {
    type: Boolean,
    default: false,
  },
  activationToken: String, // Add the activation token field
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

userSchema.pre('save', function (next) {
  const user = this;

  // Hash the password before saving it to the database
  if (!user.isModified('password')) return next();

  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) return next(err);
    user.password = hash;
    next();
  });
});

const User = mongoose.model('User', userSchema);
module.exports = User;
