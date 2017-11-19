/**
 * Created by wupeijin on 17/3/28.
 */
// $(function(){
//     InitServer();
// })

function fileDownloadSelectServer (){
    // document.getElementById("shadow").style.display="block";
    $("#showFileDownloadServerDIV").slideDown("fast");
    var hostGroups=[];
    window.currentSelectedServers=[];//save select host
    for(i in  window.allServersList){
        var group=window.allServersList[i].group;
        var a=window.allServersList;
        if(hostGroups.indexOf(group)>-1){  //>-1  ? will find :  not find
            continue;
        }
        else{
            hostGroups.push(group);
        }
    }
    var  selectServerTbody = document.getElementById("downloadFileSelectServerTbody");
    for (var i = 0; i < hostGroups.length; i++) {
        group = hostGroups[i];
        // console.log(group);
        //ioop  group  , if group <-> host  , view
        var tr = document.createElement("tr"); // everyline  group |  host A, B
        var td = document.createElement("td"); //group | host A，B
        var groupSpan = document.createElement("span");//checkbox
        groupSpan.className = "glyphicon glyphicon-check"//default hook，hostgroup
        groupSpan.style.cursor = "pointer";
        groupSpan.style.fontSize = "small";
        groupSpan.innerHTML = "&nbsp" + hostGroups[i];//value
        groupSpan.setAttribute("value", hostGroups[i]);//value -> class
        groupSpan.onclick = function () {
            if ($(this).hasClass("glyphicon-check")) {
                var td = $(this).parent();//td
                var tr = $(td).parent();//tr
                $(tr).find("span").removeClass("glyphicon-check").addClass("glyphicon-unchecked")  //tr->span
            }
            else {
                var td = $(this).parent();//td
                var tr = $(td).parent();//tr
                $(tr).find("span").removeClass("glyphicon-unchecked").addClass("glyphicon-check")
            }
        };
        td.appendChild(groupSpan);//span and td， first group
        tr.appendChild(td);

        td = document.createElement("td");
        for (h in window.allServersList) {// ioop  get the group <-> host
            if (group === window.allServersList[h].group) {// whent group <-> host , view
                hostSpan = document.createElement("span");
                hostSpan.className = "glyphicon glyphicon-check hostClass"; // add hostclass can easy read host
                hostSpan.onclick = function () {
                    if ($(this).hasClass("glyphicon-check")) {
                        $(this).removeClass("glyphicon-check").addClass("glyphicon-unchecked")
                    }
                    else {
                        $(this).removeClass("glyphicon-unchecked").addClass("glyphicon-check")

                    }
                };
                hostSpan.style.cssText = "margin:10px;cursor:pointer;font-size:small";
                hostSpan.innerHTML = window.allServersList[h].ip;//IP   you can  change alias name  and others
                hostSpan.setAttribute("value", window.allServersList[h]["ip"]); // too
                td.appendChild(hostSpan);
                window.currentSelectedServers.push(window.allServersList[h]["ip"]);
                // console.log(window.currentSelectedServers);
            }
        }
        tr.appendChild(td);
        selectServerTbody.appendChild(tr);
    }

}
$(function(){
        //bind select server
    document.getElementById("fileDownloadSelectServerButton").onclick=function(){
        fileDownloadSelectServer()
        $('#file_to_down').slideDown(1000).show();
        // FileUpSelectServer();
    }
        //cancel select server
    document.getElementById("CloseSelectLink").onclick = function () {
        $("#downloadFileSelectServerTbody").children().remove(); //  remove server value prevent reload
        $('#file_to_down').hide()
    }
    //hook select server or cancel hook server
    $("#fileDownloadSelectAllServers").toggle(function () {
            $(this).removeClass("glyphicon-check").addClass("glyphicon-unchecked");
            $("tbody").find("span").removeClass("glyphicon-check").addClass("glyphicon-unchecked");
        }, function () {
            $(this).removeClass("glyphicon-unchecked").addClass("glyphicon-check");
            $("tbody").find("span").removeClass("glyphicon-unchecked").addClass("glyphicon-check");
        }
    );
    //select server next step
    document.getElementById("fileDownloadSelectNext").onclick = function () {
        //get the select server
        window.currentfileDownloadSelectedServers = [];//reset hook host
        $("#downloadFileSelectServerTbody").find("span").filter(".glyphicon-check").filter(".hostClass").each(function () {
            //read the host
            window.currentfileDownloadSelectedServers.push(this.textContent);
        })
        if (window.currentfileDownloadSelectedServers.length == 0) {
            showErrorInfo("请选择服务器！");
            return false;
        }
        $("#downloadFileSelectServerTbody").children().remove(); //  remove server value prevent reload
        $("#showRemoteDownloadServerDIV").children().remove(); //  remove server choice gui  prevent reload
        $("#file_to_down").hide();//关闭服务器框
        //remote input
        $("#remoteDownloadPathDIV").slideDown("fast");
        $("#remoteDownloadPath").focus();
    }
    //bind download button
    document.getElementById("remoteDownloadPathAdvance").onclick=function(){
        $("#remoteDownloadPathDIV").slideUp("fast");
        createRemoteDownloadServerDiv();
        stopShadow();
        document.getElementById("startFileDownloadButton").removeAttribute("disabled");
    }
        //remote path input the button
    document.getElementById("remoteDownloadPathFastNext").onclick=function(){
        var remoteDownloadPath=document.getElementById("remoteDownloadPath").value;
        if(/^ *$/.test(remoteDownloadPath)){
            showErrorInfo("请输入远程服务器路径！");
            return false;
        }
        $("#remoteDownloadPathDIV").slideUp("fast");
        createRemoteDownloadServerDiv();
        document.getElementById("shadow").style.display="none";
        startRemoteDownloadToLocal();

    }
        //cancel download file to pc
    document.getElementById("closeDownloadFileButton").onclick=function(){
        document.getElementById("shadow").style.display="none";
        $("#showDownloadNotice").slideUp("fast");
    }
    //bind  download file to pc button
    document.getElementById("startFileDownloadButton").onclick=function(){
        startRemoteDownloadToLocal();
    }
    //TODO
    //bind  download file to pc button
    // document.getElementById("continueDownloadFileButton").onclick=function(){
    //     $("#showDownloadNotice").slideUp("fast");
    //     document.getElementById("shadow").style.display="block";
    //     createTgzPack();// package path
    // }
})



