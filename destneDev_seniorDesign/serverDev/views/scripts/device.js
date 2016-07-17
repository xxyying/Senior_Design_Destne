/* globals c3, d3 */
$(function() {
  heartbeat();
  netHeartbeat();

  //Button press functions
  $('#refresh-heartbeat').click(function() {
    heartbeat();
  });
  $('#refresh-netheartbeat').click(function() {
    netHeartbeat();
  });
  $('#networkInterfaceReset').click(function() {
    $('netConfigForm input[type=text]').val('');
    $('#netConfigForm input[type=text]').prop('disabled', false);
    $('#netConfigForm .form-control-feedback').removeClass('glyphicon-remove glyphicon-ok');
    $('#netConfigForm .form-group').removeClass('has-success has-error');
    $('#netConfigForm .help-block').remove();
    $('#netConfigWarning').empty();
    $('#netConfigWarning').hide();
  });
  $('#networkInterfaceDhcpStatus').change(function() {
    if(this.checked) {
      $('#netConfigForm input[type=text]').prop('disabled', true);
    }
    else {
      $('#netConfigForm input[type=text]').prop('disabled', false);
    }
  });

  $('#restartButton').click(function() {
    $.ajax({
      type: 'GET',
      url: '/api/v1/admin/device/restart',
      dataType: 'json'
    }).done(function(json) {
      $('#powerInfo').addClass('alert-warning').removeClass('alert-danger');
      $('#powerInfo').empty();
      $('#powerInfo').show();
      $('#powerInfo').append(
        '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span> ' +
        json.message
      );
    }).fail(function(xhr, status, errorThrown) {
      console.log('Error: ' + errorThrown);
      console.log('Status: ' + status);

      $('#powerInfo').addClass('alert-danger').removeClass('alert-warning');
      $('#powerInfo').empty();
      $('#powerInfo').show();
      $('#powerInfo').append(
        '<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span> ' +
        'Something went wrong...'
      );
    });
  });
  $('#offButton').click(function() {
    $.ajax({
      type: 'GET',
      url: '/api/v1/admin/device/shutdown',
      dataType: 'json'
    }).done(function(json) {
      $('#powerInfo').addClass('alert-warning').removeClass('alert-danger');
      $('#powerInfo').empty();
      $('#powerInfo').show();
      $('#powerInfo').append(
        '<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span> ' +
        json.message
      );
    }).fail(function(xhr, status, errorThrown) {
      console.log('Error: ' + errorThrown);
      console.log('Status: ' + status);

      $('#powerInfo').addClass('alert-danger').removeClass('alert-warning');
      $('#powerInfo').empty();
      $('#powerInfo').show();
      $('#powerInfo').append(
        '<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span> ' +
        'Something went wrong...'
      );
    });
  });

  //Login Form
  //----------------------------------------------
  //Validation
  $('#netConfigForm').validate({
    onkeyup: false,
    onclick: false,
    onfocusout: false,
    rules: {
      ipaddress: {
        required: true,
        ipv4: true
      },
      netmask: {
        required: true,
        ipv4: true
      },
      network: {
        required: true,
        ipv4: true
      },
      gateway: {
        required: true,
        ipv4: true
      },
      nameserver1: {
        required: true,
        ipv4: true
      },
      nameserver2: {
        required: true,
        ipv4: true
      }
    },
    message: {
      ipaddress: 'Please provide an IP address',
      netmask: 'Please provide the netmask for the network',
      network: 'Please provide the network address',
      gateway: 'Please provide the gateway for the network',
      nameserver1: 'Please provide a primary DNS server address',
      nameserver2: 'Please provide an alternate DNS server address'
    },
    highlight: function(element) {
      $(element).parent().find('.form-control-feedback').removeClass('glyphicon-ok').addClass('glyphicon-remove');
      $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
    },
    unhighlight: function(element) {
      $(element).parent().find('.form-control-feedback').removeClass('glyphicon-remove').addClass('glyphicon-ok');
      $(element).closest('.form-group').removeClass('has-error').addClass('has-success');
    },
    errorElement: 'span',
    errorClass: 'help-block',
    errorPlacement: function(error, element) {
      error.insertAfter(element);
    }
  });

  //Form Submission
  $('#netConfigForm').submit(function() {
    formLoading();
    ajaxSubmitForm($(this));
    //cancel the normal submission.
    return false;
  });
});

