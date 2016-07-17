/*
This file contains all the unrestricted routes that are used by the client except
for the authentication method. This is all contained in one file as all methods are GET
*/

/*GET
Route to display the about page
*/
var about = function(req, res) {
  console.log(req.user);
  res.render('pages/about', {title: 'About', user: req.user});
};

/*GET
Route to display the home page (unauthenticated)
*/
var basePage = function(req, res) {
  res.render('pages/index', {title: 'Home', user: req.user});
};

/*GET
Route to display the start of the wizard
*/
var startWizard = function(req, res) {
  res.render('pages/Wizard/start', {title: 'Wizard', user: req.user});
};

/*GET
Route to display the add guardian section of the wizard
*/
var userWizard = function(req, res) {
  res.render('pages/Wizard/guardian', {title: 'Wizard', user: req.user});
};

/*GET
Route to display the router config section of the wizard
*/
var routerWizard = function(req, res) {
  res.render('pages/Wizard/router', {title: 'Wizard', user: req.user});
};

/*GET
Route to display the collector section of the wizard
*/
var collectorWizard = function(req, res) {
  res.render('pages/Wizard/collector', {title: 'Wizard', user: req.user});
};

/*GET
Route to display the network section of the wizard
*/
var networkWizard = function(req, res) {
  res.render('pages/Wizard/netint', {title: 'Wizard', user: req.user});
};

/*GET
Route to display the end of the wizard
*/
var finishWizard = function(req, res) {
  res.render('pages/Wizard/finish', {title: 'Wizard', user: req.user});
};

module.exports.about = about;
module.exports.basePage = basePage;
module.exports.startWizard = startWizard;
module.exports.userWizard = userWizard;
module.exports.routerWizard = routerWizard;
module.exports.collectorWizard = collectorWizard;
module.exports.networkWizard = networkWizard;
module.exports.finishWizard = finishWizard;
