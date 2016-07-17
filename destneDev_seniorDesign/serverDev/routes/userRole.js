var Model = require('../models/model');

//users/:userid/role calls - Requires valid token and admin privileges
/*GET
Route to get all the roles associated with the specified user
*/
var getAll = function(req, res) {
  return res.json({
      userId: req.user.userId,
      username: req.user.username,
      roles: req.user.role});
};

//user/:userid/role/:roleName calls - Requires valid token and admin privileges
/*ALL
Route to verify :roleName paramter before passing it to subsequent routes.
Checks to see if the role exists and if the user already has the role or not
*/
var checkRole = function(req, res, next, roleName) {
  new Model.Role({name: roleName}).fetch().then(function(role) {
    //Check to see if role exists
    if(role === null) {
      return res.send({message: 'No role found with name - ' + roleName});
    }
    else {
      //Add the roleId to the request for future methods
      req.user.roleId = role.toJSON().roleId;
      //Check to see if the user already has that role
      for(var x in req.user.role) {
        if(req.user.role[x] === roleName) {
          req.user.hasRole = true;
          return next();
        }
      }
      req.user.hasRole = false;
      return next();
    }
  }).catch(function(err) {
    console.log(err);
    return res.send({message: 'Something went wrong'});
  });
};

/*PUT
Route to add a role to current user as long as the role already exists and the
user does not already have it assigned to them
*/
var addOne = function(req, res) {
  //If the user doesn't have that role, add it
  if(req.user.hasRole === false) {
    new Model.UserRole({userId: req.user.userId, roleId: req.user.roleId})
    .save().then(function() {
      res.status(201).json({message: 'Role - ' + req.params.roleName + ' added to User - ' + req.user.username});
    });
  }
  //If user already has that role
  else {
    return res.send({message: 'User - ' + req.user.username + ' already has role - ' + req.params.roleName});
  }
};

/*DELETE
Route to delete the specified role from the specified user, does not delete
if the user does not have the role
*/
var removeOne = function(req, res) {
  //If the user has the role already, delete it
  if(req.user.hasRole === true) {
    new Model.UserRole().where({userId: req.user.userId, roleId: req.user.roleId})
    .destroy({require: true}).then(function() {
      res.send({message: 'Role - ' + req.params.roleName + ' deleted from User - ' + req.user.username});
    }).catch(Model.User.NoRowsDeletedError, function() {
      res.send({message: 'Specified role not found for that user'});
    });
  }
  else {
    return res.send({message: 'User - ' + req.user.username + ' does not have role - ' + req.params.roleName});
  }
};

//Exports
module.exports.getAll = getAll;
module.exports.checkRole = checkRole;
module.exports.addOne = addOne;
module.exports.removeOne = removeOne;
