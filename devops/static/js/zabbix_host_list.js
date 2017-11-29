$(function(){
  get_group();
  get_user();
  setTimeout("force_show_mail()",500)
  $("[data-toggle='popover']").popover();
  $(document).on('keyup', '.searchValue', function () {
      searchValue(this);
  })
  $('#deployTableList').DataTable({
    responsive: true
  });
})



//search the option value
function searchValue(input) {
    var searchValue = input.value.toLowerCase();
    var option = $("#ansible_playbook_edit_left_server option");
    option.each(
        function () {
            var e = jQuery(this);
            var eValue = e.text().toLowerCase();
            if (!eValue.match(searchValue)) {
                e.hide();
            }
            else {
                e.show()
            }
        }
    );
};
