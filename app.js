const express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
mongoose.connect("YOUR_DATABASE_HERE", { useNewUrlParser: true });
var db = mongoose.connection;
var app = express();

app.use(express.static("public"));

// View Engine
app.set("view engine", "ejs");

// Middleware
app.use(require("cookie-parser")());

app.use(require("body-parser").urlencoded({ extended: true }));
app.use(
  require("express-session")({
    secret: "save",
    resave: true,
    saveUninitialized: true
  })
);
//Passport
// Configure passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Configure passport-local to use account model for authentication
const User = require("./models/user");
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//Routes
app.use("/", require("./routes"));
// Set Port
app.set("port", process.env.PORT || 3000);

app.listen(app.get("port"), function() {
  console.log("Server started on port " + app.get("port"));
});
