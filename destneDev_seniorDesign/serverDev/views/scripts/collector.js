$(function() {
  populateCollector();

  //Start or stop the collector based on the status
  $('#collectorStart').click(function() {
    if($('#collectorStatus').text() === 'Running') {
      //GET request
      $.ajax({
        type: 'GET',
        url: '/api/v1/admin/collector/stop',
        dataType: 'json'
      }).done(function(json) {
        //Error in stopping the process
        if(json.hasOwnProperty('error')) {
          $('#collectorInfo').show();
          $('#collectorInfo').removeClass('alert-success').addClass('alert-danger');
          $('#collectorInfo').html('<i class="fa fa-exclamation-triangle"></i> ' + json.error);
        }
        //Process was stopped successfully
        else {
          $('#collectorInfo').show();
          $('#collectorInfo').addClass('alert-success').removeClass('alert-danger');
          $('#collectorInfo').html('<i class="fa fa-check"></i> ' + json.message);

          $('#collectorStart').addClass('btn-success').removeClass('btn-danger');
          $('#collectorStart').html('<i class="fa fa-play"></i> Start Collector</a>');
          $('#collectorStart').show();
          $('#collectorStatus').text('Stopped');
        }
      }).fail(function(xhr, status, errorThrown) {
        //Upon failure replace pop up an error
        alert('Something went wrong');
        console.log('Error: ' + errorThrown);
        console.log('Status: ' + status);
      });
    }
    else if($('#collectorStatus').text() === 'Stopped') {
      //GET request
      $.ajax({
        type: 'GET',
        url: '/api/v1/admin/collector/start',
        dataType: 'json'
      }).done(function(json) {
        //Error in stopping the process
        if(json.hasOwnProperty('error')) {
          $('#collectorInfo').show();
          $('#collectorInfo').removeClass('alert-success').addClass('alert-danger');
          $('#collectorInfo').html('<i class="fa fa-exclamation-triangle"></i> ' + json.error);
        }
        //Process was started successfully
        else {
          $('#collectorInfo').show();
          $('#collectorInfo').addClass('alert-success').removeClass('alert-danger');
          $('#collectorInfo').html('<i class="fa fa-check"></i> ' + json.message);

          $('#collectorStart').addClass('btn-danger').removeClass('btn-success');
          $('#collectorStart').html('<i class="fa fa-stop"></i> Stop Collector</a>');
          $('#collectorStart').show();
          $('#collectorStatus').text('Running');
        }
      }).fail(function(xhr, status, errorThrown) {
        //Upon failure replace pop up an error
        alert('Something went wrong');
        console.log('Error: ' + errorThrown);
        console.log('Status: ' + status);
      });
    }
  });

  //Collector Form Functions
  //Validation
  $('#collectorConfigForm').validate({
    onkeyup: false,
    onclick: false,
    onfocusout: false,
    rules: {
      collectorIP: {
        ipv4: true,
        require_from_group: [1, '.collectorGroup']
      },
      collectorPort: {
        digits: true,
        max: 65535,
        require_from_group: [1, '.collectorGroup']
      },
      sqlHost: {
        ipv4: true,
        require_from_group: [1, '.collectorGroup']
      },
      sqlDB: {
        require_from_group: [1, '.collectorGroup']
      },
      sqlUser: {
        require_from_group: [1, '.collectorGroup']
      },
      sqlPassword: {
        require_from_group: [1, '.collectorGroup']
      }
    },
    highlight: function(element) {
      $(element).closest('.form-group').addClass('has-error');
    },
    unhighlight: function(element) {
      $(element).closest('.form-group').removeClass('has-error');
    },
    errorElement: 'span',
    errorClass: 'help-block',
    errorPlacement: function(error, element) {
      error.insertAfter(element);
    }
  });

  //Form Reset
  $('#collectorReset').click(function() {
    $('#collectorConfigForm .form-group').removeClass('has-success has-error');
    $('#collectorConfigForm .help-block').remove();
    $('#collectorConfigInfo').empty();
    $('#collectorConfigInfo').hide();
  });

  //Form Submission
  $('#collectorConfigForm').submit(function() {
    ajaxSubmitForm($(this));
    //cancel the normal submission.
    return false;
  });
});