function createRemoteDownloadServerDiv(){
    //about the remote server and upload file and progressbar
    var remoteDownloadPath=document.getElementById("remoteDownloadPath").value;
    var showRemoteDownloadServerDIV=document.getElementById("showRemoteDownloadServerDIV");
    window.uploadFileData=[];//[{"sid":sid,"dfile":dfile,"element":progressElement},...]
    for(var i=0;i<window.currentfileDownloadSelectedServers.length;i++){
        var ip=window.currentfileDownloadSelectedServers[i];
        var lineDiv=document.createElement("div");
        lineDiv.className="col-sm-12 fileTransLocalAndRemoteDiv";//read class everyline
        lineDiv.setAttribute("ip",ip);
        lineDiv.style.marginTop="10px";
        //remote server  path
        //remote server path
        var div2=document.createElement("div");
        div2.style.left="10px";
        div2.className="col-sm-6 input-group";// first line and group
        div2.style.float="left";
        //input
        var span=document.createElement("span");
        span.className="input-group-addon";
        span.style.width="90px";
        span.innerHTML=ip; //first line
        var input=document.createElement("input");
        input.className="form-control ng-pristine ng-valid ng-touched remoteFilePath";
        input.style.display="inline";
        input.setAttribute("placeholder","请输入远程服务器路径");
        input.setAttribute("ip",ip);//把sid放进去
        input.value=remoteDownloadPath;
        div2.appendChild(span);
        div2.appendChild(input);

        lineDiv.appendChild(div2)//加入一行
        //3rd field  progressbar
        var div3=document.createElement("div");
        div3.style.left="10px;"
        div3.style.float="left";
        div3.className="col-sm-6";//一行中的第一组
        div3.style.height="35px";
        var divProgress=document.createElement("div");
        divProgress.className="progress-bar progress-bar-success progress-bar-striped active";
        //divProgress.style.width="80%";
        divProgress.style.borderRadius="4px";
        var span=document.createElement("span");
        //span.innerText="10%";
        divProgress.appendChild(span);
        div3.appendChild(divProgress);
        lineDiv.appendChild(div3)//加入一行
        showRemoteDownloadServerDIV.appendChild(lineDiv);

    }
    if(window.uploadFileModel==="fast"){
        startLocalToRemoteUpload();//fast model
    }

}
//用来给setTimeout传递参数的，默认的setTimeout是不可以携带参数的
function _getFileTransDownloadProgress(tid,progressBar,progressSpan,filename){
    return function(){
        //访问真正的目标函数
        getFileTransDownloadProgress(tid,progressBar,progressSpan,filename);
    }
}