/*
This function submits the network form via an AJAX Call. The form
has already been validated to only contain valid IPv4 addresses
*/
function ajaxSubmitForm($form) {
  if($form.valid()) {
    //formLoading($form);
    var netState;
    //Add network state to the form (dhcp or static)
    if($('#networkInterfaceDhcpStatus').is(':checked')) {
      netState = '&state=dhcp';
    }
    else {
      netState = '&state=static';
    }
    //PUT request
    $.ajax({
      type: 'PUT',
      url: '/api/v1/admin/device/network',
      data: $form.serialize() + netState,
      dataType: 'json'
    }).done(function(json) {
      removeLoading();
      //If there was an error
      if(json.hasOwnProperty('error')) {
        $('#netConfigWarning').addClass('alert-danger').removeClass('alert-success');
        $('#netConfigWarning').empty();
        $('#netConfigWarning').show();
        $('#netConfigWarning').append(
          '<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span> ' +
          json.error
        );
      }
      else {
        $('#netConfigWarning').addClass('alert-success').removeClass('alert-danger');
        $('#netConfigWarning').empty();
        $('#netConfigWarning').show();
        $('#netConfigWarning').append(
          '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span> ' +
          json.message
        );
      }
    }).fail(function(xhr, status, errorThrown) {
      removeLoading();
      alert('Sorry there was a problem!');
      console.log('Error: ' + errorThrown);
      console.log('Status: ' + status);
    });
  }
}

/*
This function gets the statistics about the device and populates the
client page as well as generating a few graphs. If their is a problem an error
screen is displayed instead.
*/
function heartbeat() {
  $.ajax({
    type: 'GET',
    url: '/api/v1/admin/device/devStats',
    dataType: 'json'
  }).done(function(json) {
    $('#cpuAvgLoadMin1').text(json.cpuLoad[0]);
    $('#cpuAvgLoadMin5').text(json.cpuLoad[1]);
    $('#cpuAvgLoadMin15').text(json.cpuLoad[2]);

    var freeMem = parseInt(json.freeMemory, 10);
    var usedMem = parseInt(json.usedMemory, 10);
    var totalMem = parseInt(json.totalMemory, 10);

    //Error checking to make sure a number was returned
    if(isNaN(freeMem) || isNaN(usedMem) || isNaN(totalMem)) {
      $('#memoryFree').text('Error');
      $('#memoryUsed').text('Error');
      $('#memoryTotal').text('Error');
    }
    else {
      $('#memoryFree').text(formatBytes(freeMem, 4));
      $('#memoryUsed').text(formatBytes(usedMem, 4));
      $('#memoryTotal').text(formatBytes(totalMem, 4));
    }
    //Draw Chart
    drawMemoryChart(freeMem, usedMem);

    var freeStorage = parseInt(json.freeStorage, 10);
    var usedStorage = parseInt(json.usedStorage, 10);
    var totalStorage = parseInt(json.totalStorage, 10);

    //Error checking to make sure a number was returned
    if(isNaN(freeStorage) || isNaN(usedStorage) || isNaN(totalStorage)) {
      $('#storageAvail').text('Error');
      $('#storageUsed').text('Error');
      $('#storageSize').text('Error');
    }
    else {
      //Convert storage variables back to bytes
      freeStorage = freeStorage * 1024 * 1024;
      usedStorage = usedStorage * 1024 * 1024;
      totalStorage = totalStorage * 1024 * 1024;

      $('#storageAvail').text(formatBytes(freeStorage, 4));
      $('#storageUsed').text(formatBytes(usedStorage, 4));
      $('#storageSize').text(formatBytes(totalStorage, 4));
    }
    //Draw Chart
    drawStorageChart(freeStorage, usedStorage);

    $('#systemHostname').text(json.hostname);
    $('#systemKernel').text(json.kernel);
    $('#systemOs').text(json.os);
    $('#systemPhpVersion').text(json.nodeVersion);
    $('#systemUptime').text(secondsToStr(json.uptime));
  }).fail(function(xhr, status, errorThrown) {
    console.log('Error: ' + errorThrown);
    console.log('Status: ' + status);

    //Upon failure replace the statistics with an error
    $('#deviceStatus').children().replaceWith(
      '<div class=\'alert alert-danger\'>' +
      '<p><i class=\'fa fa-exclamation-triangle\'></i> We couldn\'t get anything from destne.' +
      ' Try loading again by reloading <kbd><i class=\'fa fa-refresh\'></i></kbd> on the top right. </p>' +
      '</div>');
  });
}

