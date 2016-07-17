/* globals c3 */
$(function() {
  var columnColors = ['#FA4760', '#FFCA49', '#30C36F',
  '#5369DE', '#b674b6', '#FA4760', '#FFCA49',
  '#30C36F', '#5369DE', '#b674b6', '#FA4760',
  '#FFCA49', '#30C36F', '#5369DE', '#b674b6'];
  var chartNames = ['protocolChart', 'avgPacketChart', 'egressSummaryChart', 'egressTopTalkerChart',
  'egressBPHChart', 'egressProtocolChart', 'ingressSummaryChart', 'ingressTopTalkerChart',
  'ingressBPHChart', 'ingressProtocolChart'];

  drawProtocolChart('#protocolChart', '/api/v1/netflow/getProtocolDistribution');
  drawAvgPacketChart('#avgPacketChart', columnColors);
  drawSummaryChart('#egressSummaryChart', '/api/v1/netflow/getEgressMostActiveApps', columnColors);
  drawTopTalkersChart('#egressTopTalkerChart', '/api/v1/netflow/getEgressTopTalkers', columnColors);
  drawBPHChart('#egressBPHChart', '/api/v1/netflow/getEgressBytesPerHour', 'TotalEgressBytes');
  drawProtocolChart('#egressProtocolChart', '/api/v1/netflow/getEgressProtocolDistribution');
  drawSummaryChart('#ingressSummaryChart', '/api/v1/netflow/getIngressMostActiveApps', columnColors);
  drawTopTalkersChart('#ingressTopTalkerChart', '/api/v1/netflow/getIngressTopTalkers', columnColors);
  drawBPHChart('#ingressBPHChart', '/api/v1/netflow/getIngressBytesPerHour', 'TotalIngressBytes');
  drawProtocolChart('#ingressProtocolChart', '/api/v1/netflow/getIngressProtocolDistribution');

  //Button press functions
  $('#refresh-dataset').click(function() {
    //Replace all the charts with the waiting message
    for(var i = 0; i < chartNames.length; i++) {
      $('#' + chartNames[i]).replaceWith(
        '<div id="' + chartNames[i] + '" class="text-center">' +
        '<div class="alert alert-info"><p><i class="fa fa-exclamation-triangle"></i>' +
        ' We are getting your custom analytics from destne, please wait a moment....</p></div><div>'
      );
    }

    drawProtocolChart('#protocolChart', '/api/v1/netflow/getProtocolDistribution');
    drawAvgPacketChart('#avgPacketChart', columnColors);
    drawSummaryChart('#egressSummaryChart', '/api/v1/netflow/getEgressMostActiveApps', columnColors);
    drawTopTalkersChart('#egressTopTalkerChart', '/api/v1/netflow/getEgressTopTalkers', columnColors);
    drawBPHChart('#egressBPHChart', '/api/v1/netflow/getEgressBytesPerHour', 'TotalEgressBytes');
    drawProtocolChart('#egressProtocolChart', '/api/v1/netflow/getEgressProtocolDistribution');
    drawSummaryChart('#ingressSummaryChart', '/api/v1/netflow/getIngressMostActiveApps', columnColors);
    drawTopTalkersChart('#ingressTopTalkerChart', '/api/v1/netflow/getIngressTopTalkers', columnColors);
    drawBPHChart('#ingressBPHChart', '/api/v1/netflow/getIngressBytesPerHour', 'TotalIngressBytes');
    drawProtocolChart('#ingressProtocolChart', '/api/v1/netflow/getIngressProtocolDistribution');
  });
});

function drawProtocolChart(chartName, urlName) {
  $.ajax({
    type: 'GET',
    url: urlName,
    dataType: 'json'
  }).done(function(json) {
    $(chartName).empty();
    var	protocol = [];
    var totalRecordedInstances = {};
    for(var i = 0; i < json.length; i++) {
      totalRecordedInstances[json[i].protocol] = Math.log(parseInt(json[i].TotalRecordedInstances, 10)) / Math.LN10;
      protocol[i] = json[i].protocol;
    }

    c3.generate({
      bindto: chartName,
      size: {
        height: 300,
        width: 420
      },
      data: {
        json: [totalRecordedInstances],
        keys: {
          value: protocol
        },
        type:'pie'
      }
    });
  }).fail(function() {
    $(chartName).empty();
    //Upon failure replace the statistics with an error
    $(chartName).html(
      '<div class=\'alert alert-danger\'>' +
      '<p><i class=\'fa fa-exclamation-triangle\'></i> We couldn\'t get anything from destne.' +
      ' Try again by reloading <kbd><i class=\'fa fa-refresh\'></i></kbd> on the top right. </p>' +
      '</div>');
  });
}

