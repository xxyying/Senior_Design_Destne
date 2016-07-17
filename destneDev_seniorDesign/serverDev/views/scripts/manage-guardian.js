$(function() {

  populateUser();

  //ADD USER FORM Functions
  //Validation
  $('#changeGuardianForm').validate({
    onkeyup: false,
    onclick: false,
    onfocusout: false,
    rules: {
      guardianUsername: {
        maxlength: 100
      },
      guardianPassword: {
        rangelength: [10, 128]
      },
      guardianPassword2: {
        equalTo: '#guardianPassword'
      },
      guardianEmail: {
        email: true,
        maxlength: 100
      },
      guardianFirstname: {
        maxlength: 45,
        skip_or_fill_minimum: [2, '.nameGroup'],
        nowhitespace: true
      },
      guardianLastname: {
        maxlength: 45,
        skip_or_fill_minimum: [2, '.nameGroup'],
        nowhitespace: true
      }
    },
    messages: {
      guardianFirstname: {
        skip_or_fill_minimum: 'Please fill out both the first and last name fields or leave blank'
      },
      guardianLastname: {
        skip_or_fill_minimum: 'Please fill out both the first and last name fields or leave blank'
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
  $('#guardianReset').click(function() {
    $('#changeGuardianForm .form-group').removeClass('has-success has-error');
    $('#changeGuardianForm .help-block').remove();
    $('#changeGuardianInfo').empty();
    $('#changeGuardianInfo').hide();
  });

  //Form Submission
  $('#changeGuardianForm').submit(function() {
    ajaxSubmitForm($(this));
    //cancel the normal submission.
    return false;
  });
});

function populateUser() {
  //GET request
  $.ajax({
    type: 'GET',
    url: '/api/v1/admin/user/' + $('#trgtUserId').text(),
    dataType: 'json'
  }).done(function(json) {
    //No Users found display error and remove other elements from page
    if(json.hasOwnProperty('error')) {
      $('#changeGuardian').hide();
      $('#changeGuardianInfo').addClass('alert-danger').removeClass('alert-success');
      $('#changeGuardianInfo').html('');
      $('#changeGuardianInfo').show();
      $('#changeGuardianInfo').append('<h4><i class="fa fa-exclamation-triangle"></i> <b>Error</b></h4>');
      $('#changeGuardianInfo').append(
        '<p> We couldn\'t get anything from destne.' +
        ' Try loading again by reloading <kbd><i class=\'fa fa-refresh\'></i></kbd> on the top right. </p>');
    }
    else {
      var i = 0;

      //Update the username
      $('#currentUsername').text('Current Username:  ' + json.username);
      if(json.firstname !== null) {
        $('#currentFirstname').text('Current First Name: ' + json.firstname);
      }
      else {
        $('#currentFirstname').text('Current First Name: Not Provided');
      }
      if(json.lastname !== null) {
        $('#currentLastname').text('Current Last Name: ' + json.lastname);
      }
      else {
        $('#currentLastname').text('Current Last Name: Not Provided');
      }
      if(json.email !== null) {
        $('#currentEmail').text('Current Email: ' + json.email);
      }
      else {
        $('#currentEmail').text('Current Email: Not Provided');
      }

      //Update the available roles
      if(json.role.length === 0) {
        $('#assignedRoles').append('<p>No Roles Assigned to User</p>');
      }
      else {
        for(i = 0; i < json.role.length; i++) {
          $('#assignedRoles').append(
            '<div class="checkbox"><label><input type="checkbox" name="' + json.role[i] +
             '" checked="checked" value="">' + json.role[i] + '</label>'
          );
        }
      }

      //Update the unassigned roles
      if(json.unassignedRole.length === 0) {
        $('#unassignedRoles').append('<p>No Unassigned Roles</p>');
      }
      else {
        for(i = 0; i < json.unassignedRole.length; i++) {
          $('#unassignedRoles').append(
            '<div class="checkbox"><label><input type="checkbox" name="' + json.unassignedRole[i] +
             '" value="">' + json.unassignedRole[i] + '</label>'
          );
        }
      }
    }
  }).fail(function(xhr, status, errorThrown) {
    alert('Sorry there was a problem!');
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

    //Manipulate the form to fit the AJAX Request
    var values = {};
    if($('#guardianUsername').val() !== '') {
      values.username = $('#guardianUsername').val();
    }
    if($('#guardianPassword').val() !== '') {
      values.password = $('#guardianPassword').val();
    }
    if($('#guardianFirstname').val() !== '') {
      values.firstname = $('#guardianFirstname').val();
    }
    if($('#guardianLastname').val() !== '') {
      values.lastname = $('#guardianLastname').val();
    }
    if($('#guardianEmail').val() !== '') {
      values.email = $('#guardianEmail').val();
    }
    $('#assignedRoles input:checkbox:not(:checked)').each(function() {
      if(!values.hasOwnProperty('deleteRole')) {
        values.deleteRole = [];
      }
      values.deleteRole.push($(this).attr('name'));
    });
    $('#unassignedRoles input:checkbox:checked').each(function() {
      if(!values.hasOwnProperty('addRole')) {
        values.addRole = [];
      }
      values.addRole.push($(this).attr('name'));
    });

    //PUT request
    $.ajax({
      type: 'PUT',
      url: '/api/v1/admin/user/' + $('#trgtUserId').text(),
      data: JSON.stringify(values),
      contentType: 'application/json',
      dataType: 'json'
    }).done(function(json) {
      removeLoading();
      //If there was an error
      if(json.hasOwnProperty('error')) {
        $('#changeGuardianInfo').addClass('alert-danger').removeClass('alert-success');
        $('#changeGuardianInfo').html('');
        $('#changeGuardianInfo').show();
        $('#changeGuardianInfo').append('<h4><i class="fa fa-exclamation-triangle"></i> <b>Error</b></h4>');
        if($.isArray(json.error)) {
          for(var i = 0; i < json.error.length; i++) {
            $('#changeGuardianInfo').append('<p>- ' + json.error[i] + '</span>');
          }
        }
        else {
          $('#changeGuardianInfo').append('<p>- ' + json.error + '</p>');
        }
      }
      else {
        //Display Success
        $('#changeGuardianInfo').addClass('alert-success').removeClass('alert-danger');
        $('#changeGuardianInfo').html('');
        $('#changeGuardianInfo').show();
        $('#changeGuardianInfo').append(
          '<h4><i class="fa fa-check-circle"></i> <b>Success</b></h4>' +
          '<p>' + json.message + '</p>'
        );
        //Let the user see success then reload the page after 1 second
        setTimeout(location.reload(), 1500);
      }
    }).fail(function(xhr, status, errorThrown) {
      removeLoading();
      alert('Sorry there was a problem!');
      console.log('Error: ' + errorThrown);
      console.log('Status: ' + status);
    });
  }
}

function removeLoading() {
  $('#guardianSave').prop('disabled', false).html('<i class="fa fa-floppy-o"></i> Save Changes');
}

function formLoading() {
  $('#guardianSave').prop('disabled', true).html('<i class="fa fa-spinner fa-pulse"></i>');
}