/*
This function gets the statistics about the network and displays them in the
appropriate fields.
*/
function netHeartbeat() {
  $.ajax({
    type: 'GET',
    url: '/api/v1/admin/device/network',
    dataType: 'json'
  }).done(function(json) {
    if(json.networkType !== 'static') {
      $('#dhcpWarning').show();
    }

    $('#netType').text(json.networkType);
    $('#ipAddress').text(json.ip_address);
    $('#netmask').text(json.netmask);
    $('#gateway').text(json.gateway_ip);

    if(json.hasOwnProperty('dnsServers')) {
      $('#dnsrow').children().show();

      if(0 in json.dnsServers && json.dnsServers[0].hasOwnProperty('server')) {
        $('#dnsServer').text(json.dnsServers[0].server);
      }
      else {
        $('#dnsServer').text('Not Configured');
      }
      if(1 in json.dnsServers && json.dnsServers[1].hasOwnProperty('server')) {
        $('#altdnsServer').text(json.dnsServers[1].server);
      }
      else {
        $('#altdnsServer').text('Not Configured');
      }
    }
    else {
      $('#dnsrow').children().hide();
    }
  }).fail(function(xhr, status, errorThrown) {
    console.log('Error: ' + errorThrown);
    console.log('Status: ' + status);

    //Upon failure replace the statistics with an error
    $('#networkInterfaceStatus').children().replaceWith(
      '<div class=\'alert alert-danger\'>' +
      '<p><i class=\'fa fa-exclamation-triangle\'></i> We couldn\'t get anything from destne.' +
      ' Try loading again by reloading <kbd><i class=\'fa fa-refresh\'></i></kbd> on the top right. </p>' +
      '</div>');
  });
}

/*
This function draws a chart based on retrieved storage data
*/
function drawStorageChart(freeStorage, usedStorage) {
  $('#storageChart').empty();

  if(isNaN(freeStorage) || isNaN(usedStorage)) {  //Don't draw the chart
    return;
  }

  var chart = c3.generate({
    bindto: '#storageChart',
    size: {
      width: 120,
      height: 120
    },
    interaction: {
      enabled: false
    },
    data: {
      columns: [
        ['Used Storage', usedStorage],
        ['Free Storage', freeStorage]
      ],
      type: 'donut',
      colors: {
        'Free Storage': '#c2beba',
        'Used Storage': '#63a7df'
      },
      order: null
    },
    legend: {
      show: false
    },
    donut: {
      label: {
        show: false
      },
      title: Math.round((usedStorage / (freeStorage + usedStorage)) * 100),
      width: 11,
      expand: false
    }
  });

  //Add the percentage as a small superscript
  d3.select('.c3-chart-arcs')
  .append('text')
  .text('%')
  .attr('dy', '-0.5em')
  .attr('dx', '2em');

  //Add a dark circle to the center of chart
  d3.select('.c3-chart')
  .insert('circle', ':first-child')
  .attr('fill', '#1b1a1a')
  .attr('cx', chart.internal.width / 2)
  .attr('cy', chart.internal.height / 2 - chart.internal.margin.top)
  .attr('r', chart.internal.innerRadius);
}

