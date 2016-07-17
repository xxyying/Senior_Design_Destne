/*
This file is for all the routes that return information about the base device accessed
on the client at /client/manage-device
*/
var os = require('os');
var exec = require('child_process').exec;
var network = require('network');
var storagePack = require('storage-device-info');
var dns = require('dns');

/*GET
Route to get the hostname, os, kernel, node version, and system uptime
*/
var system = function(req, res) {
  res.json({
    hostname: os.hostname(),
    os: os.type(),
    kernel: os.release(),
    nodeVersion: process.version,
    uptime: os.uptime()
  });
};

/*GET
Route to get the CPU Load of the system
*/
var cpuLoad = function(req, res) {
  res.json({cpuLoad: os.loadavg()});
};

/*GET
Route to get the storage information of the system in MB
*/
var storage = function(req, res) {
  storagePack.getPartitionSpace('/', function(err, space) {
    if(err == null) {
      console.log(space);
      res.json({
        freeStorage: space.freeMegaBytes,
        usedStorage: (space.totalMegaBytes - space.freeMegaBytes),
        totalStorage: space.totalMegaBytes
      });
    }
    else {
      console.log(err);
      res.json('Sorry something went wrong');
    }
  });
};

/*GET
Route to get the memory statistics of the system
*/
var memory = function(req, res) {
  var freeMem = os.freemem();
  var totalMem = os.totalmem();
  var usedMem = totalMem - freeMem;
  res.json({
    freeMemory: freeMem,
    usedMemory: usedMem,
    totalMemory: totalMem
  });
};

/*GET
Route to get all the device statstics in one JSON object (used for client)
*/
var devStats = function(req, res) {
  //Get memory info
  var freeMem = os.freemem();
  var totalMem = os.totalmem();
  var usedMem = totalMem - freeMem;

  //Get storage info
  storagePack.getPartitionSpace('/', function(err, space) {
    var freeSpace;
    var totalSpace;
    var usedSpace;
    if(err == null) {
      freeSpace = space.freeMegaBytes;
      totalSpace = space.totalMegaBytes;
      usedSpace = totalSpace - freeSpace;
    }
    else {
      console.log(err);
      freeSpace = 'Error';
      totalSpace = 'Error';
      usedSpace = 'Error';
    }

    //Send the object
    res.json({
      hostname: os.hostname(),
      os: os.type(),
      kernel: os.release(),
      nodeVersion: process.version,
      uptime: os.uptime(),
      cpuLoad: os.loadavg(),
      freeStorage: freeSpace,
      usedStorage: usedSpace,
      totalStorage: totalSpace,
      freeMemory: freeMem,
      usedMemory: usedMem,
      totalMemory: totalMem
    });
  });
};

/*GET
This route gets the information about the current DNS servers for the primary interface
*/
var getDNS = function(req, res) {
  var servers = dns.getServers();
  var responseString = JSON.parse('{"dnsServers": []}');

  for(var i = 0; i < servers.length; i++) {
    responseString.dnsServers.push({'server': servers[i]});
  }
  res.json(responseString);
};

/*GET
This route gets the information about the current DNS servers for the primary interface
*/
var getNetwork = function(req, res) {

  network.get_active_interface(function(err, obj) {
    if(err) {
      res.json({name: 'No Active Interface'});
    }
    else if(obj.name !== 'eth0') {
      res.json({name: 'Active Interface is not eth0, destne currently only supports eth0'});
    }
    else {
      checkNetType(function(networkType) {
        obj.networkType = networkType;
        var tmpServers = dns.getServers();
        obj.dnsServers = JSON.parse('[]');
        for(var i = 0; i < tmpServers.length; i++) {
          obj.dnsServers.push({'server': tmpServers[i]});
        }
        res.json(obj);
      });
    }
  });
};

