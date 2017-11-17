/**
 * Created by wupeijin on 17/3/26.
 */
$(function () {
  //when click add server  init value
    $('#h_add').on('click',function(){
        $('#im_host').show()
        $('#ip')[0].value = ''
        $('#port')[0].value = 22
        $('#group')[0].value = ''
        $('#user')[0].value = ''
        $('#passwd')[0].value = ''
        $('#BZ')[0].value = ''
        $("#lg_choice").get(0).options[0].selected = true;
        $('#password').css("display", "block");
        $('#passwd').css("display", "block");
        $('#choice_lg').css("display", "none");
        $('.key').css("display", "none");
        $('#choice_lg3').css("display", "none");
        $('#us_sudo').removeClass("glyphicon-check").addClass("glyphicon-unchecked");
        document.getElementById('sudoPassword').setAttribute("disabled", true)
        $('#us_su').removeClass("glyphicon-check").addClass("glyphicon-unchecked");
        document.getElementById('suPassword').setAttribute("disabled", true);
        $("#sudoPassword")[0].value = '';
        $("#suPassword")[0].value = '';
        // click add server set opeation is ADD
        $("#opt_tag")[0].value = 'ADD';
    })
    $('#lg_choice').change(function (){
        console.log($('#lg_choice').val())
        put_key_chooice()
    })
    $('#closeCheckInfo').click(function (){
      $('#showServerCheckInfo').hide();
    })
    // just show upload file name to instead  tag a text content
    $(".key").on("change","input[type='file']",function(){
      var filePath=$(this).val();
      if(filePath.indexOf("key")!=-1 || filePath.indexOf("pem")!=-1){
        var arr=filePath.split('\\');
        var fileName=arr[arr.length-1];
        // if  input tag  style display is none ,it cannot click  choice file
        $("#choice_key").html(fileName + '<input id="choice_lg3" onclick="" type="file" class="" style="display: block;" accept="" value="'+ fileName + '">');
        // console.log($(".key"))
      }else{
          filePath = "";
          $("#choice_key").html("您上传文件格式有误！请以.pem 或者.key结尾的格式!").show();
          return false
      }
    })
    document.getElementById("sudo").onclick = function () {
        // $('#sudo').onclick = function (){
        //this是div，
        sudoProgress(this)
    }
    //绑定su选择
    document.getElementById("su").onclick = function () {
        //this是div，
        suProgress(this)
    }
    function sudoProgress(div) {
        //点击sudo按钮的时候要处理的事情
        //div是i和span,i中是check
        var sudoPassword = document.getElementById("sudoPassword");
        var suPassword = document.getElementById("suPassword");

        var check = $(div).find("i")[0];
        if ($(check).hasClass("glyphicon-check")) {
            //如果点击之前是被选中的，则取消选中
            $(check).removeClass("glyphicon-check").addClass("glyphicon-unchecked")
            sudoPassword.setAttribute("disabled", true);//取消了以后，就不能输入密码了
        }
        else {
            $(check).removeClass("glyphicon-unchecked").addClass("glyphicon-check")
            sudoPassword.removeAttribute("disabled");
            //这里做了sudo的选中，所以取消su的选中
            var suDiv = $("#su");
            var suCheck = $(suDiv).find("i")[0];
            $(suCheck).removeClass("glyphicon-check").addClass("glyphicon-unchecked");
            suPassword.setAttribute("disabled", true)
        }

    }

    function suProgress(div) {
        //点击su按钮的时候要处理的事情
        var sudoPassword = document.getElementById("sudoPassword");
        var suPassword = document.getElementById("suPassword");
        //div是i和span,i中是check
        var check = $(div).find("i")[0];
        if ($(check).hasClass("glyphicon-check")) {
            //如果点击之前是被选中的，则取消选中
            $(check).removeClass("glyphicon-check").addClass("glyphicon-unchecked")
            suPassword.setAttribute("disabled", true)
        }
        else {
            $(check).removeClass("glyphicon-unchecked").addClass("glyphicon-check")
            suPassword.removeAttribute("disabled");
            //这里做了su的选中，所以取消sudo的选中
            var sudoDiv = $("#sudo");
            var sudoCheck = $(sudoDiv).find("i")[0];
            $(sudoCheck).removeClass("glyphicon-check").addClass("glyphicon-unchecked");
            sudoPassword.setAttribute("disabled", true)
        }
    }
// clear edit
       $('#close_edit').one('click',function () {
        document.getElementById("ip").value = "";
        document.getElementById("port").value = "";
        document.getElementById("group").value = "";
        document.getElementById("user").value = "";
        document.getElementById("password").value = "";
        var LoginSelect = document.getElementById("lg_choice");
        LoginSelect.options[0].textContent = "password";
        LoginSelect.options[1].textContent = "key";
        $('#choice_lg').css("display", "none");
        $('.key').css("display", "none");
        $('#choice_lg3').css("display", "none");
        document.getElementById("sudo").value = "";
        document.getElementById("sudoPassword").value = "";
        document.getElementById("su").value = "";
        document.getElementById("suPassword").value = ""
        document.getElementById("bz").value = "";
    })
//edit server  to upgrade
    $('#add_server_list').on('click',function () {
        // console.log($("#lg_choice  option:selected").val())
        // get the  chooice  login type  value
        var LG_type = $("#lg_choice  option:selected").val();
        // input  before the third are fixed , but behind are not fixed ,so it  need to bind the id  to get the value
        var input = $(this).parent().parent().find('input');
        var token = get_global_csrf_token()
        console.log(input)
        var IP = input[0].value;
        var PORT = input[1].value;
        var GROUP = input[2].value;
        var USER = input[3].value;
        var ID = input[0].value;
        var US_SUDO = document.getElementById("us_sudo").getAttribute("class").split(' ')
        var US_SU = document.getElementById("us_su").getAttribute("class").split(' ')
        var BZ = $("#BZ")[0].value
        OPT_TAG = $("#opt_tag")[0].value
        //  judge  use  sudo su  or  else to decide sudo su value
        if(US_SUDO[1] == "glyphicon-unchecked"){
            var US_SUDO = "N"
            var SUDO = "N"
        }else{
          var US_SUDO = "Y"
          var SUDO = $("#sudoPassword")[0].value;
          if( SUDO == ""){
             var SUDO = "N";
          }
        }
        if(US_SU[1] == "glyphicon-unchecked"){
          var US_SU = "N"
          var SU = "N"
        }else{
          var US_SU = "Y"
          var SU = $("#suPassword")[0].value;
          if( SU == ""){
             var SU = "N";
          }
        }
        if (LG_type == "password"){
            var lg_type =  "密码方式";
            var PASSWORD = $("#passwd")[0].value;
            var keyname = "N";
        } else  {
            var PASSWORD = "N";
            var lg_type = "秘钥方式";
            var keyname = $("#keyfiles option:selected").val()
        }
        console.log(lg_type)
        if (IP == '' || PORT == '' || USER == ''){
            showErrorInfo('部分字段不能为空');
        }else {
            data = {
                "ip": IP,
                "port": parseInt(PORT),
                "group": GROUP,
                "user": USER,
                "lg_type": lg_type,
                "key": keyname,
                "password": PASSWORD,
                "us_sudo": US_SUDO,
                "us_su": US_SU,
                "sudoPassword": SUDO,
                "suPassword": SU,
                "status": "",
                "BZ": BZ,
                "id": ID,
                "opt_tag": OPT_TAG,
            },
            console.log(data)
                $.ajax({
                    url: addserverURL,
                    type: "post",
                    // contentType: "application/x-www-form-urlencoded;charset=UTF-8",
                    headers: {'X-CSRFToken': token },
                    data: JSON.stringify(data),
                    error: errorAjax,
                    beforeSend: start_load_pic,
                    complete: stop_load_pic,
                    success: function (response, status) {
                        if (!status == 200) {
                            return false;
                            // showErrorInfo(data.content);
                        }
                        else {
                            showSuccessNotic();
                            CLose_edit_server();
                            window.location.reload();
                        }
                    }
                })
        }
    })
})

