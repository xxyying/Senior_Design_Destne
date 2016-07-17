//Vendor Library
var passport = require('passport');
var jwt = require('jsonwebtoken');
var Cookies = require('cookies');

var expireTime = 1200000; //Expire time for tokens in seconds

//Authenticate - No access requirements
/*GET
Route to display the login page. If the user is already logged in
redirect them to the client landing page
*/
var loginPage = function(req, res) {
  //Render the username to be used in the header for the page if someone is logged in
  if(req.user === null) {
    res.render('pages/signin', {title: 'Sign In', user: req.user});
  }
  else {
    res.redirect('/client/analysis');
  }
};

/*POST
Route for clients to post their credentials as the header
Authorization: Basic base64creds
If it is invalid send a failure message back, otherwise issue
a JWT stored inside a Cookie with the pre-set expireTime
*/
var authenticatePost = function(req, res, next) {
  passport.authenticate('basic', {session: false}, function(err, user) {
    if(err) { //Error with Authentication
      res.json({
        success: false,
        message: 'Error with Authentication Server'
      });
    }
    if(!user) { //Invalid username or password
      res.json({
        success: false,
        message: 'Invalid Username or Password'
      });
    }
    else { //Valid User, issue token
      //Create JWT with secret, user info, and expireTime
      var token = jwt.sign({
        userId: user.userId,
        username: user.username,
        role: user.role
      }, require('../conf/secret')(), {expiresIn: expireTime});

      //Set the JWT within a cookie with appropriate expireTime
      new Cookies(req, res).set('access_token', token, {
        httpOnly:true,
        secure: true,
        maxAge: expireTime * 1000, //Expire Time in msec
        overwrite: true
      });

      res.json({
        success: true,
        token: token
      });
    }
  })(req, res, next);
};

//Signout - No access requirements
/*GET
Route to signout the user and remove the cookie from the client
Upon removal redirect the client to the authentication page
*/
var signout = function(req, res) {
  new Cookies(req, res).set('access_token'); //Expire the client cookie
  res.redirect('/auth');
};

//Exports
module.exports.loginPage = loginPage;
module.exports.authenticatePost = authenticatePost;
module.exports.signout = signout;
