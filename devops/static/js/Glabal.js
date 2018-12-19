/**
 * Created by wupeijin on 17/3/28.
 */
var IndexURL = '/index'
var logoutURL = '/logout'
var CmDURL = '/cmd'
var ScriptURL = '/script'
var CrondURL = '/crond'
var UploadKeyURL = '/UploadKey'
var PushCodeURL = '/PushCode'
var fileupURL = '/fileup'
var filedownURL = '/filedown'
var remotefileURL = '/remotefile'
var docker_repoURL = '/docker_repo'
var docker_containerURL = '/docker_container'
var addserverURL = "/add_server_list";
var delserverURL = "/del_server_list";
var loadServerListURL = "/load_server_list";
var getFileTransProgressURL = '/get_filetrans_progress';
var uploadFileURL = '/upload/test';
var fileTransURL = "/filetrans/upload/";
var hostInputURL = '/host_input';
var handle_server_excel = '/handle_server_excel'
var remoteDownloadFileURL = "/filetrans/download/";
var createTGZPackURL = "/create_tgz_pack/";
var myCommandHistoryURL =  "/my_command_history/";
var executeCommandURL = "/execute_command/";
var getCommandResultURL =  "/get_command_result/";
var uploadScriptToServer = "/upload_script/";
var scriptListURL =  "/scripts_list/";
var getScriptContentURL =  "/get_script_content/";
var writeScriptContentURL = "/write_script_content/";
var deleteScriptURL = "/delete_script/";
var scriptInitURL = "/script_init/";
var saveCrondToServerURL = "/save_crontab_to_server/";
var getCrondListURL = "/get_crontab_list/";
var deleteCrondListURL = "/delete_crontab_list/";
var getRemoteFileListURL =  "/get_remote_file_list/";
var addRemoteFileURL =  "/add_remote_file/";
var getRemoteFileContentURL = "/get_remote_file_opt/";
var deleteRemoteFileListURL = "/delete_remote_file_list/";
var writeRemoteFileContentURL = "/write_remote_file_opt/";
var keyAdminURL =  "/show_keyfile_list/";
var deleteKeyFileURL = "/delete_keyfile/";
var uploadKeyFileURL = "/upload_keyfile/";
var SubmitRepoURL = "/docker_repo_list";
var LoadRepoListContentURL = "/docker_repo_content";
var deleteRepotURL = "/docker_repo_del"
var DockerIMG = "/docker_img"
var DockerIMGTAGS = "/docker_imagestags?image="
var DockerIMGTAGS_HISTORY = "/docker_tagshistory?image="
var DockerIMGDEL = "/docker_delimg"
var ContainerNode = "/Container_Node"
var ContainerNodeList = "/ContainerNodeList"
var ContainerDelNode = "/ContainerDelNode"
var Docker_pulled_images =  "/images"
var Docker_search_images = "/images/search"
var Docker_pull_images = "/images/pull/"
var deleteImgURL = "/images/remove"
var Container_Ava_Ip = "/Container_Ava_Ip"
var Create_Container_Net = "/Create_Container_Net"
var deleteCTNetRange = "/Container_Net_range/remove"
var Create_CTN_Service = "/images/launch/"
var CheckContainerURL = "/checkcontainer"
var Container_Service = "/Container_Service"
var ContainerSPURL = "/Container_Stop"
var ContainerSTURL = "/Container_Start"
var ContainerRSURL = "/Container_ReStart"
var ContainerRMURL = "/Container_Remove"
var ContainerBKURL = "/Container_backup"
var PlayContainer = "/Container_play"
var ContainerStatusURL = "/Container_status/"
var Get_container_backup = "/Get_Container_backup/"
var Remove_container_backup = "/Remove_container_backup/"
var Get_container_process = "/Get_container_process/"
var Get_container_filediff =  "/Get_container_filediff/"
var Container_terminal = "/Container_terminal/"
var Container_mem = "/Container_mem/"
var Container_mem_percentage = "/Container_mem_percentage/"
var Container_cpuusage  = "/Container_cpuusage/"
var Container_net = "/Container_net/"
var Email_URL = "/email"
var work_order_URL = "/new_work_order"
var work_order_listURL = "/work_order_list"
var CalendarURL = "/work_Calendar"
var Work_paln_URL = "/work_Plan"
var work_plan_listURL = "/work_plan_list"
var get_work_plan_listURL = "/get_work_plan_list"
var del_work_plan_ops = "/del_work_plan_ops"
var del_work_order = "/del_work_order"
var save_hook_info = "/save_hook_info"
var del_hook_info = "/del_hook_info"
var get_hook_info = "/get_hook_info"
var hook_socket_host = window.location.host
var hook_history_url = "/get_hook_history"
var update_work_order_status_url = "/update_work_order_status"
var work_order_finish_notify = "/work_order_finish_notify"
var Ansible_easy_module = "/easy_module"
var Ansible_playbook_config = "/playbook_config"
var Ansible_playbook_list = "/playbook_list"
var Get_Group_api = '/api/groups/'
var Get_user_api = '/api/users/'
var ansible_run  = '/easy_run'
var ansible_model = '/callback_model_result'
var playbook_add = '/playbook/add'
var playbook_file_show = '/playbook/file/'
var playbook_run = '/playbook/run/'
var del_playbook = '/api/playbook/'
var assets_config = '/assets_config'
var create_idc =  '/api/idc/'
var create_service =  '/api/service/'
var create_business = '/api/business/'
var create_zone = '/api/zone/'
var create_line = '/api/line/'
var create_raid = '/api/raid/'
var assets_status = '/api/status/'
var assets_add = '/assets_add'
var create_server = '/api/server/'
var create_net = '/api/net/'
var assets_list = '/assets_list'
var assets  = '/api/assets/'
var assets_facts = '/assets_facts'
var global_config = '/log_global_config'
var global_log = '/global_log'
var Distribution_docker_engine = '/get_docker_engine_info'
var zabbixhost = '/zabbix_host'
var zabbixmemory = '/api/zabbixmemory/'
var zabbixdisk = '/api/zabbixdisk/'
var zabbixcpu = '/api/zabbixcpu/'



