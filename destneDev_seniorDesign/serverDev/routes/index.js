var express = require('express');
var apiRouter = express.Router();
var clientRouter = express.Router();

//Route Files
var user = require('./user.js');
var userRole = require('./userRole.js');
var collector = require('./collector.js');
var netflow = require('./netflow.js');
var auth = require('./authenticate.js');
var unrestrict = require('./unrestricted.js');
var restrictedClient = require('./restrictedClient.js');
var deviceStats = require('./deviceStats.js');

//----------------Client Routes---------------
//Middleware for client
clientRouter.param('userId', restrictedClient.verId);

//Non-restricted routes
clientRouter.route('/auth')
  .get(auth.loginPage)
  .post(auth.authenticatePost);
clientRouter.route('/signout')
  .get(auth.signout);
clientRouter.route('/about')
  .get(unrestrict.about);
clientRouter.route('/')
  .get(unrestrict.basePage);

//Restricted Routes
clientRouter.route('/wizard')
  .get(unrestrict.startWizard);
clientRouter.route('/wizard/start')
  .get(unrestrict.startWizard);
clientRouter.route('/wizard/addUsers')
  .get(unrestrict.userWizard);
clientRouter.route('/wizard/router')
  .get(unrestrict.routerWizard);
clientRouter.route('/wizard/collector')
  .get(unrestrict.collectorWizard);
clientRouter.route('/wizard/network')
  .get(unrestrict.networkWizard);
clientRouter.route('/wizard/finish')
  .get(unrestrict.finishWizard);
clientRouter.route('/client/analysis')
  .get(restrictedClient.analysis);
clientRouter.route('/client/manage-collector')
  .get(restrictedClient.collector);
clientRouter.route('/client/manage-device')
  .get(restrictedClient.devices);
clientRouter.route('/client/select-guardian')
  .get(restrictedClient.selectGuardian);
clientRouter.route('/client/manage-guardian/:userId')
  .get(restrictedClient.manageGuardian);

//----------------API Routes-----------------
//Parameter restrictions
apiRouter.param('userId', user.verId);
apiRouter.param('roleName', userRole.checkRole);

//Below routes can only be accessed by authenticated users
//Netflow routes
apiRouter.route('/v1/netflow/getPacketsPerAppID')
  .get(netflow.getPacketsPerAppID);
apiRouter.route('/v1/netflow/getProtocolDistribution')
  .get(netflow.getProtocolDistribution);
apiRouter.route('/v1/netflow/getIngressProtocolDistribution')
  .get(netflow.getIngressProtocolDistribution);
apiRouter.route('/v1/netflow/getEgressProtocolDistribution')
  .get(netflow.getEgressProtocolDistribution);
apiRouter.route('/v1/netflow/getAvgPacketSizeByAppId')
  .get(netflow.getAvgPacketSizeByAppId);
apiRouter.route('/v1/netflow/getIngressBytesPerHour')
  .get(netflow.getIngressBytesPerHour);
apiRouter.route('/v1/netflow/getEgressBytesPerHour')
  .get(netflow.getEgressBytesPerHour);
apiRouter.route('/v1/netflow/getMostActiveApps')
  .get(netflow.getMostActiveApps);
apiRouter.route('/v1/netflow/getIngressMostActiveApps')
  .get(netflow.getIngressMostActiveApps);
apiRouter.route('/v1/netflow/getEgressMostActiveApps')
  .get(netflow.getEgressMostActiveApps);
apiRouter.route('/v1/netflow/getTopApps')
  .get(netflow.getTopApps);
apiRouter.route('/v1/netflow/getEgressTopTalkers')
  .get(netflow.getEgressTopTalkers);
apiRouter.route('/v1/netflow/getIngressTopTalkers')
  .get(netflow.getIngressTopTalkers);
apiRouter.route('/v1/netflow/getColumnInfo')
  .get(netflow.getColumnInfo);

//Below routes can only be accessed by administrators
apiRouter.route('/v1/admin/user')
  .get(user.getAll)
  .post(user.create);
apiRouter.route('/v1/admin/user/:userId')
  .get(user.getOne)
  .put(user.verUpdate)
  .put(user.update)
  .delete(user.remove);
apiRouter.route('/v1/admin/user/:userId/role')
  .get(userRole.getAll);
apiRouter.route('/v1/admin/user/:userId/role/:roleName')
  .put(userRole.addOne)
  .delete(userRole.removeOne);

//Device Statistics
apiRouter.route('/v1/admin/device/system')
  .get(deviceStats.system);
apiRouter.route('/v1/admin/device/cpuLoad')
  .get(deviceStats.cpuLoad);
apiRouter.route('/v1/admin/device/storage')
  .get(deviceStats.storage);
apiRouter.route('/v1/admin/device/memory')
  .get(deviceStats.memory);
apiRouter.route('/v1/admin/device/devStats')
  .get(deviceStats.devStats);
apiRouter.route('/v1/admin/device/restart')
  .get(deviceStats.restartSys);
apiRouter.route('/v1/admin/device/shutdown')
  .get(deviceStats.shutdownSys);

//Network Statistics
apiRouter.route('/v1/admin/device/dns')
  .get(deviceStats.getDNS);
apiRouter.route('/v1/admin/device/network')
  .get(deviceStats.getNetwork)
  .put(deviceStats.setNetwork);

//Collector Configuration
apiRouter.route('/v1/admin/collector/start')
  .get(collector.start);
apiRouter.route('/v1/admin/collector/stop')
  .get(collector.stop);
apiRouter.route('/v1/admin/collector/config')
  .get(collector.getConfig)
  .put(collector.changeConfig);

//Fall back in case no pages meet the above requirements
apiRouter.use(function(req, res) {
    res.status(404).send('Not Found');
  });

//Exports
module.exports.apiRouter = apiRouter;
module.exports.clientRouter = clientRouter;
