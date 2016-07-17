$(function() {
  populateUsers();

  var userId; //Stores the current target userId

  //Populate Delete Modal box with username to be deleted
  $(document).on('click', '.delete-guardian-modal', function() {
    var row = $(this).closest('tr');
    var username = row.find('.username').text();
    userId = row.find('.userId').text();
    console.log(userId);
    $('#delete-guardian-name').text(username);
  });

  //Deletes the user that was selected from the modal
  $('#delete-guardian-confirm').click(function() {
    //DELETE request
    $.ajax({
      type: 'DELETE',
      url: '/api/v1/admin/user/' + userId,
      dataType: 'json'
    }).done(function(json) {
      //No Users found with that userId
      if(json.hasOwnProperty('error')) {
        alert(json.message);
      }
      else {
        location.reload();
      }
    }).fail(function(xhr, status, errorThrown) {
      alert('Sorry there was a problem!');
      console.log('Error: ' + errorThrown);
      console.log('Status: ' + status);
    });
  });

  //ADD USER FORM Functions
  //Validation
  $('#addGuardianForm').validate({
    onkeyup: false,
    onclick: false,
    onfocusout: false,
    rules: {
      guardianUsername: {
        required: true,
        maxlength: 100
      },
      guardianPassword: {
        required: true,
        rangelength: [10, 128]
      },
      guardianPassword2: {
        required: true,
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

  //Form Reset
  $('#guardianReset').click(function() {
    $('#addGuardianForm .form-group').removeClass('has-success has-error');
    $('#addGuardianForm .help-block').remove();
    $('#addGuardianInfo').empty();
    $('#addGuardianInfo').hide();
  });

  //Form Submission
  $('#addGuardianForm').submit(function() {
    ajaxSubmitForm($(this));
    //cancel the normal submission.
    return false;
  });
});

function populateUsers() {
  //GET request
  $.ajax({
    type: 'GET',
    url: '/api/v1/admin/user',
    dataType: 'json'
  }).done(function(json) {
    //No Users found display error and remove other elemnts from page
    if(json.hasOwnProperty('error')) {
      $('#userAlert').show();
      $('#userTable').hide();
    }
    else {
      var tr; //Table builder element
      for (var i = 0; i < json.users.length; i++) {
        tr = $('<tr/>');
        tr.append('<td class="userId">' + json.users[i].userId + '</td>');
        tr.append('<td class="username">' + json.users[i].username + '</td>');

        //Check to see if their name is provided
        if(json.users[i].firstname !== null && json.users[i].lastname !== null) {
          tr.append('<td class="realname">' + json.users[i].firstname +
          ' ' + json.users[i].lastname + '</td>');
        }
        else {
          tr.append('<td class="realname"></td>');
        }

        //Check to see if their email is provided
        if(json.users[i].email !== null) {
          tr.append('<td class="email">' + json.users[i].email + '</td>');
        }
        else {
          tr.append('<td class="email"></td>');
        }

        //Check the amount of roles they have
        if(json.users[i].role.length > 0) {
          tr.append('<td>' + json.users[i].role + '</td>');
        }
        else {
          tr.append('<td></td>');
        }
        //Make sure user cannot delete themselves
        if(json.users[i].username !== $('#usrName').text()) {
          tr.append('<td><button type="button" class="btn btn-danger delete-guardian-modal" data-toggle="modal" data-target="#delete"><i class="fa fa-user-times"></i>	Delete </a></td>');
        }
        else {
          tr.append('<td></td>');
        }
        $('#userTable').append(tr);
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

    //POST request
    $.ajax({
      type: 'POST',
      url: '/api/v1/admin/user',
      data: JSON.stringify(values),
      contentType: 'application/json',
      dataType: 'json'
    }).done(function(json) {
      removeLoading();
      //If there was an error
      if(json.hasOwnProperty('error')) {
        $('#addGuardianInfo').addClass('alert-danger').removeClass('alert-success');
        $('#addGuardianInfo').html('');
        $('#addGuardianInfo').show();
        $('#addGuardianInfo').append('<h4><i class="fa fa-exclamation-triangle"></i> <b>Error</b></h4>');
        if($.isArray(json.error)) {
          for(var i = 0; i < json.error.length; i++) {
            $('#addGuardianInfo').append('<p>- ' + json.error[i] + '</span>');
          }
        }
        else {
          $('#addGuardianInfo').append('<p>- ' + json.error + '</p>');
        }
      }
      else {
        //Display Success
        $('#addGuardianInfo').addClass('alert-success').removeClass('alert-danger');
        $('#addGuardianInfo').html('');
        $('#addGuardianInfo').show();
        $('#addGuardianInfo').append(
          '<h4><i class="fa fa-check-circle"></i> <b>Success</b></h4>' +
          '<p>' + json.message + '</p>'
        );
        //Let the user see success then reload the page after 1 second
        setTimeout(location.reload(), 1000);
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
  $('#guardianSave').prop('disabled', false).html('<i class="fa fa-user-plus"></i> Add Guardian');
}

function formLoading() {
  $('#guardianSave').prop('disabled', true).html('<i class="fa fa-spinner fa-pulse"></i>');
}
