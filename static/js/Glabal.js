/**
 * Created by wupeijin on 17/3/28.
 */
var addserverURL = "/ops/add_server_list";
var delserverURL = "/ops/del_server_list";
var loadServerListURL = "/ops/load_server_list";




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

function initGetServersList() {
    jQuery.ajax({
        "url": loadServerListURL,
        // "dataType": "json",
        "success": function (data) {
            if (!responseCheck(data)) {
                showErrorInfo(data.content);
                // showErrorInfo(data.content);
            }
            else {
                window.allServersList = responseCheck(data);//全局服务器
                console.log(window.allServersList);
                console.log(responseCheck(data));
                console.log('接收所有服务器');
            }
        },
        "error": console.log('a'),
    });
}

//ajax callback to check data to do something
function responseCheck(data) {
    try {
        data = JSON.parse(data);
        // console.log(data.content);
        return data.content;

    }
    catch (e) {
        console.log('err');
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
    document.getElementById("loadPic").style.display = "none";
    $("#showErrorInfoDIV").show("fast");
    var showWarnContent = document.getElementById("showWarnContent");
    showWarnContent.innerHTML = '<h5>请确认内容是否完整</h5>';
    document.getElementById("shadow").style.display = "block";
}