function get_global_csrf_token (){
  token = document.getElementsByName('csrfmiddlewaretoken')[0].value
  return token
}


function errorAjax(XMLHttpRequest, textStatus, errorThrown) {
    status_code = XMLHttpRequest.status;
    var content = XMLHttpRequest.responseText || "";
    var mysqlSock = content.match("\/.*sock");
    if (content.match("Can.*connect to local.*server through socket")) {
        content = "内部系统错误";
    }
    else if (content.match("Access.*denied")) {
        content = "内部系统错误";
    }
    else if (/Error 111 connecting to.*Connection refused/.test(content)) {
        content = "内部系统错误";
    }
    else {
        content = "SSH已经响应,但是出现意外的错误";
    }
}
// interval
function mem_usage() {
  var token = get_global_csrf_token()
  mem_timer = setInterval(function(){
    $.ajax({
       type: "post",
       headers: {
         'X-CSRFToken': token
       },
       url: Container_mem,
       data: document.getElementById("myTab").getElementsByClassName("active")[0].textContent,
       dataType: "json",
       success : function(data){
         // console.log(JSON.parse(data))
         data = JSON.parse(data)
        //  console.log($('.cpu_percentage').highcharts())
         //x one line
        $('.memory').highcharts().series[0].addPoint(data[0],true,true)
        //x two line
        $('.memory').highcharts().series[1].addPoint(data[1],true,true)
       }
     });
  },3000)
}
function mem_percentage() {
  var token = get_global_csrf_token()
  mem_percentage_timer = setInterval(function(){
    $.ajax({
        headers: {
          'X-CSRFToken': token
      },
       type: "post",
       url: Container_mem_percentage,
       data: document.getElementById("myTab").getElementsByClassName("active")[0].textContent,
       dataType: "json",
       success : function(data){
         // console.log(data)
         data = JSON.parse(data)
         // console.log(data)
        //  console.log($('.areaChartTwoWay').highcharts())
        $('.mem_percentage').highcharts().series[0].addPoint(data,true,true)
       }
     });
  },3000)
}
function cpu() {
  var token = get_global_csrf_token()
  cpu_timer = setInterval(function(){
    // tooggle different  contianer_id  show different status
  // console.log(document.getElementById("myTab").getElementsByClassName("active")[0].textContent)
    $.ajax({
       type: "post",
        headers: {
        'X-CSRFToken': token
        },
       url: Container_cpuusage,
       data: document.getElementById("myTab").getElementsByClassName("active")[0].textContent,
       dataType: "json",
       success : function(data){
         // console.log(JSON.parse(data))
         data =  JSON.parse(data)
        //  console.log($('.areaChartTwoWay').highcharts())
        $('.cpu').highcharts().series[0].addPoint(data,true,true)
       }
     });
  },3000)
}
function network() {
  var token = get_global_csrf_token()
  network_timer = setInterval(function(){
    $.ajax({
       type: "post",
       headers: {
        'X-CSRFToken': token
        },
       url: Container_net,
       data: document.getElementById("myTab").getElementsByClassName("active")[0].textContent,
       dataType: "json",
       success : function(data){
         // console.log(JSON.parse(data))
         data = JSON.parse(data)
        //  console.log($('.cpu_percentage').highcharts())
         //x one line
        $('.network').highcharts().series[0].addPoint(data[0],true,true)
        //x two line
        $('.network').highcharts().series[1].addPoint(data[1],true,true)
      },
      error: function(response){
        console.log(response)
      }
     });
  },3000)
}