//获取文件传输进度
function getFileTransDownloadProgress(tid,progressBar,progressSpan,filename){
    jQuery.ajax({
        "url":getFileTransProgressURL,
        "error":errorAjax,
        "data":{"tid":tid},
        "dataType":"jsonp",
        "success":function(data){
            if(!data.status){
                $(progressBar).removeClass("progress-bar progress-bar-success progress-bar-striped activ");
                progressBar.textContent=data.content;
                progressBar.className="label label-danger";
                window.currentDownloadFailedServerTotal+=1;
                return false;
            }
            else{
                var progress=parseInt(data.progress);
                progressBar.style.width=progress+"%";
                progressSpan.innerText=progress+"%";
                if(progress<100){
                    //小于100的时候，继续获取进度
                    setTimeout(_getFileTransDownloadProgress(tid,progressBar,progressSpan,filename),1000);
                    //用来给setTimeout传递参数的，默认的setTimeout是不可以携带参数的

                }
                else if(progress==100){
                    //上传成功，把进度条改成成功提示
                    setTimeout(function(){
                        //暂停一秒钟再显示成功
                        $(progressBar).removeClass("progress-bar progress-bar-success progress-bar-striped activ");
                        progressBar.textContent="成功";
                        progressBar.className="label label-success";
                        window.currentDownloadSuccessServerFileList.push(filename);//把成功下载的文件记录下来
                    },1000);
                }
            }
        }
    });

}

//download
function startRemoteDownloadToLocal(){
    //禁用上传按钮
    document.getElementById('startFileDownloadButton').setAttribute("disabled",true);
    window.currentDownloadServerTotal=0;//当前下载服务器的数量，成功的数量和数百的数量和加起来等于这个
    window.currentDownloadFailedServerTotal=0;
    window.currentDownloadSuccessServerFileList=[];
    $("#showRemoteDownloadServerDIV").find("input").each(function(){
        window.currentDownloadServerTotal+=1;//累加一个
        //获取这个DIV下面的input元素， input中有sid属性，直接就能拿到全部要的属性
        var input=this;
        var ip=input.getAttribute("ip");
        var remotePath=input.value;
        data={"ip":ip,"sfile":remotePath};
        data=JSON.stringify(data);
        jQuery.ajax({
            "url":remoteDownloadFileURL,
            "dataType":"jsonp",
            "data":{"parameters":data},
            "error":errorAjax,
            "success":function(data){
                var parentDiv=$(input).parent();
                var pDiv=$(parentDiv).siblings("div")[0];//progress-bar的父元素
                var progressSpan=$(pDiv).find("span")[0];
                var progressBar=$(pDiv).find(".progress-bar")[0];
                if(!data.status){
                    //后台失败了
                    $(progressBar).removeClass("progress-bar progress-bar-success progress-bar-striped active");
                    progressBar.textContent=data.content;
                    progressBar.className="label label-danger";
                    window.currentDownloadFailedServerTotal+=1;
                    return false;
                }
                else{
                    var tid=data.tid;
                    var filename=data.filename;
                    getFileTransDownloadProgress(tid,progressBar,progressSpan,filename);
                }


            }
        });

    })
    listenDownloadStatus()

}
function showDownloadNotice(content,isDownload){
    document.getElementById("shadow").style.display="block";//显示引用
    document.getElementById("showDownloadContent").innerText=content;//写入警告内容
    $("#showDownloadNotice").slideDown("fast");//显示DIV
    if(isDownload){
        document.getElementById("continueDownloadFileButton").style.display="block";//显示下载按钮
    }
    else{
        document.getElementById("continueDownloadFileButton").style.display="none";//全部下载失败了，不给下载按钮

    }
}
function  listenDownloadStatus(){
    //listen file download ,if download finish ?  download : until wait
    setTimeout(function(){
        isDownload=false;//show download button
        if(window.currentDownloadSuccessServerFileList.length+window.currentDownloadFailedServerTotal===window.currentDownloadServerTotal){
            //finish
            if(window.currentDownloadFailedServerTotal>0 && window.currentDownloadFailedServerTotal<window.currentDownloadServerTotal){
                isDownload=true;
                showDownloadNotice("部分服务器下载失败的,您可以继续打包下载成功的部分.",isDownload);
            }
            else if(window.currentDownloadFailedServerTotal==window.currentDownloadServerTotal){
                isDownload=false;
                showDownloadNotice("全部下载失败了！",isDownload);

            }
            else{
                createTgzPack();
                //request download
            }
        }
        else{
            listenDownloadStatus();
        }
    },500)
}
//tgz download
function createTgzPack(){
    var data=JSON.stringify(window.currentDownloadSuccessServerFileList);//success downfile list
    jQuery.ajax({
        "url":createTGZPackURL,
        "data":{"files":data},
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
                console.log('aaa');
                // var url=data.content;
                // window.location.href=url;//callback download tgz to pc url
            }
        }
    });
}





function remotePathNextButton(model){
    //get input path
    window.remotePath=document.getElementById("remotePath").value;
    if(window.remotePath.length==0){
        showErrorInfo("请填写远程路径！")
        return false;
    }
    document.getElementById("remotePathDIV").style.display="none";//close input
    $("#dropz").slideDown("fast");
    window.uploadFileModel=model;//upload model
    document.getElementById("shadow").style.display="none";
}