function drawAvgPacketChart(chartName, columnColors) {
  $.ajax({
    type: 'GET',
    url: '/api/v1/netflow/getAvgPacketSizeByAppId',
    dataType: 'json'
  }).done(function(json) {
    $(chartName).empty();
    var	avgPacketSize = ['avgPacketSize'];
    var appname = ['appname'];

    for(var i = 0; i < json.length; i++) {
      avgPacketSize[i + 1] = json[i].avgPacketSize;
      //Truncate names if too long
      if(json[i].appname.length > 16) {
        json[i].appname = json[i].appname.substring(0, 16);
      }
      appname[i + 1] = json[i].appname;
    }

    c3.generate({
      bindto: chartName,
      size: {
        height: 300,
        width: 420
      },
      data: {
        x: 'appname',
        columns: [
          appname,
          avgPacketSize
        ],
        type:'bar'
      },
      axis: {
        x: {
          type: 'category',
          categories: [appname],
          tick: {
            rotate: -35,
            multiline: false
          },

          height: 60
        },
        y: {
          label: {
            text: 'Bytes',
            position: 'outer-top'
          }
        }
      },
      legend: {
        show: false
      }
    });

    setColumnBarColors(columnColors, chartName);

    //Color turns to original when window is resized so the fix
    $(window).resize(function() {
      setColumnBarColors(columnColors, chartName);
    });
  }).fail(function() {
    $(chartName).empty();
    //Upon failure replace the statistics with an error
    $(chartName).html(
      '<div class=\'alert alert-danger\'>' +
      '<p><i class=\'fa fa-exclamation-triangle\'></i> We couldn\'t get anything from destne.' +
      ' Try again by reloading <kbd><i class=\'fa fa-refresh\'></i></kbd> on the top right. </p>' +
      '</div>');
  });
}

function drawSummaryChart(chartName, urlName, columnColors) {
  $.ajax({
    type: 'GET',
    url: urlName,
    dataType: 'json'
  }).done(function(json) {
    $(chartName).empty();
    var	sumcount = ['sumcount'];
    var appname = ['appname'];
    for(var i = 0; i < 15; i++) {
      sumcount[i + 1] = Math.log(parseInt(json[i].sumcount, 10)) / Math.LN10;
      //Truncate names if too long
      if(json[i].appname.length > 16) {
        json[i].appname = json[i].appname.substring(0, 16);
      }
      appname[i + 1] = json[i].appname;
    }

    c3.generate({
      bindto: chartName,
      size: {
        height: 300,
        width: 420
      },
      data: {
        x: 'appname',
        columns: [
          appname,
          sumcount
        ],
        type:'bar'
      },
      axis: {
        x: {
          type: 'category',
          categories: [appname],
          tick: {
            rotate: -35,
            multiline: false
          },
          height: 60
        },
        y: {
          label: {
            text: 'Bytes',
            position: 'outer-top'
          },
          tick: {
            format: function(sumcount) {
              return Math.pow(10, sumcount).toFixed(0);
            }
          }
        }
      },
      legend: {
        show: false
      }
    });

    setColumnBarColors(columnColors, chartName);
    //Color turns to original when window is resized so the fix
    $(window).resize(function() {
      setColumnBarColors(columnColors, chartName);
    });
  }).fail(function() {
    $(chartName).empty();
    //Upon failure replace the statistics with an error
    $(chartName).html(
      '<div class=\'alert alert-danger\'>' +
      '<p><i class=\'fa fa-exclamation-triangle\'></i> We couldn\'t get anything from destne.' +
      ' Try again by reloading <kbd><i class=\'fa fa-refresh\'></i></kbd> on the top right. </p>' +
      '</div>');
  });
}