//TODO  server  handle excel about the server info  insert to db
$(function () {
//upload server excel filter & progressbar
    $('#drag-and-drop-zone').dmUploader({
        var token = get_global_csrf_token()
        url: handle_server_excel,
        headers: {'X-CSRFToken': token },
        dataType: 'json',
        allowedTypes: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        onInit:function () {
        $.danidemo.addLog('#demo-debug', 'default', 'Plugin initialized correctly');
    }
    ,
    onBeforeUpload: function (id) {
        $.danidemo.addLog('#demo-debug', 'default', 'Starting the upload of #' + id);

        $.danidemo.updateFileStatus(id, 'default', 'Uploading...');
    }
    ,
    onNewFile: function (id, file) {
        $.danidemo.addFile('#demo-files', id, file);
    }
    ,
    onComplete: function () {
        $.danidemo.addLog('#demo-debug', 'default', 'All pending tranfers completed');
    }
    ,
    onUploadProgress: function (id, percent) {
        var percentStr = percent + '%';

        $.danidemo.updateFileProgress(id, percentStr);
    }
    ,
    onUploadSuccess: function (id, data) {
        $.danidemo.addLog('#demo-debug', 'success', 'Upload of file #' + id + ' completed');

        $.danidemo.addLog('#demo-debug', 'info', 'Server Response for file #' + id + ': ' + JSON.stringify(data));

        $.danidemo.updateFileStatus(id, 'success', 'Upload Complete');

        $.danidemo.updateFileProgress(id, '100%');
    }
    ,
    onUploadError: function (id, message) {
        $.danidemo.updateFileStatus(id, 'error', message);

        $.danidemo.addLog('#demo-debug', 'error', 'Failed to Upload file #' + id + ': ' + message);
    }
    ,
    onFileTypeError: function (file) {
        $.danidemo.addLog('#demo-debug', 'error', 'File \'' + file.name + '\' cannot be added: must be an xls/xlsx');
    }
    ,
    onFileSizeError: function (file) {
        $.danidemo.addLog('#demo-debug', 'error', 'File \'' + file.name + '\' cannot be added: size excess limit');
    }
    ,
    /*onFileExtError: function(file){
     $.danidemo.addLog('#demo-debug', 'error', 'File \'' + file.name + '\' has a Not Allowed Extension');
     },*/
    onFallbackMode: function (message) {
        $.danidemo.addLog('#demo-debug', 'info', 'Browser not supported(do something else here!): ' + message);
    }
   })
});


