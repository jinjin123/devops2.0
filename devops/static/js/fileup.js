/**
 * Created by wupeijin on 17/3/28.
 */

function FileUpSelectServer (){
    document.getElementById("shadow").style.display="block";
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
    var  selectServerTbody = document.getElementById("uploadFileSelectServerTbody");
    for (var i = 0; i < hostGroups.length; i++) {
        group = hostGroups[i];
        //ioop  group  , if group <-> host  , view
        var tr = document.createElement("tr"); // everyline  group |  host A, B
        var td = document.createElement("td"); //group | host A，B
        var groupSpan = document.createElement("span");//checkbox
        groupSpan.className = "glyphicon glyphicon-check"//default hook，hostgroup
        groupSpan.style.cursor = "pointer";
        groupSpan.style.fontSize = "small";
        groupSpan.innerHTML =  hostGroups[i];//value
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
                hostSpan.innerHTML = "&nbsp;" + window.allServersList[h].ip;//IP   you can  change alias name  and others
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
    initDropZ();
    initIndependentDropZ();
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
    //bind the advance button
    document.getElementById("remotePathAdvance").onclick = function () {
        var model = "advance";
        remotePathNextButton(model);
        document.getElementById("startFileUploadButton").removeAttribute("disabled");
    }
    //bind   X  button ,if close   that the model its advance
    document.getElementById("dumpUploadFile").onclick = function () {
        $("#dropz").slideUp("fast");
        window.uploadFileModel = "advance";
        document.getElementById("startFileUploadButton").removeAttribute("disabled");
        createLocalServerAndRemoteServerDiv();
    }
    //hook select server or cancel hook server
    $("#fileUploadSelectAllServers").toggle(function () {
            $(this).removeClass("glyphicon-check").addClass("glyphicon-unchecked");
            $("tbody").find("span").removeClass("glyphicon-check").addClass("glyphicon-unchecked");
        }, function () {
            $(this).removeClass("glyphicon-unchecked").addClass("glyphicon-check");
            $("tbody").find("span").removeClass("glyphicon-unchecked").addClass("glyphicon-check");
        }
    );
    //select server next step
    document.getElementById("fileUploadSelectNext").onclick = function () {
        //get the select server
        window.currentfileUploadSelectedServers = [];//reset hook host
        $("#uploadFileSelectServerTbody").find("span").filter(".glyphicon-check").filter(".hostClass").each(function () {
            //read the host
            window.currentfileUploadSelectedServers.push(this.getAttribute("value"));
            // window.currentfileUploadSelectedServers.push(this.textContent);
            // console.log(window.currentfileUploadSelectedServers);
        })
        if (window.currentfileUploadSelectedServers.length == 0) {
            showErrorInfo("请选择服务器！");
            return false;
        }
        fileUploadSelectNext();
        $("#uploadFileSelectServerTbody").children().remove(); //remove server prevent reload
        //delete gui for  upload   prevent reload
        $("#showLocalServerAndRemoteServerDIV").children().remove();
    }
    //bind upload button
    document.getElementById("startFileUploadButton").onclick = function () {
        this.setAttribute("disabled", true)
        startLocalToRemoteUpload();
    }
    //bind  upload file then  close button
    document.getElementById("dumpIndependentDropz").onclick = function () {
        $("#independentDropz").animate({
            "left": "100%",
        })
        this.style.display = "none";
    }
})


function remotePathNextButton(model){
    //get the remote  path
    window.remotePath=document.getElementById("remotePath").value;
    if(window.remotePath.length==0){
        showErrorInfo("请填写远程路径！")
        return false;
    }
    document.getElementById("remotePathDIV").style.display="none";
    $("#dropz").slideDown("fast");
    window.uploadFileModel=model;
    document.getElementById("shadow").style.display="none";
}


