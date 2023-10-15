const express = require('express');
const router = express.Router();
const postsController = require('../controllers/post.controller');
const users = require('../controllers/users.controller');
const secure = require('../middlewares/secure.middleware');

// Register new user
router.post('/users', users.register);

// User login
router.post('/login', users.login);

// Require authentication for the rest of the CRUD operations on posts
router.post('/posts', secure.auth, postsController.createPost);
router.get('/posts', secure.auth, postsController.getAllPosts);
router.get('/posts/:id', secure.auth, postsController.getPostById);
router.patch('/posts/:id', secure.auth, postsController.updatePostById);
router.delete('/posts/:id', secure.auth, postsController.deletePostById);

module.exports = router;
