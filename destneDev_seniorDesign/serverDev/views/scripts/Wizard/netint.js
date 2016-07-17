/* globals c3, d3 */
$(function() {
  netHeartbeat();
  $('#refresh-netheartbeat').click(function() {
    netHeartbeat();
  });
  $('#networkInterfaceReset').click(function() {
    $('#netConfigForm input[type=text]').prop('disabled', false);
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
      $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
    },
    unhighlight: function(element) {
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

function removeLoading() {
  $('#networkInterfaceSave').prop('disabled', false).html('<i class="fa fa-floppy-o"></i> Save Network Configuration');
}

function formLoading() {
  $('#networkInterfaceSave').prop('disabled', true).html('<i class="fa fa-spinner fa-pulse"></i>');
}
