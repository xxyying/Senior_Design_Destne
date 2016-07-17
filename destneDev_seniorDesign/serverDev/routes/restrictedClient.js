/*
This file contains all the restricted routes that are used by the client.
This is all contained in one file as all methods are GET
*/

var Model = require('../models/model');

/*GET
Route to display the analysis page
*/
var analysis = function(req, res) {
  res.render('pages/analysis', {title: 'Analysis', user: req.user});
};

/*GET
Route to display the management portion for the collector interface
*/
var collector = function(req, res) {
  res.render('pages/collector', {title: 'Collector', user: req.user});
};

/*GET
Route to display the management portion for the device interface
*/
var devices = function(req, res) {
  res.render('pages/device', {title: 'Devices', user: req.user});
};

//Guardians routes
/*GET
Route to display the selection portion for the guardian interface
*/
var selectGuardian = function(req, res) {
  res.render('pages/select-guardian', {title: 'Select Guardians', user: req.user});
};

/*ALL
Verify :userId parameter before it is passed to other routes
Make sure that it is a positive, non-zero integer and that a user
with that userId exists within the database
*/
var verId = function(req, res, next, id) {
  //Check if the userId is a valid positive, non-zero integer
  var testId = ~~Number(id);
  if(!(String(testId) === id && testId > 0)) {
    res.status(404).render('pages/404');
  }

  //Check if the user exists with that id
  new Model.User({userId: id}).fetch().then(function(user) {
    if(!user) {
      res.status(404).render('pages/404');
    }
    else {
      //Add the roles to the user
      user.load(['role']).then(function(data) {
        data = data.toJSON();
        for(var x in data.role) {
          data.role[x] = data.role[x].name;
        }
        req.targetUser = data;
        return next();
      });
    }
  }).catch(function(err) {
    console.log(err);
    return res.status(500);
  });
};

/*GET
Route to display the management portion for the guardian interface
Note this route is not always restricted if a user is attempting to edit
their own profile
*/
var manageGuardian = function(req, res) {
  res.render('pages/manage-guardian', {title: 'Manage Guardians', user: req.user, targetUser: req.targetUser});
};

module.exports.analysis = analysis;
module.exports.collector = collector;
module.exports.devices = devices;
module.exports.selectGuardian = selectGuardian;
module.exports.verId = verId;
module.exports.manageGuardian = manageGuardian;
