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

// //loading ....
function start_load_pic() {
    document.getElementById("loadPic").style.display = "block";
    //document.getElementById("shadow").style.display = "block";

}
//
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
$(function(){
  getJSON(ContainerNodeList).then(function(data){
        // data = data.replace(/[\\]/g,"");
        data = JSON.parse(data)
        // window.ContainerNodeList = JSON.parse(data)
        console.log(data)
        // return data
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
// $(function  LoadNodeList() {
//   getJSON(ContainerNodeList).then(function(data){
//         // data = data.replace(/[\\]/g,"");
//         data = JSON.parse(data)
//         // window.ContainerNodeList = JSON.parse(data)
//         console.log(data)
//         // return data
//         // //n 得到下标
//         $.map(data,function (i,n ){
//           for(x=0;x<i.length;x++){
//             // console.log(i[x])
//             window.ContainerNodeList = i[x]
//             console.log(window.ContainerNodeList)
//             // createNode(i[x])
//           }
//         })
//   });
// }

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
                    console.log(response);
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
