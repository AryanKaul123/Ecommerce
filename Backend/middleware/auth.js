const jwt = require('jsonwebtoken');
const User = require('../models/userModels');
const catchAsyncError = require('../middleware/catchAsyncError');
const ErrorHandler = require('../utils/errorhanlder');

// Middleware to check if user is authenticated
const IsAuthenticatedUser = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler('Please login to access the resources', 401));
  }

  try {
    const decodedtoken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedtoken.id);
   console.log(req.user);
    if (!req.user) {
      return next(new ErrorHandler('User not found', 404));
    }

    next();
  } catch (error) {
    return next(new ErrorHandler('Invalid token', 401));
  }
});

// Middleware to check if user has the required role(s)
const authorizedRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ErrorHandler('You are not authorized to access this resource', 403));
    }
    next();
  };
}

module.exports = { IsAuthenticatedUser, authorizedRoles };
