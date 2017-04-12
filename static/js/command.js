/**
 * Created by wupeijin on 17/4/3.
 */
$(window).load(function(){
    setTimeout('selectServer()',50);
})

$(function () {
    //give event to choose all server
    $("#selectAllServers").toggle(
        function () {
            $(this).removeClass("glyphicon-check").addClass("glyphicon-unchecked");
            $("tbody").find("span").removeClass("glyphicon-check").addClass("glyphicon-unchecked");
        }, function () {
            $(this).removeClass("glyphicon-unchecked").addClass("glyphicon-check");
            $("tbody").find("span").removeClass("glyphicon-unchecked").addClass("glyphicon-check");

        }
    );

    //give event to choose host
    document.getElementById("selectedServers").onclick = function () {
        $("#showServersPannel").hide("fast");
        document.getElementById("shadow").style.display = "none";

        window.currentSelectedServers = [];//reset choose host
        $("#selectServerTbody").find("span").filter(".glyphicon-check").filter(".hostClass").each(function () {
            //get hostClass to read host,  hostgroup tag in it
            window.currentSelectedServers.push(this.textContent);
        })
        $('#selectServerTbody').children().remove();
        createCRTWindow();//create crt window
    }

    //show choose server event
    document.getElementById("selectServersFilter").onclick = function () {
        $("#showServersPannel").show("fast");
        document.getElementById("shadow").style.display = "block";

    }


})

function selectServer() {
    $('#selectServerTbody').children().remove(); // 初始化会加载一次 然后点击触发的时候会加载一次 就会有两次存档 ，所以需要先清一次
    var hostGroups = [];
    window.currentSelectedServers = [];//存储呗选中的主机
    for (i in window.allServersList) {
        var group = window.allServersList[i].group;
        if (hostGroups.indexOf(group) > -1) {
            continue;
        }
        else {
            hostGroups.push(group);
        }
    }
    var selectServerTbody = document.getElementById("selectServerTbody");
    for (var i = 0; i < hostGroups.length; i++) {
        group = hostGroups[i];
        var tr = document.createElement("tr"); //show group  group <-> host1,2
        var td = document.createElement("td"); //show group  group <-> host1,2
        var groupSpan = document.createElement("span");//show checkbox
        groupSpan.className = "glyphicon glyphicon-check"//default check it ,this is group
        groupSpan.style.cursor = "pointer";
        groupSpan.innerHTML = hostGroups[i];
        groupSpan.setAttribute("value", hostGroups[i]);
        groupSpan.onclick = function () {
            if ($(this).hasClass("glyphicon-check")) {
                var td = $(this).parent();
                var tr = $(td).parent();
                $(tr).find("span").removeClass("glyphicon-check").addClass("glyphicon-unchecked")
            }
            else {
                var td = $(this).parent();
                var tr = $(td).parent();
                $(tr).find("span").removeClass("glyphicon-unchecked").addClass("glyphicon-check")

            }
        };
        td.appendChild(groupSpan);//the first its group
        tr.appendChild(td);

        td = document.createElement("td");
        for (h in window.allServersList) {//循环读取所有主机组对应的主机
            if (group === window.allServersList[h].group) {// if true to show group <-> host
                hostSpan = document.createElement("span");
                hostSpan.className = "glyphicon glyphicon-check hostClass"; //add hostClass to read host
                hostSpan.onclick = function () {
                    if ($(this).hasClass("glyphicon-check")) {
                        $(this).removeClass("glyphicon-check").addClass("glyphicon-unchecked")
                    }
                    else {
                        $(this).removeClass("glyphicon-unchecked").addClass("glyphicon-check")

                    }
                };
                hostSpan.style.cssText = "margin:10px;cursor:pointer;";
                hostSpan.innerHTML = window.allServersList[h].ip;// show ip
                hostSpan.setAttribute("value", window.allServersList[h]["ip"]); //show ip
                td.appendChild(hostSpan);
                window.currentSelectedServers.push(window.allServersList[h]["ip"]);
            }
        }
        tr.appendChild(td);
        selectServerTbody.appendChild(tr);
    }
    createCRTWindow();
}


