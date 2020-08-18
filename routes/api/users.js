const express = require("express");
const router = express.Router();
const config=require('config')
const {
  check,
  vaidationResult,
  validationResult,
} = require("express-validator");
const gravatar = require("gravatar");
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const User = require("../../models/Users");
//@route  GET api/users
//@desc   Register users
//@access Public
router.post(
  "/",//using express validator check
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Please enter a password with 6 or more char").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
      //checking if errors are in req.body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //if all good, deference
    const { name, email, password } = req.body;
    try {
        //check if user is already present
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ errors: [{ msg: "User already exists" }] });
      }
      //set an avatar for the account
      const avatar=gravatar.url(email,{
          s:'200',
          r:'pg',
          d:'mm'
      })
      //create a user object to be saved
      user=new User({
          name,
          email,
          avatar,
          password
      })
      //hash the damn password
      const salt=await bcrypt.genSalt(10);
      user.password=await bcrypt.hash(password,salt);
      //send it home
      await user.save();
      const payload={
          user:{
              id:user.id
          }
      }
      jwt.sign(payload,
        config.get('jwtSecret'),
        {expiresIn:360000},
        (err,token)=>{
            if(err) throw err;
            res.json({token});
        })
    //   res.send('User registered sucessfully');
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
