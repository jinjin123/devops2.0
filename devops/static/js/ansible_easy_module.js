$(function(){
  setTimeout("push_ansible_server_chooice()",500)
  $(document).on('keyup', '.searchValue', function () {
      searchValue(this);
  });
  //向右侧列表添加数据
  $("#add").click(function () {
      if ($("#ansible_left_server option:selected").length > 0) {
          $("#ansible_left_server option:selected").each(function () {
              $("#ansible_right_server").append("<option value='" + $(this).val() + "'>" + $(this).text() + "</option");
              $(this).remove();
          })
      }
      else {
        showErrorInfo("请选择!")
      }
  })
  //将左侧的数据全部添加到右侧，并清空左侧数据
  $("#addlist").click(function () {
      if ($("#ansible_left_server option").length > 0) {
          $("#ansible_left_server option").each(function () {
              $("#ansible_right_server").append("<option value='" + $(this).val() + "'>" + $(this).text() + "</option");
              $(this).remove();
          })
      }
      else {
        showErrorInfo("请选择!")
      }
  })

  //双击左侧列表一条数据，添加到右侧列表
  $('#ansible_left_server').dblclick(function () {
      $("#ansible_left_server option:selected").each(function () {
          $("#ansible_right_server").append("<option value='" + $(this).val() + "'>" + $(this).text() + "</option");
          $(this).remove();
      })
  });

  //删除右侧列表选择的数据
  $("#delete").click(function () {
      if ($("#ansible_right_server option:selected").length > 0) {
          $("#ansible_right_server option:selected").each(function () {
              $("#ansible_left_server").append("<option value='" + $(this).val() + "'>" + $(this).text() + "</option");
              $(this).remove();
          })
      }
      else {
        showErrorInfo("请选择!")
      }
  })
  //将右侧的数据全部添加到左侧，并清空右侧数据
  $("#deletelist").click(function () {
      if ($("#ansible_right_server option").length > 0) {
          $("#ansible_right_server option").each(function () {
              $("#ansible_left_server").append("<option value='" + $(this).val() + "'>" + $(this).text() + "</option");
              $(this).remove();
          })
      }
      else {
        showErrorInfo("请选择!")
      }
  })

  //双击又侧列表一条数据，添加到左侧列表
  $('#ansible_right_server').dblclick(function () {
      $("#ansible_right_server option:selected").each(function () {
          $("#ansible_left_server").append("<option value='" + $(this).val() + "'>" + $(this).text() + "</option");
          $(this).remove();
      })
  });
})

function  push_ansible_server_chooice(){
  for(let i in window.allServersList){
    server = window.allServersList[i]
    // no have space
    $('#ansible_left_server').append("<option value='"+server.ip+"'>" + server.ip + "</option>")
  }
}
//search the option value
function searchValue(input) {
    var searchValue = input.value.toLowerCase();
    var option = $("#ansible_left_server option");
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

//listen module chooice
function oBtAnsibleModel() {
	   var obj = document.getElementById("ansible_model");
	   var index = obj.selectedIndex;
	   var value = obj.options[index].value;
     console.log(value)
    switch (value) {
      case "raw":
		   document.getElementById("ansible_args").value="uptime";
		   document.getElementById("custom_model").style.display = "none";
        break;
      case "yum":
		   document.getElementById("ansible_args").value="name=httpd state=present";
		   document.getElementById("custom_model").style.display = "none";
        break;
      case "service":
		   document.getElementById("ansible_args").value="name=httpd state=restarted enabled=yes";
		   document.getElementById("custom_model").style.display = "none";
        break;
      case "cron":
		   document.getElementById("ansible_args").value='name="sync time" minute=*/3 hour=* day=* month=* weekday=* job="/usr/sbin/ntpdate window.time.com"';
		   document.getElementById("custom_model").style.display = "none";
        break;
      case "file":
		   document.getElementById("ansible_args").value='src=/root/test.txt dest=/tmp/test.txt owner=root group=root mode=700 state=touch';
		   document.getElementById("custom_model").style.display = "none";
        break;
      case "copy":
		   document.getElementById("ansible_args").value='src=/root/test.txt dest=/tmp/test.txt';
		   document.getElementById("custom_model").style.display = "none";
        break;
      case "user":
		   document.getElementById("ansible_args").value="name=welliam password='$6yshUMNL8dhY'";
		   document.getElementById("custom_model").style.display = "none";
        break;
      case "synchronize":
		   document.getElementById("ansible_args").value="src=/root/a dest=/tmp/ compress=yes --exclude=.git";
		   document.getElementById("custom_model").style.display = "none";
        break;
      case "get_url":
		   document.getElementById("ansible_args").value="url=http://url/test.tar.gz dest=/tmp";
		   document.getElementById("custom_model").style.display = "none";
        break;
      case "custom":
		   document.getElementById("custom_model").style.display = "";
		   document.getElementById("ansible_args").value="";
        break;
      default:
		   document.getElementById("ansible_args").value="";
    }
}

// post module args
function runAnsibleModel(obj) {
  var btnObj = $(obj);
  var obj = document.getElementById("ansible_model");
  var index = obj.selectedIndex;
  var chooice_module = obj.options[index].value;
  var args = document.getElementById("ansible_args").value
  var ans_uuid = $('#ans_uuid')[0].value
  var custom_model = $('#custom_model_name')[0].value
  var host = [];
  if ($("#ansible_right_server option").length > 0) {
      $("#ansible_right_server option").each(function () {
        //  ioop ip into array {"host":["192.168.1.31","192.168.1.233"],"user":"root"}
        host.push($(this).val())
        btnObj.attr('disabled',true);
      })
  }else{
      showErrorInfo('请注意必填项不能为空~')
      btnObj.removeAttr('disabled');
      return  false;
  }
  post_data = {"host": host,"user": "root","module": chooice_module,"args": args,"ans_uuid": ans_uuid,"custom_model": custom_model}
  console.log(post_data);
  $("#result").html("服务器正在处理，请稍等。。。");
  var token = get_global_csrf_token ()
  /* 轮训获取结果 开始  */
   var interval = setInterval(function(){
        $.ajax({
            url : ansible_run,
            type : 'post',
            headers: {'X-CSRFToken': token },
            data:  JSON.stringify(post_data),
            success : function(result){
              if (result["msg"] !== null ){
                $("#result").append("<p>"+result["msg"]+"</p>");
                if (result["msg"].indexOf("[Done]") == 0){
                  clearInterval(interval);
                  showSuccessNotic();
                  btnObj.removeAttr('disabled');
                }
              }
            },
        error:function(response){
          btnObj.removeAttr('disabled');
          clearInterval(interval);
        }
        });
    },1000);
// 	    /* 轮训获取结果结束  */
  $.ajax({
    url: ansible_model,
    type:"POST",
    headers: {'X-CSRFToken': token },
    data: JSON.stringify(post_data),
    success:function(response){
      btnObj.removeAttr('disabled');
      if (response["code"] == "500"){
        clearInterval(interval);
        btnObj.removeAttr('disabled');
        showErrorInfo(response["msg"])
      }
    },
      error:function(response){
        btnObj.removeAttr('disabled');
        showErrorInfo('执行失败');
        clearInterval(interval);
      }
  })
}
