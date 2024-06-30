const catchAsyncError=require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/errorhanlder");
const User=require("../models/userModels");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");


const dotenv=require("dotenv");
const { log } = require("console");
dotenv.config({ path: "Backend/config/config.env" });

//register a function
const registerUser=async(req,res,next)=>{
  const {name,email,password}=req.body;
  //validation

 
    const user=await User.create({name,email,password,
        avatar:{
            public_id:"this is a public id",
            url:"profile pitchure url",

        }
    });

    const token=user.getJWTToken();
    res.status(200).json({
        success:true,
        message:"user created succesfully",
       token,
    });


}
//login controller

const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  
  // Check if email and password are provided
  if (!email || !password) {
    return next(new ErrorHandler("Please enter all the fields", 400));
  }

  // Find user by email and select password
  const user = await User.findOne({ email }).select("+password");

  // If user not found
  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 400));
  }

  // Check if password matches
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 400));
  }

  // Generate token
  const token = user.getJWTToken();

  // Set cookie options
  const options = {
    httpOnly: true, // accessible only by web server
    sameSite: 'Strict', // helps mitigate CSRF attacks
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000) // cookie expiration time
  };

  // Set cookie and send response
  res.cookie('token', token, options);

  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    token
  });
});
//logout user

const logout=catchAsyncError(async(req,res,next)=>{
    res.cookie('token',null,{
        expires: new Date(Date.now()), // Set the expiration to now to immediately invalidate the cookie
        httpOnly: true,
    });

    res.status(200).json({
        message:"Logged out succesfully",
    })
});

//forget password
const forgotPassword=catchAsyncError(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
  
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
  
    // Get ResetPassword Token
    const resetToken = user.getResetPasswordToken();
  
    await user.save({ validateBeforeSave: false });
  
    const resetPasswordUrl = `${req.protocol}://${req.get(
      "host"
    )}/password/reset/${resetToken}`;
  
    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;
  
    try {
      await sendEmail({
        email: user.email,
        subject: `Ecommerce Password Recovery`,
        message,
      });
  
      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email} successfully`,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
  
      await user.save({ validateBeforeSave: false });
  
      return next(new ErrorHandler(error.message, 500));
    }
  });

  //reset password


const resetPassword = catchAsyncError(async (req, res, next) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorHandler('Reset Password Token is invalid or has expired', 404));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler('Passwords do not match', 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  const token = user.getJWTToken();
  
  // Set cookie options
  const options = {
    httpOnly: true, // accessible only by web server
    sameSite: 'Strict', // helps mitigate CSRF attacks
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000) // cookie expiration time
  };

  // Set the cookie and send the response
  res.cookie('token', token, options).status(200).json({
    success: true,
    message: 'Password reset successfully and user logged in',
    token
  });
})

//get user details
const getuserDetails=catchAsyncError(async(req,res,next)=>{
  
    const user=await User.findById(req.user.id);
  console.log(req.user);
    

    res.status(200).json({
      success:true,
      user,
    });
});

//update password
const updatePassword=catchAsyncError(async(req,res,next)=>{
  const user=await User.findById(req.user.id).select("+password");

  const isPasswordMatched=await user.comparePassword(req.body.oldPassword);

  if(!isPasswordMatched){
    return next(new ErrorHandler("Password is not matched",400));

  }
  user.password=req.body.newPassword;
 await user.save();

 const token = user.getJWTToken();

  // Set cookie options
  const options = {
    httpOnly: true, // accessible only by web server
    sameSite: 'Strict', // helps mitigate CSRF attacks
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000) // cookie expiration time
  };

  // Set cookie and send response
  res.cookie('token', token, options);

  res.status(200).json({
    success: true,
    message: "User password is updated",
    token
  });

});

//updated profile

const updateProfile=catchAsyncError(async(req,res,next)=>{

  const newUserData={
    name:req.body.name,
    email:req.body.email,
  }
  
  const user=await User.findByIdAndUpdate(
    req.user.id,newUserData,{
      new:true,
      runValidators:true,
      useFindAndModify:false,
    }
)

  res.status(200).json({
    success:true,
    
  });

});

//get all users(admin)
const getallUsers=catchAsyncError(async(req,res,next)=>{
  const users=await User.find({});
  res.status(200).json({
    message:"all users are fetched succesfully",
    users,
  });
});

//get single user by admin
const getSingleUserDetails = async (req, res) => {
  try {
      const user = await User.findById(req.params.id);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
  } catch (error) {
      res.status(500).json({ message: 'Error retrieving user', error });
  }
};

//profile updated by admin
const updateUserrole=catchAsyncError(async(req,res,next)=>{

  const newUserData={
    name:req.body.name,
    email:req.body.email,
    role:req.body.role
  }
  
  const user=await User.findByIdAndUpdate(
    req.params.id,newUserData,{
      new:true,
      runValidators:true,
      useFindAndModify:false,
    }
)

  res.status(200).json({
    success:true,
    user,
    
  });

});

//delete the user by admin

const DeleteUser=catchAsyncError(async(req,res,next)=>{
 
  await User.findByIdAndDelete(req.params.id);


  res.status(200).json({
    message:"User deleted succesfully",
    success:true,
  })


})





module.exports={registerUser,login,logout,forgotPassword,resetPassword,getuserDetails,updatePassword,updateProfile,getallUsers,getSingleUserDetails,updateUserrole,DeleteUser};