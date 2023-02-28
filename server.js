require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const { corsOptions } = require("./config/corsOptions");
const cookieParser = require("cookie-parser");
const connectDB = require("./mongoDB/connect");
const PORT = process.env.PORT || 3500;

app.use(cors(corsOptions));

app.use(express.json());

app.use(cookieParser());

app.use("/", express.static(path.join(__dirname, "/public")));

app.use("/", require("./routes/root"));

app.use("/users", require("./routes/userRoutes"));

app.use("/post", require("./routes/postRoutes"));

app.use("*", (req, res) => {
    res.status(404);
    if (req.accepts("html")) {
        res.sendFile(path.join(__dirname, "views", "404.html"));
    } else if (req.accepts("json")) {
        res.json({ message: "404 Not Found" });
    } else {
        res.type("txt").send("404 Not Found");
    }
});

const startServer = async () => {
    try {
        connectDB(process.env.MONGODB_URL);
        app.listen(PORT, () => console.log(`Server has started on port http://localhost:${PORT}/`));
    } catch (error) {
        console.log(error);
    }
};

startServer();
