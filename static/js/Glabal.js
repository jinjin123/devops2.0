/**
 * Created by wupeijin on 17/3/28.
 */
var addserverURL = "/ops/add_server_list";
var delserverURL = "/ops/del_server_list";
var loadServerListURL = "/ops/load_server_list";
var getFileTransProgressURL = '/ops/get_filetrans_progress';
var uploadFileURL = '/ops/upload/test';
var fileTransURL = "/ops/filetrans/upload/";
var hostInputURL = '/ops/host_input';
var remoteDownloadFileURL = "/ops/filetrans/download/";
var createTGZPackURL = "/ops/create_tgz_pack/";
var myCommandHistoryURL =  "/ops/my_command_history/";
var executeCommandURL = "/ops/execute_command/";
var getCommandResultURL =  "/ops/get_command_result/";
var uploadScriptToServer = "/ops/upload_script/";
var scriptListURL =  "/ops/scripts_list/";
var getScriptContentURL =  "/ops/get_script_content/";
var writeScriptContentURL = "/ops/write_script_content/";
var deleteScriptURL = "/ops/delete_script/";
var scriptInitURL = "/ops/script_init/";
var saveCrondToServerURL = "/ops/save_crontab_to_server/";
var getCrondListURL = "/ops/get_crontab_list/";
var deleteCrondListURL = "/ops/delete_crontab_list/";
var getRemoteFileListURL =  "/ops/get_remote_file_list/";
var addRemoteFileURL =  "/ops/add_remote_file/";
var getRemoteFileContentURL = "/ops/get_remote_file_opt/";
var deleteRemoteFileListURL = "/ops/delete_remote_file_list/";
var writeRemoteFileContentURL = "/ops/write_remote_file_opt/";
var keyAdminURL =  "/ops/show_keyfile_list/";
var deleteKeyFileURL = "/ops/delete_keyfile/";
var uploadKeyFileURL = "/ops/upload_keyfile/";
var SubmitRepoURL = "/ops/docker_repo_list";
var LoadRepoListContentURL = "/ops/docker_repo_content";
var deleteRepotURL = "/ops/docker_repo_del"
var DockerIMG = "/ops/docker_img"
var DockerIMGTAGS = "/ops/docker_imagestags?image="
var DockerIMGTAGS_HISTORY = "/ops/docker_tagshistory?image="
var DockerIMGDEL = "/ops/docker_delimg"
var ContainerNode = "/ops/Container_Node"
var ContainerNodeList = "/ops/ContainerNodeList"
var ContainerDelNode = "/ops/ContainerDelNode"
var Docker_pulled_images =  "/ops/images"
var Docker_search_images = "/ops/images/search"
var Docker_pull_images = "/ops/images/pull/"
var deleteImgURL = "/ops/images/remove"
var Container_Ava_Ip = "/ops/Container_Ava_Ip"
var Create_Container_Net = "/ops/Create_Container_Net"
var deleteCTNetRange = "/ops/Container_Net_range/remove"
var Create_CTN_Service = "/ops/images/launch/"
var CheckContainerURL = "/ops/checkcontainer"
var Container_Service = "/ops/Container_Service"
var ContainerSPURL = "/ops/Container_Stop"
var ContainerSTURL = "/ops/Container_Start"
var ContainerRSURL = "/ops/Container_ReStart"
var ContainerRMURL = "/ops/Container_Remove"
var ContainerBKURL = "/ops/Container_backup"

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

//add  action  success notice
function showSuccessNotic() {
    var element = "";
    if (window.innerWidth > 737) {
        $("#showSuccessNotic").slideDown("fast");
      }
    else {
        var t = document.getElementById("showSuccessNotice");
        t.style.display = "block";

    }
    element = t;
    setTimeout(function () {
        //element.style.display = "none"
        $("#showSuccessNotic").slideUp("slow");
    }, 1000)//三秒钟过后，自动消失

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
$(function(){
    initGetServersList();
        document.getElementById("closeButton").onclick = function () {
        $("#showErrorInfoDIV").hide("fast");
        document.getElementById("shadow").style.display = "none";
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
                console.log(window.allServersList);
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
        console.log(data)
        // //n 得到下标
        $.map(data,function (i,n ){
            window.ContainerNodeList = i
            console.log(window.ContainerNodeList )
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
    //用来ssh登录检查服务器状态的，新建和修改的服务器使用，在请求之前就修改状态图标
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
        $(showCheckStatus).children().remove();//删除此前的状态，避免重复
        showCheckStatus.appendChild(span);//加入新的状态信息
        document.getElementById("showCheckInfo").textContent=this.getAttribute("info");
        $("#showServerCheckInfo").show("fast");
        startShadow();
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
           console.log(data.content)
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
        console.log(data);
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
        xhr.open("POST", url, true)
        // xhr.setRequestHeader("Content-type", "application/json  charset=UTF-8");
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

// remove   space
function  Rmspace(content){
    data=content.replace(/[' ']/g,"");
    return data
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

//guidance station
$(function(){
   //show the setting  own configure
    $('#set').click(function (){
          $('#head').slideDown("slow");
    });
    $('#index').click(function () {
        window.location.href = '/ops/index';
    });
    $('#host_input').click(function () {
        window.location.href = '/ops/host_input';
    });
    $('#cmd').click(function () {
        window.location.href = '/ops/cmd';
    });
    $('#script').click(function () {
        window.location.href = '/ops/script';
    });
    $('#crond').click(function () {
        window.location.href = '/ops/crond';
    });
    $('#key').click(function () {
        window.location.href = '/ops/UploadKey';
    });
    $('#Pushcode').click(function () {
        window.location.href = '/ops/PushCode';
    });
    $('#fileup').click(function () {
        window.location.href = '/ops/fileup';
    });
    $('#filedown').click(function () {
        window.location.href = '/ops/filedown';
    });
    $('#remotefile').click(function () {
        window.location.href = '/ops/remotefile';
    });
    $('#docker_repo').click(function () {
        window.location.href = '/ops/docker_repo';
    });
    $('#docker_container').click(function () {
        window.location.href = '/ops/docker_container';
    });
})
