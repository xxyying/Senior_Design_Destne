/*
This file is for all the routes related to the configuration of the collector
*/
var exec = require('child_process').exec;
var readline = require('readline');
var fs = require('fs');

/*GET
This function allows for starting the collector according to the information in
/pmacct/mysql-nfacctd.conf
*/
var start = function(req, res) {
  exec('../pmacct/startpmacct.sh', {
    cwd: __dirname
  },
  function(err, stdout) {
    //Check to see if there was an error
    if(stdout.indexOf('ERROR:') > -1) {
      res.json({
        error: stdout.split('ERROR:')[1].trim()
      });
    }
    //Check to see if the process started
    else if(stdout.indexOf('SUCCESS:') > -1) {
      console.log(stdout);
      res.json({
        message: 'Collector successfully started'
      });
    }
    //Handle random cases
    else {
      res.json({
        error: 'Something went wrong, contact an administrator'
      });
    }
    if(err !== null) {
      console.log('exec error: ' + err);
    }
  });
};

/*GET
This function allows for stopping the collector if it is running
*/
var stop = function(req, res) {
  exec('../pmacct/killpmacct.sh', {
    cwd: __dirname
  },
  function(err, stdout) {
    //Check to see if there was an error
    if(stdout.indexOf('ERROR:') > -1) {
      res.json({
        error: stdout.split(':')[1].trim()
      });
    }
    else {
      res.json({
        message: 'Collector successfully stopped'
      });
    }
    if(err !== null) {
      console.log('exec error: ' + err);
    }
  });
};

/*GET
This function gets the current configuration of the collector from
mysql-nfacctd.conf fields
*/
var getConfig = function(req, res) {
  var retJSON = {};
  //Check to make sure the file exists
  try {
    fs.accessSync('./pmacct/mysql-nfacctd.conf', fs.F_OK);
    var rl = readline.createInterface({
      input: fs.createReadStream('./pmacct/mysql-nfacctd.conf')
    });

    //Read the file line by line and strip out the config information
    rl.on('line', function(line) {
      if(line.indexOf('nfacctd_ip:') > -1) {
        retJSON.collectorIP = line.split('nfacctd_ip:')[1].trim();
      }
      if(line.indexOf('nfacctd_port:') > -1) {
        retJSON.collectorPort = line.split('nfacctd_port:')[1].trim();
      }
      if(line.indexOf('sql_db:') > -1) {
        retJSON.sqlDB = line.split('sql_db:')[1].trim();
      }
      if(line.indexOf('sql_host:') > -1) {
        retJSON.sqlHost = line.split('sql_host:')[1].trim();
      }
      if(line.indexOf('sql_user:') > -1) {
        retJSON.sqlUser = line.split('sql_user:')[1].trim();
      }
    });

    rl.on('close', function() {
      //Check to see if the object is empty
      if(Object.keys(retJSON).length === 0 && JSON.stringify(retJSON) === JSON.stringify({})) {
        return res.json({
          error: 'No configuration parameters found in the configuration file'
        });
      }
      else {
        //Check to see if the collector is currently running
        exec('pgrep "nfacctd"', {
          cwd: __dirname
        },
        function(err, stdout) {
          //Check to see if anything was returned
          if(stdout.length > 0) {
            retJSON.status = 'Running';
          }
          else {
            retJSON.status = 'Stopped';
          }
          if(err !== null) {
            console.log('exec error: ' + err);
          }

          return res.json(retJSON);
        });
      }
    });
  }
  catch(e) {
    if(e.code === 'ENOENT') {
      return res.json({
        error: 'No configuration file found in the proper location, contact an admin'
      });
    }
    else {
      throw e;
    }
  }
};

/*PUT
This function allows for changing the following fields in mysql-nfacctd.conf
using the mysqlconfig.sh script: nfacctd_ip, nfacctd_port, sql_db, sql_host,
sql_user, and sql_passwd
*/
var changeConfig = function(req, res) {
  var commandString = '';  //Contains the bash parameters for the script
  var errorJSON = {
    error: []
  };

  //Validate Parameters
  if(req.body.hasOwnProperty('collectorIP')) {
    if(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(req.body.collectorIP)) {
      commandString += ' ' + req.body.collectorIP;
    }
    else {
      errorJSON.error.push({collectorIP: 'Invalid IP Address (IPv4)'});
    }
  }
  else {
    commandString += ' ""';
  }

  if(req.body.hasOwnProperty('collectorPort')) {
    //Check to see if it is a valid, positive integer
    var n = ~~Number(req.body.collectorPort);
    if(String(n) === req.body.collectorPort && n >= 0 && n <= 65535) {
      commandString += ' ' + req.body.collectorPort;
    }
    else {
      errorJSON.error.push({collectorPort: 'The collector port must be a valid integer between 0 and 65535'});
    }
  }
  else {
    commandString += ' ""';
  }
  //Validate valid IPv4 address
  if(req.body.hasOwnProperty('sqlHost')) {
    if(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(req.body.sqlHost)) {
      commandString += ' ' + req.body.sqlHost;
    }
    else {
      errorJSON.error.push({sqlHost: 'Invalid IP Address (IPv4)'});
    }
  }
  else {
    commandString += ' ""';
  }
  //Validate database field exists
  if(req.body.hasOwnProperty('sqlDB')) {
    commandString += ' ' + req.body.sqlDB;
  }
  else {
    commandString += ' ""';
  }
  //Validate user field exists
  if(req.body.hasOwnProperty('sqlUser')) {
    commandString += ' ' + req.body.sqlUser;
  }
  else {
    commandString += ' ""';
  }
  //Validate password field exists
  if(req.body.hasOwnProperty('sqlPassword')) {
    commandString += ' ' + req.body.sqlPassword;
  }
  else {
    commandString += ' ""';
  } //Finish validation

  //Check to see if any errors arose, otherwise run the script
  if(Object.keys(errorJSON.error).length === 0 && JSON.stringify(errorJSON.error) === JSON.stringify([])) {
    exec('../pmacct/mysqlconfig.sh' + commandString, {
      cwd: __dirname
    },
    function(err) {
      res.json({
        message: 'Collector parameters updated'
      });
      if(err !== null) {
        console.log('exec error: ' + err);
      }
    });
  }
  else {
    return res.json(errorJSON);
  }
};

module.exports.start = start;
module.exports.stop = stop;
module.exports.getConfig = getConfig;
module.exports.changeConfig = changeConfig;