//add  action  success notice
function showSuccessNotic() {
    var element = "";
    if (window.innerWidth > 737) {
        $("#showSuccessNotic").slideDown("fast");
      }
    else {
        // var t = document.getElementById("showSuccessNotice");
        // t.style.display = "block";
        $("#showSuccessNotic").css("display","block");
    }
    // element = t;
    setTimeout(function () {
        //element.style.display = "none"
        $("#showSuccessNotic").slideUp("slow");
    }, 1000)//三秒钟过后，自动消失

}
//when the jquery confict the mail pic will display none so need to  timeout excute  it
function force_show_mail (){
  document.getElementById('mail').style.display = 'block'
  // var sobj = document.createElement('script');
  // sobj.type = "text/javascript";
  // sobj.src = '/static/js/headimg.js';
  // var headobj = document.getElementsByTagName('head')[0];
  // console.log(headobj)
  // headobj.appendChild(sobj);
}
//loading ....
function start_load_pic() {
    document.getElementById("loadPic").style.display = "block";
    //document.getElementById("shadow").style.display = "block";

}
// //loading ....
function stop_load_pic() {
    document.getElementById("loadPic").style.display = "none";
    //document.getElementById("shadow").style.display = "none";
}

function format_unicode(data){
   var unicode = data.charCodeAt().toString(16);
   var str = JSON.parse('"'+unicode+'"')
   return str
}
$(function(){
    initGetServersList();
        document.getElementById("closeButton").onclick = function () {
        $("#showErrorInfoDIV").hide("fast");
        document.getElementById("shadow").style.display = "none";
    }
})
$(function(){
    document.getElementById("out").onclick = function(){
       window.location.href = logoutURL
    }
})
$(function(){
  document.getElementById("logoredirect").onclick = function(){
     window.location.href = IndexURL
  }
})

function initGetServersList() {
    $.ajax({
        "url": loadServerListURL,
        // "dataType": "json",
        "success": function (data) {
            if (!responseCheck(data)) {
                showErrorInfo(data.content);
            }
            else {
                window.allServersList = responseCheck(data);// global server list
                // console.log(window.allServersList);
                console.log('接收所有服务器');
            }
        },
    });
}

//global  Node list
// {"data": {"NodeIp": "fff", "time": "2017-08-14 13:36:18", "NodeName": "ffff", "NodeId": "krviixpq8q"}}
$(function(){
  getJSON(ContainerNodeList).then(function(data){
        // data = data.replace(/[\\]/g,"");
        data = JSON.parse(data)
        // console.log(data)
        // //n 得到下标
        $.map(data,function (i,n ){
            window.ContainerNodeList = i
            // console.log(window.ContainerNodeList )
          // for(x=0;x<i.length;x++){
          // //   // console.log(i[x])
          //   window.ContainerNodeList = i[x]
          //   console.log(  window.ContainerNodeList)
          // //   console.log(window.ContainerNodeList)
          // //   // createNode(i[x])
          // }
        })
  });
})
// Server check status  & check has ssh container
function sshCheck(sid){
    //用来ssh登录检查服务器状态的，新建和修改的服务器使用，在请求之前就修改状态图标
    $("#"+sid).children().remove();//remove before status
    var i=document.createElement("i");
    i.className="fa-refresh   fa-spin  fa fa-lg  fa-li";
    i.style.position="static";
    document.getElementById(sid).appendChild(i);

    jQuery.ajax({
        "url":sshCheckURL,
        "dataType":"jsonp",
        "data":{"sid":sid},
        "success":function (data) {
            createServerStatusTd(sid,data);

        }
    });
}

