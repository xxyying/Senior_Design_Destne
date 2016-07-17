var bcrypt = require('bcrypt-nodejs');
var passStrength = require('owasp-password-strength-test');

var Model = require('../models/model');

//Configure password tester based on OWASP requirements
passStrength.config({
  allowPassphrases: true,
  minLength: 10,
  minPhraseLength: 20,
  minOptionalTestsToPass: 4
});

//User Routes - Requires valid token and admin privileges
/*GET
Route to get all the users within the User DB
*/
var getAll = function(req, res) {
  new Model.User().fetchAll().then(function(user) {
    if(!user) {
      res.json({error: 'No users found'});
    }
    else {
      //Load the roles on to the user object
      user.load(['role']).then(function(data) {
        //Strip out extraneous information
        data = data.toJSON();
        for(var i = 0; i < data.length; i++) {
          if(data[i].role.length > 0) {
            for(var j = 0; j < data[i].role.length; j++) {
              data[i].role[j] = data[i].role[j].name;
            }
          }
        }
        res.json({users: data});
      });
    }
  });
};

/*POST
Route to create a new user pulling the information from
req.body.username and req.body.password
Check for valid username characters and a strong password with OWASP
If the user already exists, do nothing otherwise sign up the user
*/
var create = function(req, res) {
  var user = req.body;

  //Ensure that credentials were provided
  if(!user.username || !user.password) {
    return res.json({error: 'No Username or Password provided'});
  }
  //Ensure that all characters in username are valid
  if(!(/^[a-zA-Z0-9]+$/.test(req.body.username))) {
    return res.json({error: 'Invalid Characters in Username'});
  }
  //Ensure username isn't too long
  if(req.body.username.length > 100) {
    return res.json({error: 'Username should not be longer than 100 characters'});
  }

  //Verify password strength
  var result = passStrength.test(user.password);
  if(result.strong === false) {
    return res.json({error: result.errors});
  }

  //Verify names if they are put ins
  if(user.hasOwnProperty('firstname')) {
    if(user.hasOwnProperty('lastname')) {
      if(user.firstname.length > 45 || user.firstname.length === 0 ||
      user.lastname.length > 45 || user.lastname.length === 0) {
        return res.json({error: 'Names provided must be between 1 and 45 characters'});
      }
      if(!(/^[a-z\-]+$/i.test(user.firstname))) {
        return res.json({error: 'Illegal characters in the first name'});
      }
      if(!(/^[a-z\-]+$/i.test(user.lastname))) {
        return res.json({error: 'Illegal characters in the last name'});
      }
    }
    else {
      return res.json({error: 'Must provide first and last name or neither'});
    }
  }

  //Verify emails if they are put in
  if(user.hasOwnProperty('email')) {
    if(user.email.length > 100 || user.email.length === 0) {
      return res.json({error: 'Email must be between 1 and 100 characters'});
    }
    if(!(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{1,}\b/i.test(user.email))) {
      return res.json({error: 'Invalid email address provided'});
    }
  }

  new Model.User({username: user.username}).fetch().then(function(data) {
    if(data) { //Username already exists
      return res.json({error: 'Username already exists'});
    }
    else { //Attempt to sign up a new user
      var userData = {}; //Object to save
      userData.username = user.username;
      userData.password = bcrypt.hashSync(user.password);
      if(user.hasOwnProperty('firstname') && user.hasOwnProperty('lastname')) {
        userData.firstname = user.firstname;
        userData.lastname = user.lastname;
      }
      if(user.hasOwnProperty('email')) {
        userData.email = user.email;
      }

      new Model.User(userData).save().then(function() {
        return res.status(201).json({message: 'User created!'});
      });
    }
  }).catch(function(err) {
    console.log(err);
    return res.send('An error occured');
  });
};

//User/:userId Routes - Requires valid token and admin privileges

/*ALL
Verify :userId parameter before it is passed to other routes
Make sure that it is a positive, non-zero integer and that a user
with that userId exists within the database
*/
var verId = function(req, res, next, id) {
  //Check if the userId is a valid positive, non-zero integer
  var testId = ~~Number(id);
  if(!(String(testId) === id && testId > 0)) {
    return res.json({error: 'userId is not a positive, non-zero integer'});
  }

  //Check if the user exists with that id
  new Model.User({userId: id}).fetch().then(function(user) {
    if(!user) {
      return res.json({error: 'No user with that ID'});
    }
    else {
      //Add the roles to the user
      user.load(['role']).then(function(data) {
        data = data.toJSON();
        for(var x in data.role) {
          data.role[x] = data.role[x].name;
        }
        req.user = data;
        return next();
      });
    }
  }).catch(function(err) {
    console.log(err);
    return res.json({error: 'An error occured'});
  });
};

