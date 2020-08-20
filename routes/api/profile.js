const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const {
  check,
  vaidationResult,
  validationResult,
} = require("express-validator");
//models
const Profile = require("../../models/Profile");
const User = require("../../models/Users");
//@route  GET api/profile/me
//@desc   Get current user's profile
//@access Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
//@route  POST api/profile
//@desc   Get current user's profile
//@access Private
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;
    const ProfileFields = {};
    ProfileFields.user = req.user.id;
    if (company) ProfileFields.company = company;
    if (website) ProfileFields.website = website;
    if (location) ProfileFields.location = location;
    if (bio) ProfileFields.bio = bio;
    if (status) ProfileFields.status = status;
    if (githubusername) ProfileFields.githubusername = githubusername;
    if (skills) {
      ProfileFields.skills = skills.split(",").map((skill) => skill.trim());
    }
    ProfileFields.social = {};
    if (youtube) ProfileFields.social.youtube = youtube;
    if (facebook) ProfileFields.social.facebook = facebook;
    if (twitter) ProfileFields.social.twitter = twitter;
    if (instagram) ProfileFields.social.instagram = instagram;
    if (linkedin) ProfileFields.social.linkedin = linkedin;
    //insert the data
    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        //update it
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: ProfileFields },
          { new: true }
        );
        return res.json(profile);
      }
      //create
      profile=new Profile(ProfileFields);
      await profile.save();
      return res.json(profile);
    } catch (error) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
    res.send("Hello");
  }
);

//@route  GET api/profile
//@desc   Get all profiles
//@access Public

router.get('/',async(req,res)=>{
    try {
        //using populate to reference the user model and take name&avatar
        const profiles=await Profile.find().populate('user',['name','avatar'])
        res.json(profiles);

    } catch (error) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
})
//@route  GET api/profile/user/:user_id
//@desc   Get profile by user id
//@access Public

router.get('/user/:id',async(req,res)=>{
    try {
        //using populate to reference the user model and take name&avatar
        const profile=await Profile.findById(req.params.id).populate('user',['name','avatar'])
        if(!profile) 
            return res.status(400).json({msg:'Profile not found'});
        res.json(profile);
        

    } catch (err) {
        console.error(err.message);
        if(err.kind=='ObjectId')
            return res.status(400).json({msg:'Profile not found'});
        res.status(500).send('Server Error')
    }
})
//@route  DELETE api/profile
//@desc   Delete profile,user &posts
//@access Private

router.delete('/',auth,async(req,res)=>{
    try {
        
        await Profile.findOneAndRemove({user:req.user.id})
        await User.findOneAndRemove({id:req.user.id})
        
        res.json({msg:'user deleted'});
        

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
})

//@route  PUT api/profile/experience
//@desc   Add profile experience
//@access Private

router.put('/experience',[auth,[
        check('title','Title is required').not().isEmpty(),
        check('company','Company is required').not().isEmpty(),
        check('from','From date is required').not().isEmpty(),
    ]
],async (req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()}); 
    }
    const{
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }=req.body;
    const newExp={
        title,company,location,from,to,current,description
    }
    try {
        const profile=await Profile.findOne({user:req.user.id});
        profile.experience.unshift(newExp);
        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});

//@route  DELETE api/profile/experience
//@desc   Delete a profile experience
//@access Private
router.delete('/experience/:id',auth, async(req,res)=>{
  try {
    const profile=await Profile.findOne({user:req.user.id});
    //get remove index
    const removeIndex=profile.experience
        .map(item=>item.id)
        .indexOf(req.params.id);
    if(!removeIndex)
      return res.status(400).json({msg:'Requested exp not found'})
    profile.experience.splice(removeIndex,1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
})

//@route  PUT api/profile/education
//@desc   Add profile education
//@access Private

router.put('/education',[auth,[
  check('school','School is required').not().isEmpty(),
  check('degree','Degree is required').not().isEmpty(),
  check('fieldofstudy','Field of Study is required').not().isEmpty(),
  check('from','From date is required').not().isEmpty(),
]
],async (req,res)=>{
const errors=validationResult(req);
if(!errors.isEmpty()){
  return res.status(400).json({errors:errors.array()}); 
}
const{
 school,
  degree,
  fieldofstudy,
  from,
  to,
  current,
  description
}=req.body;
const newEdu={
  school,degree,fieldofstudy,from,to,current,description
}
try {
  const profile=await Profile.findOne({user:req.user.id});
  console.log(profile)
  profile.education.unshift(newEdu);
  await profile.save();
  res.json(profile);
} catch (err) {
  console.error(err.message);
  res.status(500).send('Server Error');
}

});

//@route  DELETE api/profile/education/:id
//@desc   Delete a profile education
//@access Private
router.delete('/education/:id',auth, async(req,res)=>{
try {
const profile=await Profile.findOne({user:req.user.id});
//get remove index
const removeIndex=profile.education
  .map(item=>item.id)
  .indexOf(req.params.id);
  console.log(removeIndex)
if(removeIndex==-1)
  return res.status(400).json({msg:'Requested edu not found'})
profile.education.splice(removeIndex,1);
await profile.save();
res.json(profile);
} catch (err) {
console.error(err.message);
res.status(500).send('Server Error');
}
})
module.exports = router;