function drawTopTalkersChart(chartName, urlName, columnColors) {
  $.ajax({
    type: 'GET',
    url: urlName,
    dataType: 'json'
  }).done(function(json) {
    $(chartName).empty();
    var	HostIP = ['HostIP'];
    var totalBytes = ['TotalBytes'];
    for(var i = 0; i < json.length; i++) {
      totalBytes[i + 1] = Math.log(parseInt(json[i].TotalBytes, 10)) / Math.LN10;
      HostIP[i + 1] = json[i].HostIP;
    }

    c3.generate({
      bindto: chartName,
      size: {
        height: 300,
        width: 420
      },
      data: {
        x: 'HostIP',
        columns: [
          HostIP,
          totalBytes
        ],
        type:'bar'
      },
      axis: {
        x: {
          type: 'category',
          categories: [HostIP],
          tick: {
            rotate: -35,
            multiline: false
          },
          height: 60
        },
        y: {
          label: {
            text: 'Bytes',
            position: 'outer-top'
          },
          tick: {
            format: function(d) {
              return Math.pow(10, d).toFixed(0);
            }
          }
        }
      },
      legend: {
        show: false
      }
    });
    setColumnBarColors(columnColors, chartName);
    //Color turns to original when window is resized so the fix
    $(window).resize(function() {
      setColumnBarColors(columnColors, chartName);
    });
  }).fail(function() {
    $(chartName).empty();
    //Upon failure replace the statistics with an error
    $(chartName).html(
      '<div class=\'alert alert-danger\'>' +
      '<p><i class=\'fa fa-exclamation-triangle\'></i> We couldn\'t get anything from destne.' +
      ' Try again by reloading <kbd><i class=\'fa fa-refresh\'></i></kbd> on the top right. </p>' +
      '</div>');
  });
}

function drawBPHChart(chartName, urlName, byteType) {
  $.ajax({
    type: 'GET',
    url: urlName,
    dataType: 'json'
  }).done(function(json) {
    $(chartName).empty();
    var	timeOfDay = ['TimeofDay'];
    var totalEgressBytes = [byteType];
    for(var i = 0; i < json.length; i++) {
      totalEgressBytes[i + 1] = Math.log(parseInt(json[i][byteType], 10)) / Math.LN10;
      timeOfDay[i + 1] = json[i].TimeofDay;
    }

    c3.generate({
      bindto: chartName,
      size: {
        height: 300,
        width: 420
      },
      data: {
        x: 'TimeofDay',
        xFormat: '%Y-%m-%dT%H:%M:%S.%LZ',
        columns: [
          timeOfDay,
          totalEgressBytes
        ],
        type:'line'
      },
      axis: {
        x: {
          type: 'timeseries',
          label: {
            text: 'Time',
            position: 'outer-right'
          },
          tick: {
            fit: false,
            culling: {
              max: 8
            },
            rotate: -35,
            multiline: false
          },
          padding: {
            left: 0,
            right: 0
          },
          height: 60
        },
        y: {
          label: {
            text: 'Bytes',
            position: 'outer-top'
          },
          tick: {
            format: function(d) {
              return Math.pow(10, d).toFixed(0);
            }
          }
        }
      },
      legend: {
        show: false
      }
    });
  }).fail(function() {
    $(chartName).empty();
    //Upon failure replace the statistics with an error
    $(chartName).html(
      '<div class=\'alert alert-danger\'>' +
      '<p><i class=\'fa fa-exclamation-triangle\'></i> We couldn\'t get anything from destne.' +
      ' Try again by reloading <kbd><i class=\'fa fa-refresh\'></i></kbd> on the top right. </p>' +
      '</div>');
  });
}

function setColumnBarColors(colors, chartContainer) {
  $(chartContainer + ' .c3-chart-bars .c3-shape').each(function(index) {
    this.style.cssText += 'fill: ' + colors[index] + ' !important; stroke: ' + colors[index] + '; !important';
  });

  $(chartContainer + ' .c3-chart-texts .c3-text').each(function(index) {
    this.style.cssText += 'fill: ' + colors[index] + ' !important;';
  });
}
