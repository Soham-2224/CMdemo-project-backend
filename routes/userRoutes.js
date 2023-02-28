const express = require("express");
const usersController = require("../controllers/usersController");
const router = express.Router();

router.route("/").get(usersController.getAllUsers).post(usersController.createNewUser);

router.route("/login").post(usersController.userLogin);

module.exports = router;