//create crt window
function createCRTWindow() {
    var showCRTWindow = document.getElementById("showCRTWindow");
    showCRTWindow.innerHTML = ""//clean crt window and init
    var CRTWindowExample = document.getElementById("CRTWindowExample");
    for (var i = 0; i < window.currentSelectedServers.length; i++) {
        var ip = window.currentSelectedServers[i];
        for (var s = 0; s < window.allServersList.length; s++) {
            if (ip == window.allServersList[s]["ip"]) {
                var ip = window.allServersList[s]["ip"];
                break;
            }
        }
        //create CRT
        var t = CRTWindowExample.cloneNode(true);
        t.setAttribute("id", ip);//ajax post server need  this ip ,  crt ID ＝ IP ， IP对应的内容会丢到对应的框
        $(t).addClass("CRT");//add class，js to control this class to change crt size
        $(t).find("h4")[0].textContent = ip;//crt head change ip
        t.style.display = "block";
        showCRTWindow.appendChild(t);
    }
}
function loadCrond(team) {
    if (window.currentSelectedServers.length === 0) {
        showErrorInfo("请选择主机!");
        return false;
    }
    if (team.style.cursor === "not-allowed") {
        return false;
    }
    else {
        document.getElementById("shadow").style.display = "block";
    }
}


function enableCrond(team) {
    var addCrond = document.getElementById("addCrond");
    if (team.value.length > 0) {
        addCrond.style.cursor = "pointer";
    }
    else {
        addCrond.style.cursor = "not-allowed";

    }
}


function createMyCommandHistory(command) {
    var showCommandHistory = document.getElementById("showCommandHistory");
    var label = document.createElement("label");
    label.className = "pull-left  label label-success";           // recived status  to create green or red
    label.textContent = command;
    label.style.cssText = "position: relative;cursor:pointer;border-radius:5px;margin-left:5px;";
    label.onclick = function () {
        var inputCommand = document.getElementById("inputCommand");
        inputCommand.value = this.textContent;
        document.getElementById("inputCommand").focus();

    }

    showCommandHistory.appendChild(label);
}

function loadMyCommandHistory() {
    jQuery.ajax({
        "url": myCommandHistoryURL,
        "dataType": "jsonp",
        "beforeSend": start_load_pic,
        "complete": stop_load_pic,
        "error": errorAjax,
        "success": function (data) {
            // responseCheck(data);
            if (data.status) {
                var content = data.content;
                for (var i = 0; i < content.length; i++) {
                    createMyCommandHistory(content[i]);
                }

            }
        }
    });
}


function processProgress(ip, content) {
    //show cmd result
    try {
        if (content.content === "") {
            return false;
        }
        var crt = document.getElementById(ip);
        var pre = $(crt).find("pre")[0];   // 在对应的crt窗口下找到对应的 框 丢内容进去
        var newPre = document.createElement("pre");
        newPre.style.background = "black";
        newPre.style.color = "white";
        newPre.style.border = "none";
        newPre.style.borderRadius = "0px;";
        newPre.style.padding = "0px";
        newPre.innerHTML = content.content;
        if (content.status == false) {
            newPre.style.color = "red";
        }
        if (window.currentCommand.match("^ *top$")) {
            pre.innerHTML = "";
        }
        pre.appendChild(newPre);
        pre.scrollTop = pre.scrollHeight;//scroll bar
    }
    catch (e) {
        console.log(e, "发生错误");
    }

}

function executeCommand(command, force) {
    //force exec
    var servers = window.currentSelectedServers;
    var data = {"cmd": command, "servers": servers};
    data["force"] = force;
    data["task_type"] = "cmd";
    data["multi_thread"] = true;

    document.getElementById("inputCommand").setAttribute("disabled", "disabled");   //disable input when task be not finish
    $("#execute").find("button")[0].setAttribute("disabled", "disabled");   //disable input when task be not finish
    //clean progress bar val
    try {
        document.getElementById("commandProgress").style.width = "0.1";
        document.getElementById("showCommandProgress").textContent = "0%";
        $("#commandProgress").addClass("active");
    }
    catch (e) {

    }
    //save command
    window.currentCommand = command;
    data = JSON.stringify(data);
    window.ajax = $.ajax({
        "url": executeCommandURL,
        "dataType": "jsonp",
        "data": {"parameters": data},
        "success": function (data) {
            // responseCheck(data);
            if (!data.status) {
                document.getElementById("inputCommand").removeAttribute("disabled");
                $("#execute").find("button")[0].removeAttribute("disabled");
                $("#showExecuteRefresh").text("执行").addClass("fa-refresh fa fa-spin") ;
                showErrorInfo(data.content);
                return false;
            }
            //if refuse
            if (data.ask) {
                //show notice
                startShadow();
                $("#confirmCommandDiv").show("fast");
                document.getElementById("showCommandWarn").innerHTML = data.content;
                return false;

            }
            if (data.status) {
                //pop head to save five
                if ($("#confirmCommandDiv").children().length >= 5) {
                    $("#showCommandHistory").children().eq(0).remove();
                }
                createMyCommandHistory(command);//add cmd history
                var tid = data.content;
                for (var i = 0; i < window.currentSelectedServers.length; i++) {
                    getCommandResult(tid, window.currentSelectedServers[i]);
                }
            }
        }
    });

}