/*GET
Route to get the user with the specified userId
*/
var getOne = function(req, res) {
  //Get all the available roles
  new Model.Role().fetchAll().then(function(roles) {
    if(!roles) {
      return res.json({error: 'No roles in the database'});
    }
    else {
      roles = roles.toJSON();
      var unassignedRoles = [];

      //Determine the roles that have not been assigned to the user yet
      for(var i = 0; i < roles.length; i++) {
        var isAssigned = false;
        for(var j = 0; j < req.user.role.length; j++) {
          if(req.user.role[j] === roles[i].name) {
            isAssigned = true;
            break;
          }
        }
        if(!isAssigned) {
          unassignedRoles.push(roles[i].name);
        }
      }
      res.json({
        username: req.user.username,
        userId: req.user.userId,
        role: req.user.role,
        unassignedRole: unassignedRoles,
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        email: req.user.email
      });
    }
  }).catch(function(err) {
    console.log(err);
    return res.json({error: 'An error occured'});
  });
};

/*PUT
Route that verifies the parameters used to update user before updating the model. If an
error is found it is sent back without proceeding to the next function
*/
var verUpdate = function(req, res, next) {
  //Check for parameters in the body
  if(!req.body.hasOwnProperty('username') && !req.body.hasOwnProperty('password') &&
  !req.body.hasOwnProperty('addRole') && !req.body.hasOwnProperty('deleteRole') &&
  !req.body.hasOwnProperty('firstname') && !req.body.hasOwnProperty('lastname') &&
  !req.body.hasOwnProperty('email')) {
    return res.json({error: 'No Valid Parameters Provided'});
  }

  //PARAMETER Validation
  //Username
  if(req.body.hasOwnProperty('username')) {
    //Check for invalid username characters
    if(!(/^[a-zA-Z0-9]+$/.test(req.body.username))) {
      return res.json({error: 'Invalid Characters in Username'});
    }
    //Ensure username isn't too long
    if(req.body.username.length > 100) {
      return res.json({error: 'Username should not be longer than 100 characters'});
    }
  }

  //Verify password strength
  if(req.body.hasOwnProperty('password')) {
    var result = passStrength.test(req.body.password);
    if(result.strong === false) {
      return res.json({error: result.errors});
    }
  }

  //Verify name parameters
  if(req.body.hasOwnProperty('firstname')) {
    if(req.body.hasOwnProperty('lastname')) {
      if(req.body.firstname.length > 45 || req.body.firstname.length === 0 ||
      req.body.lastname.length > 45 || req.body.lastname.length === 0) {
        return res.json({error: 'Names provided must be between 1 and 45 characters'});
      }
      if(!(/^[a-z\-]+$/i.test(req.body.firstname))) {
        return res.json({error: 'Illegal characters in the first name'});
      }
      if(!(/^[a-z\-]+$/i.test(req.body.lastname))) {
        return res.json({error: 'Illegal characters in the last name'});
      }
    }
    else {
      return res.json({error: 'Must provide first and last name or neither'});
    }
  }

  //Verify emails if they are put in
  if(req.body.hasOwnProperty('email')) {
    if(req.body.email.length > 100 || req.body.length === 0) {
      return res.json({error: 'Email must be between 1 and 100 characters'});
    }
    if(!(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{1,}\b/i.test(req.body.email))) {
      return res.json({error: 'Invalid email address provided'});
    }
  }

  //Checks the addRoles and the deleteRoles
  checkAddRole(function() {
    //Delete Roles
    if(req.body.hasOwnProperty('deleteRole')) {
      //Iterate through the roles and see if they are already assigned to the user
      for(var i = 0; i < req.body.deleteRole.length; i++) {
        var isAssigned = false;
        for(var j = 0; j < req.user.role.length; j++) {
          if(req.body.deleteRole[i] === req.user.role[j]) {
            isAssigned = true;
            break;
          }
        }
        //If the role was not found on the user
        if(!isAssigned) {
          return res.json({error: 'Role - ' + req.body.deleteRole[i] + ' not assigned to the user'});
        }
      }

      //Now that all roles are validated, swap out the names with roleIDs
      new Model.Role().fetchAll().then(function(role) {
        if(role === null) {
          return res.json({error: 'Roles not found in the database'});
        }
        else {
          role = role.toJSON();
          //Iterate through and replace the names with their role IDs
          for(var i = 0; i < req.body.deleteRole.length; i++) {
            for(var j = 0; j < role.length; j++) {
              if(req.body.deleteRole[i] === role[j].name) {
                req.body.deleteRole[i] = role[j].roleId;
              }
            }
          }
          return next();
        }
      }).catch(function(err) {
        console.log(err);
        return res.send({message: 'Something went wrong'});
      });
    }
    else {
      return next();
    }
  });

  function checkAddRole(callback) {
    //Add Roles
    if(req.body.hasOwnProperty('addRole')) {
      //Verify role exists
      new Model.Role().fetchAll().then(function(role) {
        if(role === null) {
          return res.json({error: 'No roles in the database'});
        }
        role = role.toJSON();

        //Iterate through given roles to validate
        for(var i = 0; i < req.body.addRole.length; i++) {
          var doesExist = false;
          //Iterate through roles in database for comparison
          for(var j = 0; j < role.length; j++) {
            //If the role exists in the database then it is a valid role
            if(req.body.addRole[i] === role[j].name) {
              //If the role is already on the user
              if(req.user.role.indexOf(req.body.addRole[i]) !== -1) {
                return res.json({error: 'Role - ' + req.body.addRole[i] + ' already on the user'});
              }
              doesExist = true;
              //Replace with roleId
              req.body.addRole[i] = role[j].roleId;
              break;
            }
          }
          if(!doesExist) {
            return res.json({error: 'No role found with name - ' + req.body.addRole[i]});
          }
        }
        //All roles are valid at this point
        callback();
      }).catch(function(err) {
        console.log(err);
        return res.json({error: 'Something went wrong'});
      });
    }
    else {
      callback();
    }
  }
};

