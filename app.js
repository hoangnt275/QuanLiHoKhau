const express = require("express");
const app = express();
const route = require("./routes/index.route");
const connectDB = require("./config/database");
require("dotenv").config();
// set view engine
app.set("views", `${__dirname}/views`);
app.set("view engine", "pug");
// static files
app.use(express.static(`${__dirname}/public`));
// middleware to parse request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// routes
route(app);
// connect to database
connectDB();

module.exports = app;