// check container status
function checkcontainer(sid,sip){
    // console.log(sip)
    $("#"+sip).children().remove();//remove before status
    var i = document.createElement("i");
    i.className="fa-refresh   fa-spin  fa fa-lg  fa-li";
    i.style.position="static";
    document.getElementById(sip).appendChild(i);

  jQuery.ajax({
        "url":CheckContainerURL,
        "dataType":"jsonp",
        "data":{"sid":sid,"sip":sip},
        "success":function (data) {
            createServerStatusTd(sip,JSON.parse(data));
        }
    });
}
//add click Server status detail info
function createServerStatusTd(sip,data){
   //remove status  tag
    console.log(data.button)
    if(data.button == "start"){
      // console.log($("#"+sip).nextAll().children()[1].className="btn btn-xs btn-default glyphicon glyphicon-stop")
      $("#"+sip).nextAll().children()[1].className="btn btn-xs btn-default glyphicon glyphicon-stop"
    }else{
      $("#"+sip).nextAll().children()[1].className="btn btn-xs btn-default glyphicon glyphicon-play"
    }
    $("#"+sip).children().remove()
    var span=document.createElement("span");
    span.setAttribute("time",data.time);
    span.setAttribute("status",data.status);
    span.setAttribute("info",data.content);
    span.setAttribute("ip",data.ip);
    //绑定点击显示详细信息
    span.onclick=function(){
        $("#showServerCheckInfo").show("fast");
        document.getElementById("showCheckHost").textContent=this.getAttribute("ip");
        document.getElementById("showCheckTime").textContent=this.getAttribute("time");
        var status=this.getAttribute("status");
        var showCheckStatus= document.getElementById("showCheckStatus");
        var span=document.createElement("span");
        if(data.status=="success"){
            span.className="label label-success";
            span.textContent="正常"
        }
        else{
            span.className="label label-danger";
            span.textContent="失败"
        }
        $("#showCheckStatus").children().remove();//删除此前的状态，避免重复
        showCheckStatus.appendChild(span);//加入新的状态信息
        document.getElementById("showCheckInfo").textContent=this.getAttribute("info");
        $("#showServerCheckInfo").show("fast");
        // startShadow();
    }
    if(data.status=="success"){
        span.textContent="正常";
        span.className="label label-success";
        document.getElementById(sip).appendChild(span);
    }
    else if(data.status=="failed"){
        span.textContent="失败";
        span.className="label label-danger";
        document.getElementById(sip).appendChild(span);
        $("[data-toggle='tooltip']").tooltip();//绑定信息提示工具
    }
    else if(data.status=="checking"){
        var i=document.createElement("i");
        i.className="fa-refresh   fa-spin  fa fa-lg  fa-li";
        i.style.position="static";
        document.getElementById(sip).appendChild(i);
    }
}
//load owner has container service
$(function() {
      getJSON(Container_Service).then(function(data){
        // console.log(data);
        content = JSON.parse(data);
        if (content.status) {
                    window.owner_container = content
            // $.map(content, function(i, n) {
            //     for (x = 0; x < i.length; x++){
            //         ServiceInfo = JSON.parse(i[x]);
            //         console.log(ServiceInfo)
            //         window.owner_container =  ServiceInfo
            //     }
            // })
        }
      })
})


//load pulled images
$(function(){
  $.ajax({
      "url": Docker_pulled_images,
      "dataType": "jsonp",
      "beforeSend": start_load_pic,
      "error": errorAjax,
      "complete": stop_load_pic,
      "success": function (data) {
        //  console.log(JSON.parse(data));
        data = JSON.parse(data)
        console.log(data)
        if (data.status == false){
              showErrorInfo(data.content);
        } else {
           window.pulled_images = data.content
          //  console.log(data.content)
              // createImageLine(data.content);
        }
      }
  })
})
//load docker images
$(function(){
  $.ajax({
      "url": Docker_pulled_images,
      "dataType": "jsonp",
      "beforeSend": start_load_pic,
      "error": errorAjax,
      "complete": stop_load_pic,
      "success": function (data) {
        //  console.log(JSON.parse(data));
        data = JSON.parse(data)
        console.log(data)
        if (data.status == false){
              showErrorInfo(data.content);
        } else {
           window.pulled_images = data.content
          //  console.log(data.content)
              // createImageLine(data.content);
        }
      }
  })
})
//ajax callback to check data to do something
function responseCheck(data) {
    // console.log(data);
    try {
        data = JSON.parse(data);
        // console.log(data.content);
        // console.log(data);
        return data.content;
    }
    catch (e) {
        console.log(e);
    }
    // document.getElementById("loadPic").style.display = "none";
    if (data.status === "login") {
        if (version === "dev") {
            alert("请登录");
        }
        else {
            window.location.href = "/";
        }
    }
    if (data.status === true) {
        return true;

    }
}


