const express = require("express");
const router = express.Router();
const {
  check,
  vaidationResult,
  validationResult,
} = require("express-validator");
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcryptjs");

const auth = require("../../middleware/auth");
const User = require("../../models/Users");

//@route  GET api/auth
//@desc   Test route
//@access Public
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
//@route  GET api/auth
//@desc   Authenticate users and get token
//@access Public
router.post(
  "/", //using express validator check
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Please enter a password with 6 or more char").exists(),
  ],
  async (req, res) => {
    //checking if errors are in req.body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //if all good, deference
    const { email, password } = req.body;
    try {
      //check if user is already present
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invaid Credentials" }] });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invaid Credentials" }] });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
      //   res.send('User registered sucessfully');
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
