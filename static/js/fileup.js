/**
 * Created by wupeijin on 17/3/28.
 */
$(function(){
    InitServer();
})

function FileUpSelectServer (){
    document.getElementById("shadow").style.display="block";
    $("#showFileDownloadServerDIV").slideDown("fast");
    var hostGroups=[];
    window.currentSelectedServers=[];//存储呗选中的主机
    for(i in  window.allServersList){
        var group=window.allServersList[i].group;
        // var a=window.allServersList;
        // console.log(a);
        if(hostGroups.indexOf(group)>-1){  //大于-1标识找到了，否则就是没有找到
            continue;
        }
        else{
            hostGroups.push(group);
            console.log(hostGroups);
        }
    }
    var  selectServerTbody = document.getElementById("uploadFileSelectServerTbody");
    for (var i = 0; i < hostGroups.length; i++) {
        group = hostGroups[i];
        //循环读取主机组，并且显示对应的主机
        var tr = document.createElement("tr"); //每一行，包含的是主机组和对应的主机
        var td = document.createElement("td"); //用于显示主机组，主机组|主机A，主机B
        var groupSpan = document.createElement("span");//用于显示复选框
        groupSpan.className = "glyphicon glyphicon-check"//默认选中，这个是主机组
        groupSpan.style.cursor = "pointer";
        groupSpan.style.fontSize = "small";
        groupSpan.innerHTML = "&nbsp" + hostGroups[i];//显示值
        groupSpan.setAttribute("value", hostGroups[i]);//把值设置给属性
        //设置点击事件
        groupSpan.onclick = function () {
            if ($(this).hasClass("glyphicon-check")) {
                var td = $(this).parent();//td级别
                var tr = $(td).parent();//tr级别
                $(tr).find("span").removeClass("glyphicon-check").addClass("glyphicon-unchecked")  //选中tr中所有span
            }
            else {
                var td = $(this).parent();//td级别
                var tr = $(td).parent();//tr级别
                $(tr).find("span").removeClass("glyphicon-unchecked").addClass("glyphicon-check")

            }
        };
        td.appendChild(groupSpan);//把第span加入td，第一个位置主机组
        tr.appendChild(td);

        td = document.createElement("td");
        //需要循环处理N个主机
        for (h in window.allServersList) {//循环读取所有主机组对应的主机
            if (group === window.allServersList[h].group) {//匹配当前主机组的主机，显示
                hostSpan = document.createElement("span");
                hostSpan.className = "glyphicon glyphicon-check hostClass"; //增加hostClass便于读取主机
                hostSpan.onclick = function () {
                    if ($(this).hasClass("glyphicon-check")) {
                        $(this).removeClass("glyphicon-check").addClass("glyphicon-unchecked")
                    }
                    else {
                        $(this).removeClass("glyphicon-unchecked").addClass("glyphicon-check")

                    }
                };
                hostSpan.style.cssText = "margin:10px;cursor:pointer;font-size:small";
                hostSpan.innerHTML = "&nbsp;" + window.allServersList[h].ip;//显示主机别名，不显示主机IP
                hostSpan.setAttribute("value", window.allServersList[h]["id"]); //显示主机别名，不显示主机IP
                td.appendChild(hostSpan);
                window.currentSelectedServers.push(window.allServersList[h]["id"]);
            }
        }
        tr.appendChild(td);
        selectServerTbody.appendChild(tr);
    }

}
$(function(){
        //bind select server
    document.getElementById("FileSelectServerButton").onclick=function(){
        FileUpSelectServer();
        $('#file_to_up').slideDown(1000).show();
        // FileUpSelectServer();
    }
        //cancel select server
    document.getElementById("CloseSelectLink").onclick = function () {
        $("#uploadFileSelectServerTbody").children().remove(); //  remove server  prevent reload
        $("#showFileDownloadServerDIV").slideUp("fast");
        document.getElementById("shadow").style.display = "none";
        $('#file_to_up').hide()
    }
            //bind  upload file buttion
    document.getElementById("remotePathFastNext").onclick = function () {
        var model = "fast"; // set  quickly to  upload
        remotePathNextButton(model);
    };

    $("#fileUploadSelectAllServers").toggle(
        function () {
            $(this).removeClass("glyphicon-check").addClass("glyphicon-unchecked");
            $("tbody").find("span").removeClass("glyphicon-check").addClass("glyphicon-unchecked");
        }, function () {
            $(this).removeClass("glyphicon-unchecked").addClass("glyphicon-check");
            $("tbody").find("span").removeClass("glyphicon-unchecked").addClass("glyphicon-check");

        }
    );
    //获取选择服务器的下一步
    document.getElementById("fileUploadSelectNext").onclick = function () {
        //获取选中的主机
        window.currentfileUploadSelectedServers = [];//重置选中的主机
        $("#uploadFileSelectServerTbody").find("span").filter(".glyphicon-check").filter(".hostClass").each(function () {
            //获取hostClass是为了读取主机，因为表里面有主机组的标签，用这个区分
            window.currentfileUploadSelectedServers.push(this.getAttribute("value"));
        })
        if (window.currentfileUploadSelectedServers.length == 0) {
            showErrorInfo("请选择服务器！");
            return false;
        }
        fileUploadSelectNext();
        $("#uploadFileSelectServerTbody").children().remove(); //remove server prevent reload
        //删除界面布局的上传界面，避免重复
        //delete gui for  upload   prevent reload
        $("#showLocalServerAndRemoteServerDIV").children().remove();


    }


})


function fileUploadSelectNext(){
    //       get the next step to choice remote path
    $("#file_to_up").hide(); // close select server button
    $("#remotePathDIV").slideDown("fast");
    document.getElementById("remotePath").focus();
}

function InitServer(){
     initGetServersList();
    document.getElementById("closeButton").onclick = function () {
        $("#showErrorInfoDIV").hide("fast");
        document.getElementById("shadow").style.display = "none";
    }
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
                console.log('GET server success');
            }
        },
        "error": console.log('a'),
    });
}
