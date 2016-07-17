var Model = require('../models/model');
var knex = require('knex');

/* GET
This function gets the top 15 talking IPs on the ingress interface and returns
the total bytes and packets sent by these IPs
*/
var getIngressTopTalkers = function(req, res) {
  new Model.NetFlow().query(function(qb) {
    qb.select('ip_src as HostIP').groupBy('ip_src').sum('bytes as TotalBytes').sum('packets as TotalPackets').andWhere('flowdir', '=', '0').orderBy('TotalBytes', 'desc').limit(15);
  }).fetchAll().then(function(IngressTopTalkers) {
    if(!IngressTopTalkers) {
      res.json({error: 'Error Occured'});
    }
    else {
      res.json(IngressTopTalkers);
    }
  });
};

/* GET
This function gets the top 15 talking IPs on the egress interface and returns
the total bytes and packets sent by these IPs
*/
var getEgressTopTalkers = function(req, res) {
  new Model.NetFlow().query(function(qb) {
    qb.select('ip_src as HostIP').groupBy('ip_src').sum('bytes as TotalBytes').sum('packets as TotalPackets').andWhere('flowdir', '=', '1').orderBy('TotalBytes', 'desc').limit(15);
  }).fetchAll().then(function(EgressTopTalkers) {
    if(!EgressTopTalkers) {
      res.json({error: 'Error Occured'});
    }
    else {
      res.json(EgressTopTalkers);
    }
  });
};

/* GET
This function gets the top 15 applications that have sent the most packets over
the entire time period
*/
var getPacketsPerAppID = function(req, res) {
  new Model.NetFlow().query(function(qb) {
    qb.groupBy('netflow_test.appid').sum('packets as packetsum').orderBy('packetsum', 'desc').leftJoin('apptable_test', 'netflow_test.appid', '=', 'apptable_test.appid').limit(15);
  }).fetchAll({columns: ['appname']}).then(function(PacketsPerAppID) {
    if(!PacketsPerAppID) {
      res.json({error: 'Error Occured'});
    }
    else {
      res.json(PacketsPerAppID);
    }
  });
};

/* GET
This function gets the protocol distribution for the current data record by counting
the number of times it appears and summing it
*/
var getProtocolDistribution = function(req, res) {
  new Model.NetFlow().query(function(qb) {
    qb.select('ip_proto as protocol').groupBy('ip_proto').sum('bytes as TotalRecordedInstances').orderBy('TotalRecordedInstances', 'desc');
  }).fetchAll().then(function(ProtocolDistribution) {
    if(!ProtocolDistribution) {
      res.json({error: 'Error Occured'});
    }
    else {
      res.json(ProtocolDistribution);
    }
  });
};

/* GET
This function gets the ingress protocol distribution for the current
data record by counting the number of times it appears and summing it
*/
var getIngressProtocolDistribution = function(req, res) {
  new Model.NetFlow().query(function(qb) {
    qb.select('ip_proto as protocol').groupBy('ip_proto').sum('bytes as TotalRecordedInstances').andWhere('flowdir', '=', '0').orderBy('TotalRecordedInstances', 'desc');
  }).fetchAll().then(function(ProtocolDistribution) {
    if(!ProtocolDistribution) {
      res.json({error: 'Error Occured'});
    }
    else {
      res.json(ProtocolDistribution);
    }
  });
};

/* GET
This function gets the egress protocol distribution for the current
data record by counting the number of times it appears and summing it
*/
var getEgressProtocolDistribution = function(req, res) {
  new Model.NetFlow().query(function(qb) {
    qb.select('ip_proto as protocol').groupBy('ip_proto').sum('bytes as TotalRecordedInstances').andWhere('flowdir', '=', '1').orderBy('TotalRecordedInstances', 'desc');
  }).fetchAll().then(function(ProtocolDistribution) {
    if(!ProtocolDistribution) {
      res.json({error: 'Error Occured'});
    }
    else {
      res.json(ProtocolDistribution);
    }
  });
};

/* GET
This averages the packet size in bytesfor each applications and
shows the top 15 entries
*/
var getAvgPacketSizeByAppId = function(req, res) {
  new Model.NetFlow().query(function(qb) {
    qb.groupBy('netflow_test.appid').select(knex.raw('(sum(bytes) div sum(packets)) as `avgPacketSize`')).orderBy('avgPacketSize', 'desc').leftJoin('apptable_test', 'netflow_test.appid', '=', 'apptable_test.appid').limit(15);
  }).fetchAll({columns: ['appname']}).then(function(AvgPacketSizeByAppId) {
    if(!AvgPacketSizeByAppId) {
      res.json({error: 'Error Occured'});
    }
    else {
      res.json(AvgPacketSizeByAppId);
    }
  });
};

