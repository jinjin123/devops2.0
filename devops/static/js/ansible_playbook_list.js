$(function(){
  setTimeout("push_ansible_server_chooice()",500)
  get_group();
  get_user();
  setTimeout("push_group_chooice()",500);
  setTimeout("push_user_chooice()",500);
  setTimeout("force_show_mail()",500)
  $("[data-toggle='popover']").popover();
  $(document).on('keyup', '.searchValue', function () {
      searchValue(this);
  })
  $('#deployTableList').DataTable({
    responsive: true
  });
  $('#playbook_add').click(function(){
    window.location.href =  Ansible_playbook_config
  })
  //防止文件append
  $('#Edit').click('onchange',function(e){
    Class = e.currentTarget.className.split(' ')
    for(var x=0; x<Class.length;x++){
      // console.log(Class[x])
      if("in" ==Class[x]){
        return true;
      }else{
        $('#file_tag')[0].textContent = "剧本文件"
      }
    }
  })
  $('#Edit_check').click(function(){
    playbook_name = $('#playbook_name').val();
    playbook_desc = $('#playbook_desc').val();
    var host = [];
    if ($("#ansible_playbook_edit_right_server option").length > 0) {
        $("#ansible_playbook_edit_right_server option").each(function () {
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
    update_tag = document.getElementById('Edit_check').getAttribute('update_tag')
    var fileobj = $('#playbook_file')[0].files[0]
    post_data = {"host": host,"playbook_name":playbook_name,"playbook_desc": playbook_desc,"playbook_auth_group": playbook_auth_group, "playbook_auth_user":playbook_auth_user,"playbook_vars":playbook_vars,"update_tag": update_tag}
    console.log(JSON.stringify(post_data))
    var form = new FormData();
    form.append("playbook_file", fileobj);
    form.append("post_data",JSON.stringify(post_data))
    var xhr = new XMLHttpRequest();
    var token = get_global_csrf_token()
    xhr.open("POST", playbook_add, true);
    xhr.setRequestHeader("X-CSRFToken",token);
    xhr.onload = function () {
         if(xhr.readyState == 4 && xhr.status == 200){
           console.log(xhr.responseText)
             status = JSON.parse(xhr.responseText).status
             if(status == 'success'){
               showSuccessNotic()
               window.location.reload()
             }else{
               showErrorInfo(status)
             }
         } else if(xhr.readyState == 4 && xhr.status == 404){
             showErrorInfo("修改失败")
             document.getElementById('Edit').setAttribute('class','modal fade')
             return;
         };
     };
     xhr.send(form)
  })
  $("#add").click(function () {
      if ($("#ansible_playbook_edit_left_server option:selected").length > 0) {
          $("#ansible_playbook_edit_left_server option:selected").each(function () {
              $("#ansible_playbook_edit_right_server").append("<option value='" + $(this).val() + "'>" + $(this).text() + "</option");
              $(this).remove();
          })
      }
      else {
        showErrorInfo("请选择!")
      }
  })
  //将左侧的数据全部添加到右侧，并清空左侧数据
  $("#addlist").click(function () {
      if ($("#ansible_playbook_edit_left_server option").length > 0) {
          $("#ansible_playbook_edit_left_server option").each(function () {
              $("#ansible_playbook_edit_right_server").append("<option value='" + $(this).val() + "'>" + $(this).text() + "</option");
              $(this).remove();
          })
      }
      else {
        showErrorInfo("请选择!")
      }
  })

  //双击左侧列表一条数据，添加到右侧列表
  $('#ansible_playbook_edit_left_server').dblclick(function () {
      $("#ansible_playbook_edit_left_server option:selected").each(function () {
          $("#ansible_playbook_edit_right_server").append("<option value='" + $(this).val() + "'>" + $(this).text() + "</option");
          $(this).remove();
      })
  });

  //删除右侧列表选择的数据
  $("#delete").click(function () {
      if ($("#ansible_playbook_edit_right_server option:selected").length > 0) {
          $("#ansible_playbook_edit_right_server option:selected").each(function () {
              $("#ansible_playbook_edit_left_server").append("<option value='" + $(this).val() + "'>" + $(this).text() + "</option");
              $(this).remove();
          })
      }
      else {
        showErrorInfo("请选择!")
      }
  })
  //将右侧的数据全部添加到左侧，并清空右侧数据
  $("#deletelist").click(function () {
      if ($("#ansible_playbook_edit_right_server option").length > 0) {
          $("#ansible_playbook_edit_right_server option").each(function () {
              $("#ansible_playbook_edit_left_server").append("<option  value='" + $(this).val() + "'>" + $(this).text() + "</option");
              $(this).remove();
          })
      }
      else {
        showErrorInfo("请选择!")
      }
  })

  //双击又侧列表一条数据，添加到左侧列表
  $('#ansible_playbook_edit_right_server').dblclick(function () {
      $("#ansible_playbook_edit_right_server option:selected").each(function () {
          $("#ansible_playbook_edit_left_server").append("<option  value='" + $(this).val() + "'>" + $(this).text() + "</option");
          $(this).remove();
      })
  });

  $("#runadd").click(function () {
      if ($("#ansible_playbook_run_left_server option:selected").length > 0) {
          $("#ansible_playbook_run_left_server option:selected").each(function () {
              $("#ansible_playbook_run_right_server").append("<option value='" + $(this).val() + "'>" + $(this).text() + "</option");
              $(this).remove();
          })
      }
      else {
        showErrorInfo("请选择!")
      }
  })
  $("#runaddlist").click(function () {
      if ($("#ansible_playbook_run_left_server option").length > 0) {
          $("#ansible_playbook_run_left_server option").each(function () {
              $("#ansible_playbook_run_right_server").append("<option value='" + $(this).val() + "'>" + $(this).text() + "</option");
              $(this).remove();
          })
      }
      else {
        showErrorInfo("请选择!")
      }
  })

  //双击左侧列表一条数据，添加到右侧列表
  $('#ansible_playbook_run_left_server').dblclick(function () {
      $("#ansible_playbook_run_left_server option:selected").each(function () {
          $("#ansible_playbook_run_right_server").append("<option value='" + $(this).val() + "'>" + $(this).text() + "</option");
          $(this).remove();
      })
  });

  //删除右侧列表选择的数据
  $("#rundelete").click(function () {
      if ($("#ansible_playbook_run_right_server option").length > 0) {
          $("#ansible_playbook_run_right_server option").each(function () {
              $("#ansible_playbook_run_left_server").append("<option value='" + $(this).val() + "'>" + $(this).text() + "</option");
              $(this).remove();
          })
      }
      else {
        showErrorInfo("请选择!")
      }
  })
  //将右侧的数据全部添加到左侧，并清空右侧数据
  $("#rundeletelist").click(function () {
      if ($("#ansible_playbook_run_right_server option").length > 0) {
          $("#ansible_playbook_run_right_server option").each(function () {
              $("#ansible_playbook_run_left_server").append("<option  value='" + $(this).val() + "'>" + $(this).text() + "</option");
              $(this).remove();
          })
      }
      else {
        showErrorInfo("请选择!")
      }
  })

  //双击又侧列表一条数据，添加到左侧列表
  $('#ansible_playbook_run_right_server').dblclick(function () {
      $("#ansible_playbook_run_right_server option:selected").each(function () {
          $("#ansible_playbook_run_left_server").append("<option  value='" + $(this).val() + "'>" + $(this).text() + "</option");
          $(this).remove();
      })
  });
})
function  push_ansible_server_chooice(){
  for(let i in window.allServersList){
    server = window.allServersList[i]
    // no have space
    $('#ansible_playbook_edit_left_server').append("<option  value='"+server.ip+"'>" + server.ip + "</option>")
    $('#ansible_playbook_run_left_server').append("<option  value='"+server.ip+"'>" + server.ip + "</option>")
  }
}

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


function getAnsiblePlayBookFile(obj,id) {
  var btnObj = $(obj);
  var token = get_global_csrf_token()
  $.ajax({
    url: playbook_file_show+id+'/',
    type:"POST",  //提交类似
    headers: {
      'X-CSRFToken': token
    },
    data:{
      "id":id
    },  //提交参数
    success:function(response){
      btnObj.removeAttr('disabled');
      if (response["code"] == "200"){
        btnObj.removeAttr('disabled');
        $("#play_content").html(response["data"]);
      }

    },
      error:function(response){
        btnObj.removeAttr('disabled');
        showErrorInfo('查看失败')
      }
  })
}

function mdfAnsiblePlayBookFile(event,id) {
  // console.log(event)
  playbook_name = event.target.parentNode.parentNode.children[0].textContent
  // playbook_uuid = event.target.parentNode.parentNode.children[1].textContent
  playbook_desc = event.target.parentNode.parentNode.children[2].textContent
  playbook_file = event.target.parentNode.parentNode.children[3].children[0].attributes[4].value.split('/')[1]
  playbook_vars = event.target.parentNode.parentNode.children[3].children[0].attributes[5].value
  playbook_user = event.target.parentNode.parentNode.children[3].children[0].attributes[6].value
  playbook_group = event.target.parentNode.parentNode.children[3].children[0].attributes[7].value
  playbook_server = Rmtab(event.target.parentNode.parentNode.children[4].children[0].attributes[6].value).split('<br/>')
  //ioop server array and ioop server option , match them then put into right chooice option
  for(let i in playbook_server){
      $("#ansible_playbook_edit_left_server option").each(function () {
          if(playbook_server[i] == $(this).val()){
            $("#ansible_playbook_edit_right_server").append("<option  value='"+playbook_server[i]+"'>" + playbook_server[i] + "</option");
            $(this).remove();
          }
      })

  }
  console.log(playbook_name,playbook_desc,playbook_file,playbook_vars,playbook_user,playbook_group,playbook_server)
  // document.getElementById('playbook_name').value = playbook_name
  $('#playbook_name').val(playbook_name)
  $('#playbook_vars')[0].textContent  = playbook_vars
  $('#playbook_desc')[0].textContent  = playbook_desc
  $('#playbook_auth_user').val(playbook_user)
  $('#playbook_auth_group').val(playbook_group)
  $('#file_tag')[0].textContent = $('#file_tag')[0].textContent + ": " + playbook_file
  document.getElementById('Edit_check').setAttribute('update_tag',id)
}

function runAnsiblePlayBookFile(event,id) {
  playbook_uuid = event.target.parentNode.parentNode.children[1].textContent
  playbook_name = event.target.parentNode.parentNode.children[0].textContent
  playbook_vars = event.target.parentNode.parentNode.children[3].children[0].attributes[5].value
  $('#run_playbook_name').val(playbook_name)
  $('#run_playbook_vars')[0].textContent  = playbook_vars
  $('#run_show_file').click(function(){
    var token = get_global_csrf_token()
    $.ajax({
      url: playbook_file_show+id+'/',
      type:"POST",
      headers: {
        'X-CSRFToken': token
      },
      data:{
        "id":id
      },
      success:function(response){
        if (response["code"] == "200"){
          $("#run_play_content").html(response["data"]);
        }
      },
        error:function(response){
          showErrorInfo('查看失败')
        }
    })
  })
  var host = []
  $('#run_check').on('click',function(){
    $("#run_result").html("服务器正在处理，请稍等。。。");
    $('#run_check').attr('disabled',true)
    if ($("#ansible_playbook_run_right_server option").length > 0) {
        $("#ansible_playbook_run_right_server option").each(function () {
            host.push($(this).val())
        })
        var post_data = {"run_id":id,"host":host,"vars":playbook_vars,"ans_uuid":playbook_uuid}
        var token = get_global_csrf_token()
        console.log(post_data)
        /* 轮训获取结果 开始  */
        var interval = setInterval(function(){
              $.ajax({
                  url : ansible_run,
                  headers: {
                    'X-CSRFToken': token
                  },
                  type : 'post',
                  data:  JSON.stringify(post_data),
                  success : function(result){
                    if (result["msg"] !== null ){
                      $("#run_result").append("<p>"+result["msg"]+"</p>");
                      if (result["msg"].indexOf("[Done]") == 0){
                        clearInterval(interval);
                        showSuccessNotic();
                        $('#run_check').removeAttr('disabled');
                      }
                    }
                  },
              error:function(response){
                $('#run_check').removeAttr('disabled')
                clearInterval(interval);
              }
              });
          },1000);

          $.ajax({
            url: playbook_run+id+'/',
            type: "POST",
            headers: {
              'X-CSRFToken': token
            },
            data:  JSON.stringify(post_data),
            success: function(response) {
              console.log(response)
              $('#run_check').removeAttr('disabled')
              if (response["code"] == "500") {
                clearInterval(interval);
                $('#run_check').removeAttr('disabled')
                showErrorInfo(response['msg'])
              } else if (response["code"] == "200") {
                $("#run_result").html("服务器处理完毕，请查看报告汇总展示!");
                var htmlStr = '<table class="table"><thead><th>主机</th><th>成功</th><th>失败</th><th>跳过</th><th>更改</th><th>主机不可达</th><th>结果</th></thead><tbody>';
                for (x in response["data"]) {
                  if (response["data"][x]['result'] == 'Succeed') {
                    var btTag = '<button type="button" class="btn btn-xs btn-success disabled">成功</button>'
                  } else {
                    var btTag = '<button type="button" class="btn btn-xs btn-danger disabled">失败</button>'
                  };
                  htmlStr += '<tr><td>' + response["data"][x]['host'] +
                    '</td><td><span class="label label-success">' + response["data"][x]['ok'] + '</span>' +
                    '</td><td><span class="label label-danger">' + response["data"][x]['failed'] + '</span>' +
                    '</td><td><span class="label label-default">' + response["data"][x]['skipped'] + '</span>' +
                    '</td><td><span class="label label-warning">' + response["data"][x]['changed'] + '</span>' +
                    '</td><td><span class="label label-info">' + response["data"][x]['unreachable'] + '</span>' +
                    '</td><td>' + btTag + '</tr>';
                };
                htmlStr += '</tbody></table>'
                $('#summary').html(htmlStr);
                runAnsibleStatusPer(response["statPer"]);
                //get the  status pic need to stop interval
                clearInterval(interval);
              };

            },
            error: function(response) {
              $('#run_check').removeAttr('disabled')
              clearInterval(interval);
            }
          })
    }else{
      $('#run_check').removeAttr('disabled')
      showErrorInfo('请选择服务器! ')
    }
  })
}

var myChart = echarts.init(document.getElementById('statPer'));
	function runAnsibleStatusPer(statPer) {
	    option = {
	    	    title : {
	    	        text: '剧本部署状态比率',
	    	        subtext: 'Task Status',
	    	        x:'center'
	    	    },
	    	    tooltip : {
	    	        trigger: 'item',
	    	        formatter: "{a} <br/>{b} : {c} ({d}%)"
	    	    },
	    	    legend: {
	    	        orient : 'vertical',
	    	        x : 'left',
	    	        data:['成功','失败','更改','跳过','主机不可达']
	    	    },
	    	    toolbox: {
	    	        show : true,
	    	        feature : {
	    	            mark : {show: true},
	    	            dataView : {show: true, readOnly: false},
	    	            magicType : {
	    	                show: true,
	    	                type: ['pie', 'funnel'],
	    	                option: {
	    	                    funnel: {
	    	                        x: '25%',
	    	                        width: '50%',
	    	                        funnelAlign: 'left',
	    	                        max: 1548
	    	                    }
	    	                }
	    	            },
	    	            restore : {show: true},
	    	            saveAsImage : {show: true}
	    	        }
	    	    },
	    	    calculable : true,
	    	    series : [
	    	        {
	    	            name:'Task Status Per',
	    	            type:'pie',
	    	            radius : '55%',
	    	            center: ['50%', '60%'],
	    	            data:[
	    	                {value:statPer["ok"], name:'成功'},
	    	                {value:statPer["failed"], name:'失败'},
	    	                {value:statPer["changed"], name:'更改'},
	    	                {value:statPer["skipped"], name:'跳过'},
	    	                {value:statPer["unreachable"], name:'主机不可达'}
	    	            ]
	    	        }
	    	    ]
	    	};

	 myChart.setOption(option);
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


/*
 must set header to fix cors issue
*/
function deletePlayBook(obj,id){
      var token = get_global_csrf_token()
      $.ajax({
          type: 'DELETE',
          headers: {
            'X-CSRFToken': token
          },
          url: del_playbook+id+'/',
            success:function(response){
                  showSuccessNotic()
                  // location.reload();
            },
            error:function(response){
              // console.log(response)
                  showErrorInfo('删除失败')
              }
        });
}