function loadKeyFileAdminHTML(){
    window.location.reload();
}


function showErrorInfo(info) {
    document.getElementById("loadPic").style.display = 'none';
    $("#showErrorInfoDIV").show("fast");
    var showWarnContent = document.getElementById("showWarnContent");
    showWarnContent.innerHTML = info;
    document.getElementById("shadow").style.display = "block";
}


function startShadow() {
    document.getElementById("shadow").style.display = "block";
}
function stopShadow() {
    document.getElementById("shadow").style.display = "none"

}
function postJSON(url, data) {
    return new Promise( (resolve, reject) => {
        var xhr = new XMLHttpRequest()
        var token = get_global_csrf_token()
        xhr.open("POST", url, true)
        xhr.setRequestHeader("X-CSRFToken", token);
        xhr.send(JSON.stringify(data))
        xhr.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    $('#NewContainerShow').hide()
                    $('#DelBxCheck').hide()
                    resolve(JSON.parse(this.responseText), this)
                } else {
                    var resJson = { code: this.status, response: this.response }
                    showErrorInfo(resJson.code)
                    reject(resJson, this)
                }
            }
        }

    })
}
(function(global) {
    var common = {};
    common.getDate = function() {
        var date = new Date();
        var year = date.getFullYear();
        var month = ("00" + (date.getMonth()+1)).substr(-2);
        var day = ("00" + date.getDate()).substr(-2);
        return {
            'year'  : year,
            'month' : month,
            'day'   : day
        }
    }
    global.common = common;
})(this);

function  Rmspace(content){
    data=content.replace(/[\n\t' ']/g,"");
    return data
  }

//remove  /n /t
function  Rmtab(content){
    data=content.replace(/[\n\t' ']/g,"");
    return data
}
/*
  dateTimeStamp is unixtime 1494174131000
  converet  unixtime to unicode description
*/
function timetounicode(dateTimeStamp) {
  var minute = 1000 * 60; //把分，时，天，周，半个月，一个月用毫秒表示
  var hour = minute * 60;
  var day = hour * 24;
  var week = day * 7;
  var halfamonth = day * 15;
  var month = day * 30;

  var now = new Date().getTime(); //获取当前时间毫秒
  var diffValue = now - dateTimeStamp; //时间差

  if (diffValue < 0) {
    return;
  }

  var minC = diffValue / minute; //计算时间差的分，时，天，周，月
  var hourC = diffValue / hour;
  var dayC = diffValue / day;
  var weekC = diffValue / week;
  var monthC = diffValue / month;

  if (minC >= 1) {
    result = " " + parseInt(minC) + "分钟前"
  } else if (hourC >= 1) {
    result = " " + parseInt(hourC) + "小时前"
  } else if (dayC >= 1) {
    result = " " + parseInt(dayC) + "天前"
  } else if (weekC >= 1) {
    result = " " + parseInt(weekC) + "周前"
  } else if (monthC >= 1) {
    result = " " + parseInt(monthC) + "月前"
  } else {
    result = "刚刚";
  }

  return result;
}

/*
str time to unixtime
*/
function  strtimetounix(str){
    str = new Date(Date.parse(str.replace(/-/g, "/")))
    str = str.getTime();
    return str
}
/*
 hook status
*/
function   hook_status(status){
    status = parseInt(status);
    let text, color;
    if (status == 1) {
      text = '等待';
      color = 'blue';
    }
    else if (status == 2) {
      text = '执行';
      color = 'yellow';
    }
    else if (status == 3) {
      text = '失败';
      color = 'red';
    }
    else if (status == 4) {
      text = '成功';
      color = 'green';
    }
    else if (status == 5) {
      text = '异常';
      color = 'red';
    }
    else {
      text = '未知';
      color = 'grey';
    }
    return  {"text":text,"color":color}
}

//{status: 200, result: { default : "{"Netrange": "88.99.1.0/28", "available": 253, "Nodename": "default", "netname": "fff"}}
function getJSON (url) {
    return new Promise( (resolve, reject) => {
        var xhr = new XMLHttpRequest()
        xhr.open('GET', url, true)
        xhr.setRequestHeader("Content-type", "application/json  charset=UTF-8");
        xhr.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    var response = JSON.parse(xhr.responseText);
                    resolve(response);
                    // console.log(response);
                } else {
                    var resJson = { code: this.status, response: this.response }
                    reject(resJson, this)
                }
            }
        }
        xhr.send()
    })
}

