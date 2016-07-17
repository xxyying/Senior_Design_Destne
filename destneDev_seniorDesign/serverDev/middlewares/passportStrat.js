var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var Model = require('../models/model');

//PASSPORT STRATEGIES
/*
This function is used for the basic authentication strategy at /auth
Takes the username and unhashed password and returns the user if valid in
the database. Otherwise returns an error and message about the error
*/
var basicStrat = function(username, password, done) {
  //Check for the User in the database
  new Model.User({username: username}).fetch().then(function(data) {
    var user = data;
    //No user with that username
    if(user === null) {
      return done(null, false, {message: 'Invalid username or password'});
    }
    else {
      user = data.toJSON();
      //Check the password
      if(!bcrypt.compareSync(password, user.password)) {
        return done(null, false, {message: 'Invalid username or password'});
      }
      else {
        //Add the roles to the user after correct creds
        data.load(['role']).then(function(user) {
          user = user.toJSON();
          for(var x in user.role) {
            user.role[x] = user.role[x].name;
          }
          done(null, user);
        });
      }
    }
  });
};

/*
This function is used for the token authentication located on all routes
First verify the JWT and then if valid look for them within the database
If they are valid pass the user back and the decoded token, otherwise null
*/
var tokenStrat = function(token, done) {
  //Verify the JSON Web Token
  jwt.verify(token, require('../conf/secret')(), function(err, decoded) {
    if(err) {
      return done(null, false, {message: 'Invalid token provided'});
    }
    else {
      //Check for the user in the database from the decoded JWT parameters
      new Model.User({userId: decoded.userId, username: decoded.username}).fetch().then(function(user) {
        //No user found
        if(user === null) {
          return done(null, false);
        }
        //Valid token and user
        else {
          return done(null, user, decoded);
        }
      });
    }
  });
};

//Exports for later use
module.exports.basicStrat = basicStrat;
module.exports.tokenStrat = tokenStrat;