/*PUT
This route allows for updating the Network used by the system. If the device
is being set to DHCP it will call the dhcp script, otherwise it will call the
static script. Note this will take the network down for several seconds causing
connectivity issues
*/
var setNetwork = function(req, res) {
  console.log(req.body);
  //Validate that proper fields exist for configuration DHCP
  if(req.body.hasOwnProperty('state') && req.body.state === 'dhcp') {
    exec('../views/scripts/change_network.sh dhcp', {
      cwd: __dirname
    },
    function(err, stdout) {
      if(stdout.indexOf('Finished!') > -1) {
        console.log(stdout);
        res.json({message: 'DHCP Network configured successfully!'});
      }
      else {
        res.json({error: 'Something went wrong in configuration'});
      }
      if(err !== null) {
        console.log('exec error: ' + err);
      }
    });
  }
  //Validate that proper fields exist for configuration Static
  else if(req.body.hasOwnProperty('state') && req.body.state === 'static' &&
  req.body.hasOwnProperty('ipaddress') && req.body.hasOwnProperty('netmask') &&
  req.body.hasOwnProperty('network') && req.body.hasOwnProperty('gateway') &&
  req.body.hasOwnProperty('nameserver1') && req.body.hasOwnProperty('nameserver2')) {
    var commandString = '../views/scripts/change_network.sh static ' + req.body.ipaddress +
    ' ' + req.body.netmask + ' ' + req.body.network + ' ' + req.body.gateway + ' ' +
    req.body.nameserver1 + ' ' + req.body.nameserver2;

    exec(commandString, {
      cwd: __dirname
    },
    function(err, stdout) {
      if(stdout.indexOf('Finished!') > -1) {
        console.log(stdout);
        res.json({message: 'Static Network configured successfully!'});
      }
      else {
        res.json({error: 'Something went wrong in configuration'});
      }
      if(err !== null) {
        console.log('exec error: ' + err);
      }
    });
  }
  //Invalid possibly due to lack of information
  else {
    res.json({error: 'Network not set, information is invalid please check format'});
  }
};

//Device Control Functions
/*GET
This function simply reboots the destne device but does not guarantee success
*/
var restartSys = function(req, res) {
  exec('reboot', function(err) {
    if(err !== null) {
      console.log('exec error: ' + err);
      res.json({error: 'Unable to reboot device'});
    }
    else {
      res.json({message: 'Device is rebooting, please wait a minute and refresh the browser'});
    }
  });
};

/*GET
This function shutsdown the device but does not guarentee success
*/
var shutdownSys = function(req, res) {
  exec('poweroff', function(err) {
    if(err !== null) {
      console.log('exec error: ' + err);
      res.json({error: 'Unable to shutdown device'});
    }
    else {
      res.json({message: 'Device is shutting down... to use destne again manually power the machine back on'});
    }
  });
};

//INTERNAL ROUTE Functions
/*
This function checks the /etc/network/interfaces file for eth0 and determines
if it is static, dhcp, or neither which results in an ERROR
*/
function checkNetType(callback) {
  var networkType;
  //Check in the network interfaces file to see if eth0 is dhcp or static
  exec('grep "iface eth0 inet" /etc/network/interfaces',
    function(err, stdout) {
      if(stdout.indexOf('dhcp') > -1) {
        networkType = 'dhcp';
      }
      else if(stdout.indexOf('static') > -1) {
        networkType = 'static';
      }
      else {
        networkType = 'ERROR';
      }
      if(err !== null) {
        console.log('exec error: ' + err);
      }
      callback(networkType);
    });
}

module.exports.system = system;
module.exports.cpuLoad = cpuLoad;
module.exports.storage = storage;
module.exports.memory = memory;
module.exports.devStats = devStats;

module.exports.getDNS = getDNS;
module.exports.getNetwork = getNetwork;
module.exports.setNetwork = setNetwork;

module.exports.restartSys = restartSys;
module.exports.shutdownSys = shutdownSys;