function  get_group() {
   getJSON(Get_Group_api).then(function(data){
     window.group_resource = data
   })
}

function  get_user() {
   getJSON(Get_user_api).then(function(data){
     window.user_resource = data
   })
}
function showKeyFileTable(){
    jQuery.ajax({
        "url":keyAdminURL,
        "dataType":"jsonp",
        "error":errorAjax,
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "success":function(data){
            if(!data.status){
                showErrorInfo(data.content);
                return false;
            }
            else{
                // console.log(data.content)
                window.key_file_list=data.content;//[]
                // for(var i=0;i<window.key_file_list.length;i++){
                //     line=window.key_file_list[i];
                //     createKeyFileTbody(line.keyfile);
                // }
            }
        }
    });
}

function load_email_content(){
  getJSON(Email_URL).then(function(data){
     window.emailcontent = JSON.parse(data)
    //  console.log(window.emailcontent)
     //take a subect to email  title and take to  new push order
     window.Emailsubject = window.emailcontent.content.split('\n')[3].replace('Subject',"标题")
  })
}
//getting time
function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
    return currentdate;
}
/*
get the  ops  for the day and push events into  a array
[
  {
    title: xxx,
    start: xxx,
    end:  xxxx
  }
]
*/
$(function (){
   getJSON(get_work_plan_listURL).then(function(data){
      window.planlist =  JSON.parse(data)
      Now = getNowFormatDate()
      window.plan_events =  []
      window.today_work_ops = []
      for(let i in window.planlist){
        window.plan = JSON.parse(window.planlist[i]);
        window.plan_events.push({"title": window.plan.title, "start": window.plan.start})
        if(window.plan.start == Now){
           window.today_work_ops.push(window.plan.title)
          //  ['a','b','c']
          // console.log(window.plan.title)
        }
      }
        console.log(window.today_work_ops)
   })
})