function startCommand() {
    //change pic
    commandInput = document.getElementById("inputCommand");
    enableCrond(commandInput);
    command = commandInput.value;
    command = command.replace("\n", "");
    window.currentCommand = command;//save command ,when force exec command to use
    commandInput.value = "";
    commandInput.focus();
    if (window.currentSelectedServers.length === 0) {
        showErrorInfo("您尚未选择服务器，请选择后再执行命令！")
        return false;
    }
    if (command == "clear") {
        document.getElementById("showCommandResult").innerHTML = "";
        return true;
    }
    else if (/^ *$/.test(command)) {
        showErrorInfo("请输入命令后执行!")
        return false
    }
    else if (/^ *(vi|vim|cd|\/usr\/bin\/vim|\/bin\/vim)/.test(command)){
        showErrorInfo(window.refuseInfo);
        return false;
    }

    else {
        if (command.match(/^ *top$/)) {
            command = command + " -b";
        }
        $("#showExecuteRefresh").text("").addClass("fa-refresh fa fa-spin");
        executeCommand(command, false);

    }


}

function _getCommandResult(tid, ip) {
    return function () {
        getCommandResult(tid, ip);
    }
}


function getCommandResult(tid,ip) {
    var data = {"tid": tid, "ip": ip};
    $.ajax({
        "url": getCommandResultURL,
        "dataType": "jsonp",
        "data": data,
        "error": errorAjax,
        "success": function (data) {
            // responseCheck(data);
            if (data.status) {
                var progress = document.getElementById("commandProgress").style.width = data.progress + "%";    //show progress bar val
                var showProgress = document.getElementById("showCommandProgress").textContent = data.progress + "%";
                //if (data.content.stage === "running") {  //stage ? running :done
                if (data.progress < 100.00) {  //stage ? running :done
                    //still get progress value
                    setTimeout(_getCommandResult(tid, ip), 1000);
                }

                if (data.progress == 100.00) {
                    $("#showExecuteRefresh").text("执行").removeClass("fa-refresh  fa-spin");// 100 remove dymanic pic
                    //$("#commandProgress").removeClass("active");  //progress bar dymanic pic
                    document.getElementById("commandProgress").style.width = "0%";
                    document.getElementById("showCommandProgress").textContent = "0%";
                    document.getElementById("inputCommand").removeAttribute("disabled");
                    $("#execute").find("button")[0].removeAttribute("disabled");
                    document.getElementById("inputCommand").focus();
                    showSuccessNotic();
                }
                processProgress(ip, data.content);//show message
            }

        }
    });
}

//init
$(function () {
    //crond button
    document.getElementById("addCrond").onclick = function () {
        loadCrond(this);
    }
    //crond button default none
    //bind exec button
    document.getElementById("execute").onclick = function () {
        startCommand();
    }
    //input event
    document.getElementById("inputCommand").onkeyup = function () {
        if (event.keyCode === 13) {
            startCommand(this);
        }
    }


    //load command history
    loadMyCommandHistory();

    //command check close button
    document.getElementById("closeConfirmCommandButton").onclick = function () {
        stopShadow();
        $("#confirmCommandDiv").hide("fast");
        document.getElementById("shadow").style.display = "none";
        document.getElementById("inputCommand").removeAttribute("disabled");
        $("#execute").find("button")[0].removeAttribute("disabled");
        $("#showExecuteRefresh").text("执行").removeClass("fa-refresh fa fa-spin");//动画
    }
    //force execute command
    document.getElementById("forceExecuteCommand").onclick = function () {
        stopShadow();
        command = document.getElementById("inputCommand").value;
        executeCommand(window.currentCommand, true);
        $("#confirmCommandDiv").hide("fast");

    }

    //crt size
    if (window.innerWidth < 737) {
        var CRT = document.getElementsByClassName("CRT");
        for (var i = 0; i < CRT.length; i++) {
            CRT[i].style.width = "98%";
        }

    }

    $("#fullScrenCRT").toggle(
        function () {
            //full
            $(".CRT").css({
                "width": "98%",
            })
        }, function () {
            if (window.innerWidth > 737) {
                //half screen
                $(".CRT").css({
                    "width": "48%",
                })
            }
            else {
                //full in phone
                $(".CRT").css({
                    "width": "98%",
                })
            }
        }
    );
    document.getElementById("inputCommand").focus();
})