//server info  table
$(function () {
    var table = document.querySelector('table');
    var token = get_global_csrf_token()
    table.GM({
        supportRemind: true
        , gridManagerName: 'test'
          , disableCache: true
        , isCombSorting: true
        , height: '300px'
        , supportAjaxPage: true
        , supportSorting: true
        , supportAutoOrder: false
        , supportRemind: false
        , supportExport: true
        // , supportAdjust: false
        , ajax_url: hostInputURL
        //fix  cors
			  ,ajax_headers: {'X-CSRFToken': token }
        , ajax_type: 'POST'
        , query: {pluginId: 1}
        , pageSize: 20
        , columnData: [{
            key: 'Ip',
            width: '120px',
            text: 'IP',
            sorting: 'IP'
        }, {
            key: 'Port',
            width: '50px',
            text: '端口',
            align: 'right',
        }, {
            key: 'Group',
            width: '100px',
            text: ' 主机组',
        }, {
            key: 'User',
            width: '100px',
            remind: '用户名',
            text: '用户名'
        }, {
            key: 'lg_type',
            width: '80px',
            remind: '登录方式',
            text: '登录方式'
        }, {
            key: 'Key',
            width: '100px',
            remind: '秘钥文件',
            text: '秘钥文件'
        }, {
            key: 'Pwd',
            width: '100px',
            remind: '密码',
            text: '密码',
            template: function (action, rowObject) {
                if(action != "N"){
                  return  '<i class="" style="position:static;"  tdpwd='+action+' >'+'*************'+'</i>';
                }else{
                  return action
                }
            }
        }, {
            key: 'US_SUDO',
            width: '80px',
            remind: '使用Sudo',
            text: '使用Sudo'
        }, {
            key: 'US_SU',
            width: '80px',
            remind: '使用Su',
            text: '使用SU'
        }, {
            key: 'SUDO',
            width: '80px',
            remind: 'SuDO密码',
            text: 'SUDO',
            template: function (action, rowObject) {
                if(action != "N"){
                  return  '<i class="" style="position:static;"  tdsudopwd='+action+' >'+'************'+'</i>';
                }else{
                  return action
                }
            }
        }, {
            key: 'SU',
            width: '80px',
            remind: 'Su密码',
            text: 'SU',
            template: function (action, rowObject) {
                if(action != "N"){
                  return  '<i class="" style="position:static;"  tdsupwd='+action+' >'+'************'+'</i>';
                }else{
                  return action
                }
            }
        }, {
            key: 'Status',
            width: '50px',
            remind: '状态',
            align: 'center',
            text: '状态',
            template: function (action, rowObject) {
                content = JSON.parse(action)
                if(typeof(content) != 'object'){
                  data = JSON.parse(content)
                  // console.log(data)
                  if(data.status == "failed"){
                    return '<span status="'+data.status+'"  sip="'+data.ip+'"  time="'+data.time+'" info="'+data.content+'" onclick="showServerStatus(this)" class="label label-danger">失败</span>'
                  }else if(data.status=="success") {
                    return '<span status="'+data.status+'"  sip="'+data.ip+'"  time="'+data.time+'" info="'+data.content+'"  class="label label-success" onclick="showServerStatus(this)">正常</span>'
                  }else {
                    return '<span class="fa-refresh   fa-spin  fa fa-lg  fa-li" status="'+data.status+'" sip="'+data.ip+'" time="'+data.time+'" info="'+data.content+'" onclick="showServerStatus(this)" style="position:static"></span>'
                  }
                }else{
                  if(content.status == "checking"){
                    return '<span class="fa-refresh fa-spin fa fa-lg fa-li" status="'+content.status+'" sip="'+content.ip+'" time="'+content.time+'" info="'+content.content+'" onclick="showServerStatus(this)" style="position:static"></span>'
                  }else if(content.status=="success"){
                    return '<span status="'+content.status+'" sip="'+content.ip+'"  time="'+content.time+'" info="'+content.content+'"  class="label label-success" onclick="showServerStatus(this)">正常</span>'
                  }else{
                    return '<span status="'+content.status+'"  sip="'+content.ip+'"  time="'+content.time+'" info="'+content.content+'" onclick="showServerStatus(this)" class="label label-danger">失败</span>'
                  }
                }
            }
        }, {
            key: 'bz',
            width: '100px',
            remind: '备注',
            text: '备注'
        }, {
            key: 'id',
            remind: 'the action',
            width: '80px',
            text: '操作',
            template: function (action, rowObject) {
                return '<button onclick="EditServer(this)"   class="edit-server btn btn-success btn-xs glyphicon glyphicon-edit " style="margin-left: 1px" tag="' + action + '"></button>'
                    + '<button onclick="DelServer(this)" class="del-server btn btn-danger btn-xs glyphicon glyphicon-trash" style="margin-left: 1px" tag="' + action + '"></button>'
                    + '<button onclick="Connect_terminal(this)" class="del-server btn btn-warning btn-xs glyphicon glyphicon-console" style="margin-left: 1px" tag="' + action + '"></button>';
            }
        }
        ]
        // 分页前事件
        , pagingBefore: function (query) {
            console.log('pagingBefore', query);
        }
        // 分页后事件
        , pagingAfter: function (data) {
            console.log('pagingAfter', data);
        }
        // 排序前事件
        , sortingBefore: function (data) {
            console.log('sortBefore', data);
        }
        // 排序后事件
        , sortingAfter: function (data) {
            console.log('sortAfter', data);
        }
        // 宽度调整前事件
        , adjustBefore: function (event) {
            console.log('adjustBefore', event);
        }
        // 宽度调整后事件
        , adjustAfter: function (event) {
            console.log('adjustAfter', event);
        }
        // 拖拽前事件
        , dragBefore: function (event) {
            console.log('dragBefore', event);
        }
        // 拖拽后事件
        , dragAfter: function (event) {
            console.log('dragAfter', event);
        }
    });

    // 日期格式化,不是插件的代码,只用于处理时间格式化
    Date.prototype.format = function (fmt) {
        var o = {
            "M+": this.getMonth() + 1, //月份
            "D+": this.getDate(), //日
            "d+": this.getDate(), //日
            "H+": this.getHours(), //小时
            "h+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        if (/([Y,y]+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    };

    // 绑定搜索事件
    document.querySelector('.search-action').addEventListener('click', function () {
        var _query = {
            name: document.querySelector('[name="name"]').value,
            info: document.querySelector('[name="info"]').value,
            url: document.querySelector('[name="url"]').value
        };
        table.GM('setQuery', _query).GM('refreshGrid', function () {
            console.log('搜索成功...');
        });
    });

    // 绑定重置
    document.querySelector('.reset-action').addEventListener('click', function () {
        document.querySelector('[name="name"]').value = '';
        document.querySelector('[name="info"]').value = '';
        document.querySelector('[name="url"]').value = '';
    });
})


//Edit get the this line  value   to  editpage.
function EditServer() {
    $('.cd-content').one('click', '.edit-server', function () {
        var td = $(this).parent().prevAll();
        var IP = td[12].textContent;
        var ID = IP
        var PORT = td[11].textContent;
        var GROUP = td[10].textContent;
        var USER = td[9].textContent;
        var LG_type = td[8].textContent;
        var KEY = td[7].textContent;
        $("#opt_tag")[0].value = 'UPDATE'
        console.log($("#opt_tag")[0].value)
        // var OPT_TAG = $("#opt_tag")[0].value
        // 获取星号背后的真实的密码
        if(td[6].textContent != "N"){
          var PASSWORD = td[6].children[0].getAttribute("tdpwd");
        }else{
          var PASSWORD = td[6].textContent;
        }
        if(td[5].textContent != "N"){
          var SUDO = td[3].children[0].getAttribute("tdsudopwd");
          var US_SUDO = "Y"
        }else{
          var US_SUDO = td[5].textContent;
          var SUDO = td[3].textContent;
        }
        if(td[4].textContent != "N"){
          var SUDO = td[3].children[0].getAttribute("tdsupwd");
          var US_SU = "Y";
        }else{
          var US_SU = td[4].textContent;
          var SU = td[2].textContent;
        }
        var STATUS = td[1].textContent;
        var BZ = td[0].textContent;
        console.log(td);
        console.log(LG_type)

        document.getElementById("id").value = ID;//ip
        document.getElementById("ip").value = IP;//ip
        document.getElementById("port").value = PORT;
        document.getElementById("group").value = GROUP;
        document.getElementById("user").value = USER;

        if(LG_type == "秘钥方式"){
            $('#choice_lg').css("display", "block");
            $('.key').css("display", "block");
            // password input hidden
            $('#password').css("display", "none");
            $('#passwd').css("display", "none");
            $('#choice_lg3').css("display", "block");
            // reset  the choose  when it  click edit the server  page
            $("#lg_choice").get(0).options[1].selected = true;
            console.log(KEY)
            put_key_chooice();
            $("#keyfiles").get(0).value = KEY
        } else {
            //hide  key input
            $('#password').css("display", "block");
            $('#passwd').css("display", "block");
            $('#choice_lg').css("display", "none");
            $('.key').css("display", "none");
            $('#choice_lg3').css("display", "none");
            $("#lg_choice").get(0).options[0].selected = true;
        }
        document.getElementById("passwd").value = PASSWORD;
        document.getElementById("BZ").value = BZ;
        if(US_SUDO == 'Y'){
            $('#us_sudo').removeClass("glyphicon-unchecked").addClass("glyphicon-check");
            document.getElementById("sudoPassword").removeAttribute("disabled", true);
            // document.getElementById("us_sudo").textContent = US_SUDO;
            document.getElementById("sudoPassword").value = SUDO;
        }else{
            $('#us_sudo').removeClass("glyphicon-check").addClass("glyphicon-unchecked");
            document.getElementById('sudoPassword').setAttribute("disabled", true)
        }
        if(US_SU == 'Y'){
            $('#us_su').removeClass("glyphicon-unchecked").addClass("glyphicon-check");
            document.getElementById("suPassword").removeAttribute("disabled", true);
            // document.getElementById("us_su").textContent = US_SU;
            document.getElementById("suPassword").value = SU;
        }else{
            $('#us_su').removeClass("glyphicon-check").addClass("glyphicon-unchecked");
            document.getElementById('suPassword').setAttribute("disabled", true)
        }
        $('#im_host').show();
    })
}

//when the edited server  to close  windnow
function CLose_edit_server(){
        $('#im_host').slideDown('slow').hide();
}
function  put_key_chooice (){
  var opt = $('#lg_choice').val();
  if (opt == 'key') {
      $('#choice_lg').css("display", "block");
      $('.key').css("display", "block");
      // password input hidden
      $('#password').css("display", "none");
      $('#passwd').css("display", "none");
      $('#choice_lg3').css("display", "block");
      // click  key option  will push  key  to chooice
      var keyfile =  window.key_file_list
      $("#keyfiles").children().remove()
      for (x=0;x<keyfile.length;x++){
        // console.log(keyfile[x])
        var key =  keyfile[x]
        $("#keyfiles").append("<option value='"+key.keyfile+"'>"+key.keyfile+"</option>")
      }
      console.log($(".key"));
  } else {
      $('#password').css("display", "block");
      $('#passwd').css("display", "block");
      $('#choice_lg').css("display", "none");
      $('.key').css("display", "none");
      $('#choice_lg3').css("display", "none");
  }
}
function showServerStatus(e){
  // console.log(e)
  $("#showServerCheckInfo").show("fast");
  document.getElementById("showCheckHost").textContent=e.getAttribute("sip");
  document.getElementById("showCheckTime").textContent=e.getAttribute("time");
  var status=e.getAttribute("status");
  var showCheckStatus= document.getElementById("showCheckStatus");
  var span=document.createElement("span");
  if(status=="success"){
      span.className="label label-success";
      span.textContent="正常"
  }
  else{
      span.className="label label-danger";
      span.textContent="失败"
  }
  $("#showCheckStatus").children().remove();//删除此前的状态，避免重复
  showCheckStatus.appendChild(span);//加入新的状态信息
  document.getElementById("showCheckInfo").textContent=e.getAttribute("info");
  $("#showServerCheckInfo").show("fast");
  // startShadow();
}

function DelServer() {
    $('.cd-content').one('click', '.del-server', function () {
         var td = $(this).parent().prevAll();
         var token = get_global_csrf_token()
        //  console.log(td)
        var ip = td[12].textContent;
        console.log(id,ip);
        $.ajax({
            type:"POST",
            url: delserverURL,
            headers: {'X-CSRFToken': token },
            data:JSON.stringify({"ip":ip}),
            error: errorAjax,
            beforeSend: start_load_pic,
            complete: stop_load_pic,
            success: function (response, status) {
                if (!status == 200) {
                    return false;
                    // showErrorInfo(data.content);
                }
                else {
                    showSuccessNotic();
                    CLose_edit_server();
                    window.location.reload(); // del success  will reload  server page;
                }
            }

        })
    })
}

function Connect_terminal(){
  $('.cd-content').one('click', '.del-server', function () {
       var td = $(this).parent().prevAll();
       var token = get_global_csrf_token()
       var id = this.getAttribute('tag')
      //  console.log(td)
      var ip = td[12].textContent;
      // console.log(this.getAttribute('tag'));
      $.ajax({
          type:"GET",
          url: create_server + id,
          // headers: {'X-CSRFToken': token },
          error: errorAjax,
          success: function (response, status) {
              if (!status == 200) {
                showErrorInfo('无法获取目标主机的连接信息，请检查接口！')
                console.log(response)
                  return false;
              }
              else {
                var options = {
                  host: response.ip,
                  port: response.port.toString(),
                  username: response.user,
                  password: response.pwd,
                  lg_type: response.login_type,
                  key: response.key
                }
                // console.log(options)
                openTerminal(options)
              }
          }

      })
  })
}


function openTerminal(options) {
    var client = new WSSHClient();
    var term = new Terminal({cols: 80, rows: 24, screenKeys: true, useStyle:true}); // setting terminal size
    term.on('data', function (data) {
        client.sendClientData(data);
    });
    term.on('title', function (title) {
      // console.log(title) // hostname
      $('#connect_server').css('display','block')
      $('#connect_server')[0].textContent = title
    });
    term.open();
    $('.terminal').detach().appendTo('#term');
    term.write('Connecting...');
    client.connect({
        onError: function (error) {
            term.write('Error: ' + error + '\r\n');
            console.debug('error happened');
        },
        onConnect: function () {
            client.sendInitData(options);
            client.sendClientData('\r');
            console.debug('connection established');
        },
        onClose: function () {
            term.write("\rconnection closed")
            console.debug('connection reset by peer');
        },
        onData: function (data) {
            term.write(data);
            console.debug('get data:' + data);
        }
    })
}
function server_excel() {
    var name = document.getElementById('in_excel').value;
    var fileName = name.substring(name.lastIndexOf(".") + 1).toLowerCase();
    if (fileName != "xls" && fileName != "xlsx") {
        alert("请选择execl格式文件上传！");
        name.outerHTML = name.outerHTML;
        return
    }
}