$(function(){
     showKeyFileTable();
     load_email_content();
   //show the setting of owner configure
   $('#mail').toggle(function(){
     // load_email_content();
        var storage = window.localStorage
        if(localStorage.hasOwnProperty('emmmm_pwd')){
          var em_pwd = storage.getItem("emmmm_pwd")
          postJSON(Email_URL, em_pwd).then(function(data){
            $('#div2').slideDown("fast");
            document.getElementsByClassName("triangle")[0].style.display = 'none';
          })
        }else{
          document.getElementsByClassName("triangle")[0].style.display = 'block'
          // document.getElementsById("email_pwd")[0].style.display = 'block'
          // $("#email_pwd")[0].style.display = 'block'
          $('#get_email').on('click',function(){
             var em_pwd = $('#email_pwd').val()
             if(em_pwd != ''){
               storage.setItem("emmmm_pwd",em_pwd)
              //  console.log(storage["emmmm_pwd"])
              // console.log(em_pwd)
               postJSON(Email_URL, em_pwd).then(function(data){
                //  console.log(data)
                 $('#div2').slideDown("fast");
                 document.getElementsByClassName("triangle")[0].style.display = 'none';
               })
             }else{
                showErrorInfo("不输入正确的密码就不给你获取邮件!")
             }
          })
        }
    //  $('#div2').slideDown("slow");
         var oDiv=document.getElementById("div1");
         var oDiv2=document.getElementById("div2");
         var zhezhao=document.getElementById("zhezhao");
         var h2=oDiv2.getElementsByTagName("h2")[0];
         var pre=oDiv2.getElementsByTagName("pre")[0];
         var right=document.getElementById("right");
         var bottom=document.getElementById("bottom");
         var mouseStart={};
         var divStart={};
         var rightStart={};
         var bottomStart={};
         h2.textContent= window.Emailsubject
         content = window.emailcontent.content.replace("From","发件人").replace("To","收件人").replace("Cc","抄送").replace("Subject","标题")
         pre.textContent=content

         //往右拽
         right.onmousedown=function(ev)
         {
          var oEvent=ev||event;
          mouseStart.x=oEvent.clientX;
          mouseStart.y=oEvent.clientY;
          rightStart.x=right.offsetLeft;
          if(right.setCapture)
          {
           right.onmousemove=doDrag1;
           right.onmouseup=stopDrag1;
           right.setCapture();
          }
          else
          {
           document.addEventListener("mousemove",doDrag1,true);
           document.addEventListener("mouseup",stopDrag1,true);
          }
         };
         function doDrag1(ev)
         {
          var oEvent=ev||event;
          var l=oEvent.clientX-mouseStart.x+rightStart.x;
          var w=l+oDiv.offsetWidth;

          if(w<oDiv.offsetWidth)
          {
           w=oDiv.offsetWidth;
          }
          else if(w>document.documentElement.clientWidth-oDiv2.offsetLeft)
          {
           w=document.documentElement.clientWidth-oDiv2.offsetLeft-2;
          }
          oDiv2.style.width=w+"px";
         };
         function stopDrag1()
         {
          if(right.releaseCapture)
          {
           right.onmousemove=null;
           right.onmouseup=null;
           right.releaseCapture();
          }
          else
          {
           document.removeEventListener("mousemove",doDrag1,true);
           document.removeEventListener("mouseup",stopDrag1,true);
          }
         };
         //往下拽
         bottom.onmousedown=function(ev)
         {
          var oEvent=ev||event;
          mouseStart.x=oEvent.clientX;
          mouseStart.y=oEvent.clientY;
          bottomStart.y=bottom.offsetTop;
          if(bottom.setCapture)
          {
           bottom.onmousemove=doDrag2;
           bottom.onmouseup=stopDrag2;
           bottom.setCapture();
          }
          else
          {
           document.addEventListener("mousemove",doDrag2,true);
           document.addEventListener("mouseup",stopDrag2,true);
          }
         };
         function doDrag2(ev)
         {
          var oEvent=ev||event;
          var t=oEvent.clientY-mouseStart.y+bottomStart.y;
          var h=t+oDiv.offsetHeight;

          if(h<oDiv.offsetHeight)
          {
           h=oDiv.offsetHeight;
          }
          else if(h>document.documentElement.clientHeight-oDiv2.offsetTop)
          {
           h=document.documentElement.clientHeight-oDiv2.offsetTop-2;
          }

          oDiv2.style.height=h+"px";
         };
         function stopDrag2()
         {
          if(bottom.releaseCapture)
          {
           bottom.onmousemove=null;
           bottom.onmouseup=null;
           bottom.releaseCapture();
          }
          else
          {
           document.removeEventListener("mousemove",doDrag2,true);
           document.removeEventListener("mouseup",stopDrag2,true);
          }
         };
         //往左右同时拽
         oDiv.onmousedown=function(ev)
         {
          var oEvent=ev||event;
          mouseStart.x=oEvent.clientX;
          mouseStart.y=oEvent.clientY;
          divStart.x=oDiv.offsetLeft;
          divStart.y=oDiv.offsetTop;
          if(oDiv.setCapture)
          {
           oDiv.onmousemove=doDrag;
           oDiv.onmouseup=stopDrag;
           oDiv.setCapture();
          }
          else
          {
           document.addEventListener("mousemove",doDrag,true);
           document.addEventListener("mouseup",stopDrag,true);
          }
          zhezhao.style.display='block';
         };
         function doDrag(ev)
         {
          var oEvent=ev||event;
          var l=oEvent.clientX-mouseStart.x+divStart.x;
          var t=oEvent.clientY-mouseStart.y+divStart.y;


          var w=l+oDiv.offsetWidth;
          var h=t+oDiv.offsetHeight;

          if(w<oDiv.offsetWidth)
          {
           w=oDiv.offsetWidth;
          }
          else if(w>document.documentElement.clientWidth-oDiv2.offsetLeft)
          {
           w=document.documentElement.clientWidth-oDiv2.offsetLeft-2;
          }
          if(h<oDiv.offsetHeight)
          {
           h=oDiv.offsetHeight;
          }
          else if(h>document.documentElement.clientHeight-oDiv2.offsetTop)
          {
           h=document.documentElement.clientHeight-oDiv2.offsetTop-2;
          }

          oDiv2.style.width=w+"px";
          oDiv2.style.height=h+"px";
         };
         function stopDrag()
         {
          if(oDiv.releaseCapture)
          {
           oDiv.onmousemove=null;
           oDiv.onmouseup=null;
           oDiv.releaseCapture();
          }
          else
          {
           document.removeEventListener("mousemove",doDrag,true);
           document.removeEventListener("mouseup",stopDrag,true);
          }
          zhezhao.style.display='none';
         };
         //h2完美拖拽
         h2.onmousedown=function(ev)
         {
          var oEvent=ev||event;
          mouseStart.x=oEvent.clientX;
          mouseStart.y=oEvent.clientY;
          divStart.x=oDiv2.offsetLeft;
          divStart.y=oDiv2.offsetTop;
          if(h2.setCapture)
          {
           h2.onmousemove=doDrag3;
           h2.onmouseup=stopDrag3;
           h2.setCapture();
          }
          else
          {
           document.addEventListener("mousemove",doDrag3,true);
           document.addEventListener("mouseup",stopDrag3,true);
          }
          zhezhao.style.display='block';
         };
         function doDrag3(ev)
         {
          var oEvent=ev||event;
          var l=oEvent.clientX-mouseStart.x+divStart.x;
          var t=oEvent.clientY-mouseStart.y+divStart.y;
          if(l<0)
          {
           l=0;
          }
          else if(l>document.documentElement.clientWidth-oDiv2.offsetWidth)
          {
           l=document.documentElement.clientWidth-oDiv2.offsetWidth;
          }
          if(t<0)
          {
           t=0;
          }
          else if(t>document.documentElement.clientHeight-oDiv2.offsetHeight)
          {
           t=document.documentElement.clientHeight-oDiv2.offsetHeight;
          }
          oDiv2.style.left=l+"px";
          oDiv2.style.top=t+"px";
         };
         function stopDrag3()
         {
          if(h2.releaseCapture)
          {
           h2.onmousemove=null;
           h2.onmouseup=null;
           h2.releaseCapture();
          }
          else
          {
           document.removeEventListener("mousemove",doDrag3,true);
           document.removeEventListener("mouseup",stopDrag3,true);
          }
          zhezhao.style.display='none';
        };
   },function(){
     $('#div2').hide('fast');
     document.getElementsByClassName("triangle")[0].style.display = 'none'
   })
    $('#send_push_order').on('click',function(){
       postJSON(work_order_URL,{"title":window.Emailsubject}).then(function(data){
         if(data.errmsg =='ok'){
           showSuccessNotic()
           $('#div2').hide();
         }else{
           showErrorInfo("发送通知出现异常，请联系Jimmy!")
         }
       })
    })
    $("#ansible_easy_module").click(function(){
        window.location.href = Ansible_easy_module;
    })
    $("#ansible_playbook_config").click(function(){
        window.location.href = Ansible_playbook_config;
    })
    $("#ansible_playbook_list").click(function(){
        window.location.href = Ansible_playbook_list;
    })
    $('#set').click(function (){
          $('#head').slideDown("slow");
    });
    $('#index').click(function () {
        window.location.href = IndexURL;
    });
    $('#host_input').click(function () {
        window.location.href = hostInputURL;
    });
    $('#cmd').click(function () {
        window.location.href = CmDURL;
    });
    $('#script').click(function () {
        window.location.href = ScriptURL;
    });
    $('#crond').click(function () {
        window.location.href = CrondURL;
    });
    $('#key').click(function () {
        window.location.href = UploadKeyURL;
    });
    $('#Pushcode').click(function () {
        window.location.href = PushCodeURL;
    });
    $('#fileup').click(function () {
        window.location.href = fileupURL;
    });
    $('#filedown').click(function () {
        window.location.href = filedownURL;
    });
    $('#remotefile').click(function () {
        window.location.href = remotefileURL;
    });
    $('#docker_repo').click(function () {
        window.location.href = docker_repoURL;
    });
    $('#docker_container').click(function () {
        window.location.href = docker_containerURL;
    });
    $('#docker_container_play').click(function(){
        window.location.href = PlayContainer;
    });
    $('#work_calendar').click(function(){
        window.location.href = CalendarURL;
    });
    $('#work_plan').click(function(){
        window.location.href = Work_paln_URL;
    });
    $('#base_assets_config').click(function(){
        window.location.href = assets_config;
    });
    $('#assets_add').click(function(){
        window.location.href = assets_add;
    });
    $('#assets_list').click(function(){
        window.location.href = assets_list;
    });
    $('#global_config').click(function(){
        window.location.href = global_config;
    });
    $('#global_log').click(function(){
        window.location.href = global_log;
    });
    $('#zabbix_host').click(function(){
        window.location.href = zabbixhost;
    });
    ///limit something opeation
    var admin = Rmtab($("#user_id")[0].textContent)
    if(admin == "j"){
      window.admin = admin
    }
})
