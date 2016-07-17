//Vendor Libraries
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var morgan = require('morgan');
var fs = require('fs');
var https = require('https');
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var CustomBearerStrategy = require('passport-http-custom-bearer');
var helmet = require('helmet');

//Custom Libraries
var Validation = require('./middlewares/validateRequest');
var passportStrat = require('./middlewares/passportStrat');
var routes = require('./routes');

var app = express();

//HTTPS Configuration - Check for valid certificate and private key
var key;
try {
  key = fs.readFileSync('./conf/server.pem', 'utf8');
} catch(e) {
  console.log('Missing file ./conf/server.pem');
  console.log('Have you run `make generate_key_dev` in the conf folder?');
  process.exit(1);
}
var cert;
try {
  cert = fs.readFileSync('./conf/server.crt', 'utf8');
} catch(e) {
  console.log('Missing file ./conf/server.crt');
  console.log('Have you run `make generate_key_dev` in the conf folder?');
  process.exit(1);
}
var credentials = {
  key: key,
  cert: cert
};

//Application Settings
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(helmet());
app.use('/static', express.static(__dirname + '/views'));
app.use(passport.initialize());
passport.use(new BasicStrategy(passportStrat.basicStrat));
passport.use('token-bearer', new CustomBearerStrategy({headerName: 'apiauth'}, passportStrat.tokenStrat));

//Middleware for app
//Check for a valid token upon every request
app.all('/*', Validation.tokenAuth);
//Require authentication at /client/*
app.all('/client/*', Validation.restrictAuth);
//Require admin authentication at
app.all('/wizard*', Validation.checkAdmin);
app.all('/client/manage*', Validation.checkAdmin);
app.all('/client/select-*', Validation.checkAdmin);
//Require authentication at /api/*
app.all('/api/*', Validation.restrictAPIAuth);
//Permission Restriction
app.all('/api/v1/admin/*', Validation.checkAPIAdmin);

//Basic Routing
app.use('/', routes.clientRouter);
app.use('/api', routes.apiRouter);
app.use(function(req, res) {
  res.status(404).render('pages/404');
});

//Start the Application
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(8443, function(err) {
  if(err) {
    throw err;
  }
  console.log('Server is running @ https://localhost:' + httpsServer.address().port);
});