/*PUT
Route to change the information about a already existing user with the specified
userId. Note that all parameters at this point will be valid due to the above function
Allows for updating username, password, and roles.
*/
var update = function(req, res) {
  checkUsername(function() {
    //First remove roles from the user
    if(req.body.hasOwnProperty('deleteRole')) {
      req.body.deleteRole.forEach(function(item) {
        new Model.UserRole().where({userId: req.user.userId, roleId: item})
        .destroy({require: true});
      });
    }
    //Add new roles
    if(req.body.hasOwnProperty('addRole')) {
      req.body.addRole.forEach(function(item) {
        new Model.UserRole({userId: req.user.userId, roleId: item}).save();
      });
    }

    var updateObject = {}; //Used to store the JSON object to update the user

    //Construct the json
    if(req.body.hasOwnProperty('username')) {
      updateObject.username = req.body.username;
    }
    if(req.body.hasOwnProperty('password')) {
      updateObject.password = bcrypt.hashSync(req.body.password);
    }
    if(req.body.hasOwnProperty('firstname') && req.body.hasOwnProperty('lastname')) {
      updateObject.firstname = req.body.firstname;
      updateObject.lastname = req.body.lastname;
    }
    if(req.body.hasOwnProperty('email')) {
      updateObject.email = req.body.email;
    }
    if(updateObject.hasOwnProperty('username') || updateObject.hasOwnProperty('password') ||
    updateObject.hasOwnProperty('email') || updateObject.hasOwnProperty('firstname') ||
    updateObject.hasOwnProperty('lastname')) {
      new Model.User({userId: req.user.userId}).save(updateObject, {patch: true}).
      catch(function(err) {
        console.log(err);
        return res.json({error: 'Information update failed, please try again'});
      });
    }

    return res.json({message: 'User updated!'});
  });

  //Checks to see if the username already exists in the database
  function checkUsername(callback) {
    if(req.body.hasOwnProperty('username')) {
      new Model.User({username: req.body.username}).fetch().then(function(newUser) {
        //Username already exists
        if(newUser) {
          return res.json({error: 'Username already exists'});
        }
        else {
          callback();
        }
      }).catch(function(err) {
        console.log(err);
        return res.json({error: 'Something went wrong'});
      });
    }
    else {
      callback();
    }
  }
};

/*DELETE
Route to delete a user with the specified userId
*/
var remove = function(req, res) {
  new Model.User({userId: req.user.userId}).destroy({require: true}).then(function() {
    res.json({message: 'Successfully deleted'});
  }).catch(Model.User.NoRowsDeletedError, function() {
    res.send({error: 'No User found with that ID'});
  });
};

//Export Functions
module.exports.getAll = getAll;
module.exports.create = create;
module.exports.verId = verId;
module.exports.getOne = getOne;
module.exports.verUpdate = verUpdate;
module.exports.update = update;
module.exports.remove = remove;
