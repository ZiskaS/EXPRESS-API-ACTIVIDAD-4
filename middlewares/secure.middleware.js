const createError = require('http-errors');
const User = require('../models/user.model'); // Import the User model
const Post = require('../models/post.model'); // Import the Post model
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

module.exports.auth = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    console.log('No se proporcionó la autorización en la solicitud.');
    return next(createError(401, 'Unauthorized: Missing auth header'));
  }

  const token = authorization.split('Bearer ')[1];

  try {
    const decoded = jwt.verify(token, 'your-secret-key');

    // Agregar registro para verificar el valor decodificado del token
    console.log('Valor decodificado del token:', decoded);

    User.findById(decoded.sub)
      .then((user) => {
        if (user) {
          req.user = user;
          next(); // Authenticated
        } else {
          console.log('Usuario no válido:', decoded.sub);
          next(createError(401, 'Unauthorized: Invalid user'));
        }
      })
      .catch((err) => {
        console.error('Error al buscar al usuario:', err);
        next(err);
      });
  } catch (err) {
    console.error('Error al decodificar el token:', err);
    next(createError(401, 'Unauthorized: Invalid token'));
  }
};

module.exports.self = (req, res, next) => {
  if (req.params.id === req.user._id.toString()) {
    next();
  } else {
    next(createError(403, 'Forbidden'));
  }
};

module.exports.postOwner = (req, res, next) => {
  Post.findById(req.params.id)
    .then((post) => {
      if (post && post.user.equals(req.user._id)) {
        req.post = post;
        next();
      } else {
        next(createError(404, 'Post not found'));
      }
    })
    .catch(next);
};

// Validation middleware for self and postOwner
module.exports.validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};