/* GET
This gets the bytes per hour for the ingress interface for the entire time span
*/
var getIngressBytesPerHour = function(req, res) {
  new Model.NetFlow().query(function(qb) {
    qb.select('stamp_inserted as TimeofDay').groupBy('TimeofDay').sum('bytes as TotalIngressBytes').andWhere('flowdir', '=', '0').orderBy('stamp_inserted');
  }).fetchAll().then(function(IngressBytesPerHour) {
    if(!IngressBytesPerHour) {
      res.json({error: 'Error Occured'});
    }
    else {
      res.json(IngressBytesPerHour);
    }
  });
};

/* GET
This gets the bytes per hour for the egress interface for the entire time span
*/
var getEgressBytesPerHour = function(req, res) {
  new Model.NetFlow().query(function(qb) {
    qb.select('stamp_inserted as TimeofDay').groupBy('TimeofDay').sum('bytes as TotalEgressBytes').andWhere('flowdir', '=', '1').orderBy('stamp_inserted');
  }).fetchAll().then(function(EgressBytesPerHour) {
    if(!EgressBytesPerHour) {
      res.json({error: 'Error Occured'});
    }
    else {
      res.json(EgressBytesPerHour);
    }
  });
};

/* GET
This gets the top 15 active applications specified by their byte count
*/
var getMostActiveApps = function(req, res) {
  new Model.NetFlow().query(function(qb) {
    qb.groupBy('netflow_test.appid').sum('bytes as sumcount').orderBy('sumcount', 'desc').leftJoin('apptable_test', 'netflow_test.appid', '=', 'apptable_test.appid').limit(15);
  }).fetchAll({columns: ['appname']}).then(function(mostActiveApps) {
    if(!mostActiveApps) {
      res.json({error: 'Error Occured'});
    }
    else {
      res.json(mostActiveApps);
    }
  });
};

/* GET
This gets the top 15 active applications specified by their byte count
*/
var getIngressMostActiveApps = function(req, res) {
  new Model.NetFlow().query(function(qb) {
    qb.groupBy('netflow_test.appid').sum('bytes as sumcount').andWhere('flowdir', '=', '0').orderBy('sumcount', 'desc').leftJoin('apptable_test', 'netflow_test.appid', '=', 'apptable_test.appid').limit(15);
  }).fetchAll({columns: ['appname']}).then(function(mostActiveApps) {
    if(!mostActiveApps) {
      res.json({error: 'Error Occured'});
    }
    else {
      res.json(mostActiveApps);
    }
  });
};

/* GET
This gets the top 15 active applications specified by their byte count
*/
var getEgressMostActiveApps = function(req, res) {
  new Model.NetFlow().query(function(qb) {
    qb.groupBy('netflow_test.appid').sum('bytes as sumcount').andWhere('flowdir', '=', '1').orderBy('sumcount', 'desc').leftJoin('apptable_test', 'netflow_test.appid', '=', 'apptable_test.appid').limit(15);
  }).fetchAll({columns: ['appname']}).then(function(mostActiveApps) {
    if(!mostActiveApps) {
      res.json({error: 'Error Occured'});
    }
    else {
      res.json(mostActiveApps);
    }
  });
};

/*GET
This gets which 15 apps have the most recorded instances in the database
*/
var getTopApps = function(req, res) {
  new Model.NetFlow().query(function(qb) {
    qb.groupBy('netflow_test.appid').count('netflow_test.appid as count').orderBy('count', 'desc').leftJoin('apptable_test', 'netflow_test.appid', '=', 'apptable_test.appid').limit(15);
  }).fetchAll({columns: ['appname']}).then(function(TopApps) {
    if(!TopApps) {
      res.json({error: 'Error Occured'});
    }
    else {
      res.json(TopApps);
    }
  });
};

var getColumnInfo = function(req, res) {
  new Model.NetFlow().query(function(qbCall) {
    qbCall.columnInfo();
  }).fetchAll().then(function(ColumnInfo) {
    if(!getColumnInfo) {
      res.json({error: 'Error Occured,could not get column info.'});
    }
    else {
      res.json(ColumnInfo);
    }
  });
};

//Export Functions
module.exports.getIngressTopTalkers = getIngressTopTalkers;
module.exports.getEgressTopTalkers = getEgressTopTalkers;
module.exports.getPacketsPerAppID = getPacketsPerAppID;
module.exports.getProtocolDistribution = getProtocolDistribution;
module.exports.getIngressProtocolDistribution = getIngressProtocolDistribution;
module.exports.getEgressProtocolDistribution = getEgressProtocolDistribution;
module.exports.getAvgPacketSizeByAppId = getAvgPacketSizeByAppId;
module.exports.getIngressBytesPerHour = getIngressBytesPerHour;
module.exports.getEgressBytesPerHour = getEgressBytesPerHour;
module.exports.getMostActiveApps = getMostActiveApps;
module.exports.getIngressMostActiveApps = getIngressMostActiveApps;
module.exports.getEgressMostActiveApps = getEgressMostActiveApps;
module.exports.getTopApps = getTopApps;
module.exports.getColumnInfo = getColumnInfo;
