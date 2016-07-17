$(function() {
  //Update the information in the script based on user input
  $('input[type=text]').keyup(function() {
    console.log($(this).attr('id'));
    $('#' + $(this).attr('id') + 'Value').text($(this).val());
  });
});
