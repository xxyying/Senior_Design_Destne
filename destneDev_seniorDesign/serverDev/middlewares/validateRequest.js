var passport = require('passport');
var Cookies = require('cookies');
var Model = require('../models/model');

/*
This function occurs on all requests and pulls any cookies or JWT
and attempts to verify the user. If there is no token or it is Invalid
req.user is set to null otherwise req.user is set with user properties
from the database.
*/
var tokenAuth = function(req, res, next) {
  //First check to see if the JWT came in as a cookie and parse it out
  var cookToken = new Cookies(req, res).get('access_token');
  if(typeof cookToken !== 'undefined') {
    req.headers['x-apiauth'] = 'Bearer ' + cookToken;
  }
  passport.authenticate('token-bearer', {session: false},
  function(err, user, token) {
    if(err || !user) {
      req.user = null;
      return next();
    }
    else {
      req.user = token;
      req.user.success = true;
      req.user.firstTime = user.toJSON().firstTime;
      return next();
    }
  })(req, res, next);
};

/*
This function restricts access for all routes at /client/*
If they are not signed in the client is redirected to /auth
otherwise they can continue to the requested page
*/
var restrictAuth = function(req, res, next) {
  if(req.user === null) {
    return res.redirect('/auth');
  }
  //If the user is the default admin and it is the first time logging in then send to wizard
  else if(req.user.username === 'destneAdmin' && req.user.firstTime === 1) {
    //Change the firstTime flag
    new Model.User({userId: req.user.userId}).save({firstTime: 0}, {patch: true});
    return res.redirect('/wizard');
  }
  else {
    //Change the firstTime flag
    if(req.user.firstTime === 1) {
      new Model.User({userId: req.user.userId}).save({firstTime: 0}, {patch: true});
    }
    next();
  }
};

/*
This function restricts access for all routes at /api/*
If they are not signed in a 403 message is sent for forbidden access
otherwise they can continue to the requested page
*/
var restrictAPIAuth = function(req, res, next) {
  if(req.user === null) {
    return res.status(403).json({
      success: false,
      message: 'No valid token provided'
    });
  }
  else {
    next();
  }
};

/*
This function checks that the user is an adminsitrator with req.user.role
which has been set in tokenAuth. If they are an admin let them continue,
otherwise send a 401 message
*/
var checkAPIAdmin = function(req, res, next) {
  var userRole = req.user.role;
  for(var x in userRole) {
    if(userRole[x] === 'Administrator') {
      return next();
    }
  }
  return res.status(401).json({
    success: false,
    message: 'Administrative privileges required'
  });
};

/*
This function checks that the user is an adminsitrator with req.user.role
which has been set in tokenAuth. If they are an admin let them continue,
otherwise send a 401 page
*/
var checkAdmin = function(req, res, next) {
  var userRole = req.user.role;
  for(var x in userRole) {
    if(userRole[x] === 'Administrator') {
      return next();
    }
  }
  return res.status(401).render('pages/401');
};

//Export functions for use
module.exports.tokenAuth = tokenAuth;
module.exports.restrictAuth = restrictAuth;
module.exports.restrictAPIAuth = restrictAPIAuth;
module.exports.checkAPIAdmin = checkAPIAdmin;
module.exports.checkAdmin = checkAdmin;
