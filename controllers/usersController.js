const User = require("../mongoDB/models/Users");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

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
    const { username, password } = req.body;

    // confirm data
    if (!username || !password) {
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
    const hashedPwd = await bcrypt.hash(password, 10);

    const userObj = { username, password: hashedPwd };

    // create and store new user
    const user = await User.create(userObj);

    if (!user) {
        return res.status(400).json({ message: "Invalid user data received" });
    }
    res.status(201).json({ message: `New user ${username} created` });
});

module.exports = { getAllUsers, createNewUser };
