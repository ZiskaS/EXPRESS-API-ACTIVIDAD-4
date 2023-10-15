const mongoose = require('mongoose'); // Import mongoose
const Post = require('../models/post.model');

// Create a new post
exports.createPost = async (req, res, next) => {
  try {
    const { title, text, author } = req.body;
    const post = new Post({ title, text, author });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

// Get all posts
exports.getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};

// Get a post by ID
exports.getPostById = async (req, res, next) => {
  try {
    const postId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(404).json({ code: 'not_found' });
    }
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ code: 'not_found' });
    }
    
    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};

// Update a post by ID
exports.updatePostById = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const { title, text, author } = req.body;
    const post = await Post.findByIdAndUpdate(
      postId,
      { title, text, author, updatedAt: Date.now() },
      { new: true }
    );
    if (!post) {
      return res.status(404).json({ code: 'not_found' });
    }
    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};

// Delete a post by ID
exports.deletePostById = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const post = await Post.findByIdAndDelete(postId);
    if (!post) {
      return res.status(404).json({ code: 'not_found' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
