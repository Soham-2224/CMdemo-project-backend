const User = require("../mongoDB/models/Users");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

const saltRounds = 10;

// Get all users
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password").lean();

    if (!users?.length) {
        return res.status(400).json({ message: "No users found" });
    }
    res.json(users);
});

// Create users
const createNewUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    // confirm data
    if (!username || !password || !email) {
        return res.status(400).json({
            message: "All fields are required",
        });
    }

    // check for duplicate
    const duplicate = await User.findOne({ username }).lean().exec();

    if (duplicate) {
        return res.status(400).json({ message: "Duplicate username" });
    }

    // hash the password
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPwd = await bcrypt.hash(password, salt);

    const userObj = { username, email, password: hashedPwd };

    // create and store new user
    const user = await User.create(userObj);

    if (!user) {
        return res.status(400).json({ message: "Invalid user data received" });
    }
    res.status(201).json({ message: `New user ${username} created` });
});

// user login
const userLogin = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "All fields are required",
        });
    }

    // find user by name
    const user = await User.findOne({ username }).lean().exec();

    if (!user) {
        return res.status(400).json({ message: "No users found with this username" });
    }

    const result1 = await bcrypt.compare(password, user.password);

    result1 ? res.status(200).json({ message: `Verified` }) : res.status(400).json({ message: "Wrong Password" });
});

module.exports = { getAllUsers, createNewUser, userLogin };