function fileUploadSelectNext(){
    //       get the next step to choice remote path
    $("#file_to_up").hide(); // close select server button
    $("#remotePathDIV").slideDown("fast");
    document.getElementById("remotePath").focus();
}
function initIndependentDropZ(){
    //one to upload
    var dropz = new Dropzone("#independentDropz", {
        url: uploadFileURL,
    });
    dropz.on("addedfile", function (file) {
        $(".dz-preview").remove(); //remove source notice
        //progressbar
        document.getElementById("showIndependentProgress").style.display="block";
        window.fileUploadLocalFileName=file.name;//upload filename;
        startShadow();

    });
    dropz.on("uploadprogress", function (file, progress, sendsize) {
        var uploadFileProgress=document.getElementById("showIndependentProgress");
        progress=parseInt(progress);
        if(isNaN(progress)){
            //upload bad
            showErrorInfo("不能连接到服务器")
        }
        uploadFileProgress.innerText=progress +"%";
    });
    dropz.on("success",function(file,tmp){
        //upload success
        stopShadow();
        document.getElementById("showIndependentProgress").style.display="none"; //close the progressbar
        $("#independentDropz").animate({
            "left":"100%",
        })
        document.getElementById("dumpIndependentDropz").style.display="none";//hide close button
        //write file name input
        window.currentLocalUploadFileInput.value=file.name;
    })

}

function initDropZ() {
    var dropz = new Dropzone("#dropz", {
        url: uploadFileURL,
    });
    dropz.on("addedfile", function (file) {
        $(".dz-preview").remove();
        document.getElementById("uploadFileProgress").style.display="block";
        window.fileUploadLocalFileName=file.name;
        startShadow();

    });
    dropz.on("uploadprogress", function (file, progress, sendsize) {
        var uploadFileProgress=document.getElementById("uploadFileProgress");
        progress=parseInt(progress);
        console.log(progress);
        if(isNaN(progress)){
            showErrorInfo("不能连接到服务器")
        }
        uploadFileProgress.innerText=progress +"%";
    });
    dropz.on("success",function(file,tmp){
        stopShadow();
        $("#dropz").slideUp("fast");
        document.getElementById("uploadFileProgress").style.display="none";
        createLocalServerAndRemoteServerDiv();//before upload file the gui
    })
}

function createLocalServerAndRemoteServerDiv(){
    //about the remote server and upload file and progressbar
    var showLocalServerAndRemoteServerDIV=document.getElementById("showLocalServerAndRemoteServerDIV");
    window.uploadFileData=[];//[{"sid":sid,"dfile":dfile,"element":progressElement},...]
    for(var i=0;i<window.currentfileUploadSelectedServers.length;i++){
        var ip=window.currentfileUploadSelectedServers[i];
        var lineDiv=document.createElement("div");
        lineDiv.className="col-sm-12 fileTransLocalAndRemoteDiv";//read class everyline
        lineDiv.setAttribute("ip",ip);
        lineDiv.style.marginTop="10px";
        //Devopsserver  path
        var div1=document.createElement("div");
        div1.style.float="left";
        div1.className="col-sm-4 input-group ";//a line a group
        lineDiv.appendChild(div1)// append line
        //head
        var span=document.createElement("span");
        //bind event for upload ,and  icon pic
        span.onclick=function(){
            var input=$(this).siblings("input")[0];//span -> input local path
            window.currentLocalUploadFileInput=input;// save the upload remote path and write in it
            showIndependentUploadFileDIV();
        }
        span.onmouseover=function(){
            this.style.cursor="pointer";
        }
        span.onmouseout=function(){
            this.style.cursor="";
        }
        span.className="input-group-addon";
        var pic=document.createElement("span");
        pic.className="glyphicon glyphicon-upload";
        span.appendChild(pic); //upload pic
        span.style.width="40px";
        //span.innerHTML="&nbsp;AAA";
        //middle input
        var input=document.createElement("input");
        input.className="form-control ng-pristine ng-valid ng-touched localFilePath";
        input.style.display="inline";
        input.setAttribute("placeholder","请输入本地文件路径")
        if (window.fileUploadLocalFileName){
            input.value=window.fileUploadLocalFileName;

        }
        div1.appendChild(span);
        div1.appendChild(input);
        //remote server path
        var div2=document.createElement("div");
        div2.style.left="10px";
        div2.className="col-sm-4 input-group";
        div2.style.float="left";
        //输入框
        var span=document.createElement("span");
        span.className="input-group-addon";
        span.style.width="90px";
        span.innerHTML="&nbsp;"+ip;
        var input=document.createElement("input");
        input.className="form-control ng-pristine ng-valid ng-touched remoteFilePath";
        input.style.display="inline";
        input.setAttribute("placeholder","请输入远程服务器路径");
        input.value=window.remotePath;
        div2.appendChild(span);
        div2.appendChild(input);
        lineDiv.appendChild(div2)
        //progressbar
        var div3=document.createElement("div");
        div3.style.left="10px;"
        div3.style.float="left";
        div3.className="col-sm-4";
        div3.style.height="35px";
        var divProgress=document.createElement("div");
        divProgress.className="progress-bar progress-bar-success progress-bar-striped active";
        //divProgress.style.width="80%";
        divProgress.style.borderRadius="4px";
        var span=document.createElement("span");
        // span.innerText="10%";
        divProgress.appendChild(span);
        div3.appendChild(divProgress);
        lineDiv.appendChild(div3)
        showLocalServerAndRemoteServerDIV.appendChild(lineDiv);

    }
    if(window.uploadFileModel==="fast"){
        startLocalToRemoteUpload();//fast model
    }

}


