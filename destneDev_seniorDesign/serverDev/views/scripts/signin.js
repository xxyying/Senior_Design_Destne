$(function() {
  'use strict';

  //Options for Message
  //----------------------------------------------
  var options = {
    'btn-loading': '<i class="fa fa-spinner fa-pulse"></i>',
    'btn-success': '<i class="fa fa-check"></i>',
    'btn-error': '<i class="fa fa-remove"></i>',
    'msg-success': 'Success! Redirecting...'
  };

  //Login Form
  //----------------------------------------------
  //Validation
  $('#login-form').validate({
    onkeyup: false,
    onclick: false,
    onfocusout: false,
    rules: {
      lgUsername: 'required',
      lgPassword: 'required'
    },
    message: {
      lgUsername: 'Please provide your username',
      lgPassword: 'Please provide your password'
    },
    errorClass: 'form-invalid'
  });

  //Form Submission
  $('#login-form').submit(function() {
    removeLoading($(this));
    ajaxSubmitForm($(this));
    //ancel the normal submission.
    return false;
  });

  //AJAX Call
  function ajaxSubmitForm($form) {
    if($form.valid()) {
      formLoading($form);
      var username = $('#lgUsername').val();
      var password = $('#lgPassword').val();
      $.ajax({
        type: 'POST',
        url: '/auth',
        dataType: 'json',
        beforeSend: function(xhr) {
          xhr.setRequestHeader('Authorization', 'Basic ' + btoa(username + ':' + password));
        }
      }).done(function(json) {
        if(json.success === true) {
          formSuccess($form);
          setTimeout(function() {
            window.location.href = '/client/analysis';
          }, 1000);
        }
        else {
          console.log(json.message);
          formFailed($form, json.message);
        }
      }).fail(function(xhr, status, errorThrown) {
        alert('Sorry there was a problem!');
        console.log('Error: ' + errorThrown);
        console.log('Status: ' + status);
      });
    }
  }

  //Loading
  //----------------------------------------------
  function removeLoading($form) {
    $form.find('[type=submit]').removeClass('error success');
    $form.find('.login-form-main-message').removeClass('show error success').html('');
  }

  function formLoading($form) {
    $form.find('[type=submit]').addClass('clicked').html(options['btn-loading']);
  }

  function formSuccess($form) {
    $form.find('[type=submit]').addClass('success').html(options['btn-success']);
    $form.find('.login-form-main-message').addClass('show success').html(options['msg-success']);
  }

  function formFailed($form, message) {
    $form.find('[type=submit]').addClass('error').html(options['btn-error']);
    $form.find('.login-form-main-message').addClass('show error').html(message);
  }
});
