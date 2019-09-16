const passport = require("passport");
const router = require("express").Router();
const User = require("./models/user");
const Poll = require("./models/poll");

// Keyword to register

const KEYWORD_CODE = "YOUR_KEYWORD_HERE";

// GET

router.get("/", (req, res) => {
  if (!req.user) {
    res.render("pages/index", { user: req.user });
  } else {
    Poll.findOne({}, (err, doc) => {
      if (err) {
        throw err;
      } else {
        res.render("pages/vote", { user: req.user, poll: doc });
      }
    });
  }
});
router.get("/login", (req, res) => {
  if (!req.user) {
    res.render("pages/login", { user: req.user });
  } else {
    res.redirect("/");
  }
});
router.get("/signup", (req, res) => {
  if (!req.user) {
    res.render("pages/signup", { user: req.user });
  } else {
    res.redirect("/");
  }
});
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});
router.get("/admin", (req, res) => {
  if (req.user && req.user.admin) {
    res.render("pages/admin", { user: req.user });
  } else {
    res.redirect("/login");
  }
});

// POST

router.post("/login", passport.authenticate("local"), function(req, res) {
  res.redirect("/");
});
router.post("/register", (req, res) => {
  console.log("registering user");
  if (req.body.code === KEYWORD_CODE) {
    User.register(
      new User({ username: req.body.name, admin: false, voted: false }),
      req.body.password,
      function(err) {
        if (err) {
          console.log("error while user register!", err);
          return next(err);
        }

        console.log("user registered!");

        res.redirect("/");
      }
    );
  } else {
    res.send("Wrong keyword code");
  }
});
router.post("/vote", async (req, res) => {
  if (!req.user) {
    res.redirect("/login");
  } else if (req.user.voted) {
    res.send("You already voted");
  } else {
    let promise1 = User.findOne({ username: req.user.username }, (err, doc) => {
      if (err) throw err;
      doc.voted = true;
      doc.save((err, newDoc) => {
        if (err) throw err;
      });
    });

    let promise2 = Poll.findOne({}, (err, doc) => {
      if (err) {
        throw err;
      } else {
        for (let i = 0; i < doc.options.length; i++) {
          if (req.body[i]) {
            doc.options[i].cont++;
          }
        }
        doc.markModified("options");
        doc.save((err, newDoc) => {
          if (err) throw err;
        });
      }
    });

    await promise1;
    await promise2;

    res.redirect("/");
  }
});

/*
 *
 *  ADMIN ROUTES
 *
 */

// Change the title of the poll
router.post("/changetitle", (req, res) => {
  if (req.user && req.user.admin) {
    Poll.findOne({}, (err, doc) => {
      if (err) {
        throw err;
      } else {
        doc.title = req.body.newtitle;
        doc.save((err, newDoc) => {
          if (err) throw err;
        });
      }
    });
  }
  res.redirect("/admin");
});

// Reset the votes and enable anyone to vote again.
router.post("/resetvotes", (req, res) => {
  if (req.user && req.user.admin) {
    Poll.findOne({}, (err, doc) => {
      if (err) {
        throw err;
      } else {
        doc.options.forEach(e => {
          e.cont = 0;
        });
        doc.markModified("options");
        doc.save((err, newDoc) => {
          if (err) throw err;
        });
      }
    });
    User.find({}, (err, doc) => {
      if (err) {
        throw err;
      } else {
        doc.forEach(e => {
          e.voted = false;
          e.save((err, newDoc) => {
            if (err) throw err;
          });
        });
      }
    });
  }
  res.redirect("/admin");
});

// Delete all options and enable everyone to vote again.
router.post("/resetoptions", (req, res) => {
  if (req.user && req.user.admin) {
    Poll.findOne({}, (err, doc) => {
      if (err) {
        throw err;
      } else {
        doc.options = [];
        doc.markModified("options");
        doc.save((err, newDoc) => {
          if (err) throw err;
        });
      }
    });
    User.find({}, (err, doc) => {
      if (err) {
        throw err;
      } else {
        doc.forEach(e => {
          e.voted = false;
          e.save((err, newDoc) => {
            if (err) throw err;
          });
        });
      }
    });
  }
  res.redirect("/admin");
});

// Add option to the Poll
router.post("/addoption", (req, res) => {
  if (req.user && req.user.admin) {
    Poll.findOne({}, (err, doc) => {
      if (err) {
        throw err;
      } else {
        doc.options.push({ title: req.body.newoption, cont: 0 });
        doc.markModified("options");
        doc.save((err, newDoc) => {
          if (err) throw err;
        });
      }
    });
  }
  res.redirect("/admin");
});

// Delete option from the Poll
router.post("/deleteoption", (req, res) => {
  if (req.user && req.user.admin) {
    Poll.findOne({}, (err, doc) => {
      if (err) {
        throw err;
      } else {
        for (let i = doc.options.length - 1; i >= 0; i--) {
          if (doc.options[i].title === req.body.option) {
            doc.options.splice(i, 1);
          }
        }
        doc.markModified("options");
        doc.save((err, newDoc) => {
          if (err) throw err;
        });
      }
    });
  }
  res.redirect("/admin");
});

module.exports = router;
