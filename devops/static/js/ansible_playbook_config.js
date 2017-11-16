$(function(){
  setTimeout("push_ansible_server_chooice()",500)
  $(document).on('keyup', '.searchValue', function () {
      searchValue(this);
  });
  get_group();
  get_user();
  setTimeout("push_group_chooice()",500);
  setTimeout("push_user_chooice()",500);
  $('#playbook_add').click(function(){
     playbook_config_post()
  })
  //向右侧列表添加数据
  $("#add").click(function () {
      if ($("#ansible_playbook_config_left_server option:selected").length > 0) {
          $("#ansible_playbook_config_left_server option:selected").each(function () {
              $("#ansible_playbook_config_right_server").append("<option value='" + $(this).val() + "'>" + $(this).text() + "</option");
              $(this).remove();
          })
      }
      else {
        showErrorInfo("请选择!")
      }
  })
  //将左侧的数据全部添加到右侧，并清空左侧数据
  $("#addlist").click(function () {
      if ($("#ansible_playbook_config_left_server option").length > 0) {
          $("#ansible_playbook_config_left_server option").each(function () {
              $("#ansible_playbook_config_right_server").append("<option value='" + $(this).val() + "'>" + $(this).text() + "</option");
              $(this).remove();
          })
      }
      else {
        showErrorInfo("请选择!")
      }
  })

  //双击左侧列表一条数据，添加到右侧列表
  $('#ansible_playbook_config_left_server').dblclick(function () {
      $("#ansible_playbook_config_left_server option:selected").each(function () {
          $("#ansible_playbook_config_right_server").append("<option value='" + $(this).val() + "'>" + $(this).text() + "</option");
          $(this).remove();
      })
  });

  //删除右侧列表选择的数据
  $("#delete").click(function () {
      if ($("#ansible_playbook_config_right_server option:selected").length > 0) {
          $("#ansible_playbook_config_right_server option:selected").each(function () {
              $("#ansible_playbook_config_left_server").append("<option value='" + $(this).val() + "'>" + $(this).text() + "</option");
              $(this).remove();
          })
      }
      else {
        showErrorInfo("请选择!")
      }
  })
  //将右侧的数据全部添加到左侧，并清空右侧数据
  $("#deletelist").click(function () {
      if ($("#ansible_playbook_config_right_server option").length > 0) {
          $("#ansible_playbook_config_right_server option").each(function () {
              $("#ansible_playbook_config_left_server").append("<option  value='" + $(this).val() + "'>" + $(this).text() + "</option");
              $(this).remove();
          })
      }
      else {
        showErrorInfo("请选择!")
      }
  })

  //双击又侧列表一条数据，添加到左侧列表
  $('#ansible_playbook_config_right_server').dblclick(function () {
      $("#ansible_playbook_config_right_server option:selected").each(function () {
          $("#ansible_playbook_config_left_server").append("<option  value='" + $(this).val() + "'>" + $(this).text() + "</option");
          $(this).remove();
      })
  });
})

function  push_ansible_server_chooice(){
  for(let i in window.allServersList){
    server = window.allServersList[i]
    // no have space
    $('#ansible_playbook_config_left_server').append("<option  value='"+server.ip+"'>" + server.ip + "</option>")
  }
}
//search the option value
function searchValue(input) {
    var searchValue = input.value.toLowerCase();
    var option = $("#ansible_playbook_config_left_server option");
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

//get group  from api
function push_group_chooice(){
  for(let x in window.group_resource){
      group = window.group_resource[x]
    $('#playbook_auth_group').append("<option value='"+group.name+"'>" + group.name + "</option>")
  }
}


//get user  from api
function push_user_chooice(){
  for(let x in window.user_resource){
      user = window.user_resource[x]
    $('#playbook_auth_user').append("<option  value='"+user.username+"'>" + user.username + "</option>")
  }
}

function playbook_config_post(){
   playbook_name = $('#playbook_name').val();
   playbook_desc = $('#playbook_desc').val();
  //  var ans_uuid = $('#ans_uuid').val();
   var host = [];
   if ($("#ansible_playbook_config_right_server option").length > 0) {
       $("#ansible_playbook_config_right_server option").each(function () {
         //  ioop ip into array {"host":["192.168.1.31","192.168.1.233"],"user":"root"}
         host.push($(this).val())
       })
   }else{
       showErrorInfo('请注意必填项不能为空~')
       return  false;
   }
   playbook_auth_group = $('#playbook_auth_group').val()
   playbook_auth_user = $('#playbook_auth_user').val()
   playbook_vars = $('#playbook_vars').val()
   var fileobj = $('#playbook_file')[0].files[0]
  //  var fileobj = document.getElementById('playbook_file').file[0]
   post_data = {"host": host,"playbook_name":playbook_name,"playbook_desc": playbook_desc,"playbook_auth_group": playbook_auth_group, "playbook_auth_user":playbook_auth_user,"playbook_vars":playbook_vars}
   console.log(post_data)
   var form = new FormData();
   form.append("playbook_file", fileobj);
   form.append("post_data",JSON.stringify(post_data))
   var xhr = new XMLHttpRequest();
    xhr.open("POST", playbook_add, true);
    xhr.onload = function () {
        if(xhr.readyState == 4 && xhr.status == 200){
          console.log(JSON.parse(xhr.responseText))
            status = JSON.parse(xhr.responseText).status
            if(status == 'success'){
              showSuccessNotic()
            }else{
              showErrorInfo(status)
            }
        } else if(xhr.readyState == 4 && xhr.status == 404){
            showErrorInfo("添加失败")
            return;
        };
    };
    xhr.send(form)
}
