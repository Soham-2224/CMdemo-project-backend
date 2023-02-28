const express = require("express");
const postController = require("../controllers/postController");
const router = express.Router();

router
    .route("/")
    .get(postController.getAllBlogs)
    .post(postController.createNewBlog)
    .patch(postController.updateBlog)
    .delete(postController.deleteBlog);

module.exports = router;
