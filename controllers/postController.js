const Blog = require("../mongoDB/models/Blog");
const User = require("../mongoDB/models/Users");
const asyncHandler = require("express-async-handler");

// get all blogs
const getAllBlogs = asyncHandler(async (req, res) => {
    // get all blog from mongoDB
    const blogPosts = await Blog.find().lean();

    if (!blogPosts.length) {
        return res.status(400).json({ message: "No posts found" });
    }

    // Add username to each blog before sending the response
    const blogWithUser = await Promise.all(
        blogPosts.map(async (blog) => {
            const user = await User.findById(blog.user).lean().exec();
            return { ...blog, username: user.username };
        })
    );

    res.json(blogWithUser);
});

// create blog
const createNewBlog = asyncHandler(async (req, res) => {
    const { user, title, text } = req.body;

    if (!user || !title || !text) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // check for duplicate
    const duplicate = await Blog.findOne({ title }).lean().exec();

    if (duplicate) {
        return res.status(400).json({ message: "Duplicate blog title" });
    }

    // create & store blog
    const blog = await Blog.create({ user, title, text });

    if (!blog) {
        return res.status(400).json({ message: "Invalid blog data received" });
    }

    res.status(201).json({ message: "New blog created" });
});

// update a blog
const updateBlog = asyncHandler(async (req, res) => {
    const { id, user, title, text } = req.body;

    if (!id || !user || !title || !text) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // check the blog which we want to update
    const blog = await Blog.findById(id).exec();

    if (!blog) {
        return res.status(400).json({ message: "Blog not found" });
    }

    const duplicate = await Blog.findOne({ title }).lean().exec();

    if (duplicate && duplicate._id.toString() !== id) {
        return res.status(409).json({ message: "Duplicate blog title" });
    }

    blog.user = user;
    blog.title = title;
    blog.text = text;

    const updatedBlog = await blog.save();

    res.json(`'${updatedBlog.title}' updated`);
});

// delete a blog
const deleteBlog = asyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: "blog ID is required" });
    }

    const blog = await Blog.findById(id).exec();

    if (!blog) {
        return res.status(400).json({ message: "Blog not found" });
    }

    const deletedBlog = await blog.deleteOne();

    const reply = `Blog '${deletedBlog.title}' with ID ${deletedBlog._id} deleted`;

    res.json(reply);
});

module.exports = { getAllBlogs, updateBlog, createNewBlog, deleteBlog };