/*
This function draws the chart of the current memory usage
*/
function drawMemoryChart(freeMemory, usedMemory) {
  $('#memoryChart').empty();
  d3.selectAll('svg > *').remove();

  if(isNaN(freeMemory) || isNaN(usedMemory)) {  //Don't draw the chart
    return;
  }

  var chart = c3.generate({
    bindto: '#memoryChart',
    size: {
      width: 120,
      height: 120
    },
    interaction: {
      enabled: false
    },
    data: {
      columns: [
        ['Used Memory', usedMemory],
        ['Free Memory', freeMemory]
      ],
      type: 'donut',
      colors: {
        'Free Memory': '#c2beba',
        'Used Memory': '#d04633'
      },
      order: null
    },
    legend: {
      show: false
    },
    donut: {
      label: {
        show: false
      },
      title: Math.round((usedMemory / (freeMemory + usedMemory)) * 100),
      width: 11,
      expand: false
    }
  });

  //Add the percentage as a small superscript
  d3.select('.c3-chart-arcs')
    .append('text')
    .text('%')
    .attr('dy', '-0.5em')
    .attr('dx', '2em');

  //Add a dark circle to the center of chart
  d3.select('.c3-chart')
    .insert('circle', ':first-child')
    .attr('fill', '#1b1a1a')
    .attr('cx', chart.internal.width / 2)
    .attr('cy', chart.internal.height / 2 - chart.internal.margin.top)
    .attr('r', chart.internal.innerRadius);
}

function removeLoading() {
  $('#networkInterfaceSave').prop('disabled', false).html('<i class="fa fa-floppy-o"></i> Save Network Configuration');
}

function formLoading() {
  $('#networkInterfaceSave').prop('disabled', true).html('<i class="fa fa-spinner fa-pulse"></i>');
}

/*
This function takes a number of bytes and the corresponding power
(i.e. 0 is bytes, 1 is KB, 2 is MB, etc.) and converts it to a more reasonable number
Note the range is from 0 Bytes to YB
*/
function formatBytes(bytes, decimals) {
  if(bytes === 0) {
    return '0 Bytes';
  }
  var k = 1024;
  var dm = decimals + 1 || 3;
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  var i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toPrecision(dm) + ' ' + sizes[i];
}

/*
This function takes seconds and converts it to a more usable format up to years
*/
function secondsToStr(seconds) {
  var retString = '';
  var retCounter = 0; //Used to determine how many types to return

  function numberEnding(number) {
    return (number > 1) ? 's' : '';
  }
  var years = Math.floor(seconds / 31536000);
  if(years) {
    retString = years + ' year' + numberEnding(years) + ' ';
    retCounter++;
  }
  var days = Math.floor((seconds %= 31536000) / 86400);
  if(days) {
    retString += days + ' day' + numberEnding(days);
    if(retCounter === 1) {
      return retString;
    }
    else {
      retCounter++;
    }
  }
  var hours = Math.floor((seconds %= 86400) / 3600);
  if(hours) {
    retString += hours + ' hour' + numberEnding(hours) + ' ';
    if(retCounter === 1) {
      return retString;
    }
    else {
      retCounter++;
    }
  }
  var minutes = Math.floor((seconds %= 3600) / 60);
  if(minutes) {
    retString += minutes + ' minute' + numberEnding(minutes) + ' ';
    if(retCounter === 1) {
      return retString;
    }
    else {
      retCounter++;
    }
  }
  seconds = seconds % 60;
  if(seconds) {
    retString += seconds + ' second' + numberEnding(seconds);
    return retString;
  }
  if(retCounter === 1) {
    return retString;
  }
  else {
    return 'just now!'; //'just now' //or other string you like;
  }
}