function startLocalToRemoteUpload(){
    //disable upload button
    document.getElementById('startFileUploadButton').setAttribute("disabled",true);
    $(".fileTransLocalAndRemoteDiv").each(function(){
        var div=this;
        var ip=div.getAttribute("ip");
        var inputs=$(this).find("input");
        var localPath=inputs[0].value;
        var remotePath=inputs[1].value;
        var progressSpan=$(this).find("span")[3];
        data={"sfile":localPath,"dfile":remotePath,"ip":ip};
        data=JSON.stringify(data);
        jQuery.ajax({
            "url":fileTransURL,
            "dataType":"jsonp",
            "data":{"parameters":data},
            "success":function(data){
                var progressBar=$(div).find(".progress-bar")[0];//progress-bar class
                if(!data.status){
                    //server upload bad
                    $(progressBar).removeClass("progress-bar progress-bar-success progress-bar-striped active");
                    progressBar.textContent=data.content;
                    progressBar.className="label label-danger";
                    return false;
                }
                else{
                    var tid=data.content;
                    console.log(data.content);
                    getFileTransProgress(tid,progressBar,progressSpan);
                }
            },
            // "error":console.log(data)
        });

    })
}

function showIndependentUploadFileDIV(){
    $("#independentDropz").animate({
        "left":"0%",
    })
    document.getElementById("dumpIndependentDropz").style.display="block";

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



//transfer args for setTimeout ,because default setTime doesn't  take args
function _getFileTransProgress(tid,progressBar,progressSpan){
    return function(){
        getFileTransProgress(tid,progressBar,progressSpan);
    }
}


//get the file progressbar data
function getFileTransProgress(tid,progressBar,progressSpan){
    jQuery.ajax({
        "url":getFileTransProgressURL,
        "error":errorAjax,
        "data":{"tid":tid},
        "dataType":"jsonp",
        "success":function(data){
            if(!data.status){
                $(progressBar).removeClass("progress-bar progress-bar-success progress-bar-striped active");
                console.log(data.content)
                progressBar.textContent=data.content;
                progressBar.className="label label-danger";
                return false;
            }
            else{
                var progress=parseInt(data.progress);
                progressBar.style.width=progress+"%";
                progressSpan.innerText=progress+"%";
                if(progress<100){
                    // still get ...
                    setTimeout(_getFileTransProgress(tid,progressBar,progressSpan),1000);
                    //transfer args for setTimeout ,because default setTime doesn't  take args

                }
                else if(progress==100){
                    //upload success , change the progressbar to success notice
                    setTimeout(function(){
                        $(progressBar).removeClass("progress-bar progress-bar-success progress-bar-striped active");
                        progressBar.textContent="成功";
                        progressBar.className="label label-success";
                    },1000);


                }
            }
        }
    });

}