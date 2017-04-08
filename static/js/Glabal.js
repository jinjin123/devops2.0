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
var executeCommandURL = "/ops/execute_command/";
var getCommandResultURL = "/ops/get_command_result/";
var scriptInitURL = "/ops/script_init/";
var saveCrondToServerURL = "/ops/save_crontab_to_server/";
var getCrondListURL = "/ops/get_crontab_list/";
var deleteCrondListURL = "/ops/delete_crontab_list/";
var getRemoteFileListURL =  "/ops/get_remote_file_list/";
var addRemoteFileURL =  "/ops/add_remote_file/";
var getRemoteFileContentURL = "/ops/get_remote_file_opt/";
var deleteRemoteFileListURL = "/ops/delete_remote_file_list/";
var writeRemoteFileContentURL = "/ops/write_remote_file_opt/";

function errorAjax(XMLHttpRequest, textStatus, errorThrown) {
    status_code = XMLHttpRequest.status;
    var content = XMLHttpRequest.responseText || "";
    var mysqlSock = content.match("\/.*sock");
    if (content.match("Can.*connect to local.*server through socket")) {
        content = "内部系统错误";
    }
    else if (content.match("Access.*denied")) {
        content = "内部系统错";
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

//loading ....
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