/*
This function gets information about the collector and updates DOM elements
based on the results
*/
function populateCollector() {
  //GET request
  $.ajax({
    type: 'GET',
    url: '/api/v1/admin/collector/config',
    dataType: 'json'
  }).done(function(json) {
    //No configuration file found or no parameters found in file
    if(json.hasOwnProperty('error')) {
      $('#collectorInfo').html('<i class="fa fa-exclamation-triangle"></i> ' + json.error);
      $('#collectorInfo').removeClass('alert-success').addClass('alert-danger');
      $('#collectorInfo').show();
      $('#collectorConfig').hide();
      $('#collectorStart').hide();
    }
    //Some parameters were found
    else {
      if(json.hasOwnProperty('collectorIP')) {
        $('#configIP').text(json.collectorIP);
      }
      else {
        $('#configIP').text('No IP found in file');
      }
      if(json.hasOwnProperty('collectorPort')) {
        $('#configPort').text(json.collectorPort);
      }
      else {
        $('#configPort').text('No Port found in file');
      }
      if(json.hasOwnProperty('sqlDB')) {
        $('#configDB').text(json.sqlDB);
      }
      else {
        $('#configDB').text('No DB found in file');
      }
      if(json.hasOwnProperty('status')) {
        $('#collectorStatus').text(json.status);
        if(json.status === 'Running') {
          $('#collectorStart').addClass('btn-danger').removeClass('btn-success');
          $('#collectorStart').html('<i class="fa fa-stop"></i> Stop Collector</a>');
          $('#collectorStart').show();
        }
        else if(json.status === 'Stopped') {
          $('#collectorStart').addClass('btn-success').removeClass('btn-danger');
          $('#collectorStart').html('<i class="fa fa-play"></i> Start Collector</a>');
          $('#collectorStart').show();
        }
      }
      else {
        $('#collectorStatus').text('ERROR');
      }
    }
  }).fail(function(xhr, status, errorThrown) {
    //Upon failure replace the info with an error
    $('#collector_status').children().replaceWith(
      '<div class=\'alert alert-danger\'>' +
      '<p><i class=\'fa fa-exclamation-triangle\'></i> We couldn\'t get anything from destne.' +
      ' Try loading again by reloading <kbd><i class=\'fa fa-refresh\'></i></kbd> on the top right. </p>' +
      '</div>');

    console.log('Error: ' + errorThrown);
    console.log('Status: ' + status);
  });
}

/*
This function submits the new user via an AJAX call. If everything is
valid success is returned. Otherwise errors will be returned
*/
function ajaxSubmitForm($form) {
  if($form.valid()) {
    formLoading();

    //Remove empty fields from query
    var formData = $('#collectorConfigForm :input').filter(function(index, element) {
      return $(element).val() !== '';
    }).serialize();
    //PUT request
    $.ajax({
      type: 'PUT',
      url: '/api/v1/admin/collector/config',
      data: formData,
      dataType: 'json'
    }).done(function(json) {
      removeLoading();
      //Problem with parameters or other error in configuration update
      if(json.hasOwnProperty('error')) {
        $('#collectorConfigInfo').html('');
        $('#collectorConfigInfo').append('<h4><i class="fa fa-exclamation-triangle"></i> <b>Error</b></h4>');
        for(var i = 0; i < json.error.length; i++) {
          var keyname = Object.keys(json.error[i]);
          console.log(json.error[i]);
          $('#collectorConfigInfo').append('<p>' + keyname + '- ' + json.error[i][keyname] + '</span>');
        }
        $('#collectorConfigInfo').removeClass('alert-success').addClass('alert-danger');
        $('#collectorConfigInfo').show();
      }
      //No errors were found
      else {
        $('#collectorConfigInfo').html('<i class="fa fa-check"></i> ' + json.message);
        $('#collectorConfigInfo').addClass('alert-success').removeClass('alert-danger');
        $('#collectorConfigInfo').show();
        populateCollector();
      }
    }).fail(function(xhr, status, errorThrown) {
      removeLoading();
      //Upon failure replace the info with an error
      $('#configure_collector').children().replaceWith(
        '<div class=\'alert alert-danger\'>' +
        '<p><i class=\'fa fa-exclamation-triangle\'></i> We couldn\'t get anything from destne.' +
        ' Try loading again by reloading <kbd><i class=\'fa fa-refresh\'></i></kbd> on the top right. </p>' +
        '</div>');

      console.log('Error: ' + errorThrown);
      console.log('Status: ' + status);
    });
  }
}

function removeLoading() {
  $('#collectorSave').prop('disabled', false).html('<i class="fa fa-floppy-o"></i> Save Changes');
}

function formLoading() {
  $('#collectorSave').prop('disabled', true).html('<i class="fa fa-spinner fa-pulse"></i>');
}
