/**
 * Created by wupeijin on 17/4/6.
 */


function createInitScriptProgress() {
    //init html
    var scriptInit = document.getElementById("scriptInit");
    $(scriptInit).find(".label-progress").remove();//del last html
    for (var i = 0; i < window.runScriptServers.length; i++) {
        var ip = window.runScriptServers[i];
        var div = document.createElement("div");
        div.style.marginTop = "5px";
        div.className = "col-md-12 label-progress";//del tag
        var label = document.createElement("label");
        label.setAttribute("ip", ip);
        label.textContent = ip;
        label.className = "control-label col-md-2";
        div.appendChild(label);
        //progress bar
        var progressDiv = document.createElement("div");
        progressDiv.className = "progress  progress-striped";
        var p = document.createElement("div");
        p.className = "progress-bar progress-bar-success";
        p.style.width = "0%";
        p.textContent = "0%";
        progressDiv.appendChild(p);
        div.appendChild(progressDiv);
        scriptInit.appendChild(div);


    }

}

function showScriptContent(filename) {
    //show script content
    jQuery.ajax({
        "url": getScriptContentURL,
        "dataType": "jsonp",
        "data": {"filename": filename},
        "error": errorAjax,
        "beforeSend": start_load_pic,
        "complete": stop_load_pic,
        "success": function (data) {
            if (!data.status) {
                showErrorInfo(data.content);
                return false;
            }
            else {
                var content = data.content;
                var scriptContent = document.getElementById("scriptContent");
                $(scriptContent).val(content);//html，content 读不到，因为他的值区域不同，所以读取的时候可能读不到，必须用val
                document.getElementById("scriptArea").style.display = "block";
                $("#scriptArea").animate({
                    "top": "0%",
                })
                $("#scriptContent").setTextareaCount();
            }
        }
    });

}
function submitScriptContent() {
    //submit script content
    var content = $("#scriptContent").val();
    var filename = document.getElementById("writeScriptContent").getAttribute("filename");
    jQuery.ajax({
        "url": writeScriptContentURL,
        "type": "POST",
        "data": {"filename": filename, "content": content},
        "error": errorAjax,
        "beforeSend": start_load_pic,
        "complete": stop_load_pic,
        "success": function (data) {
            data = JSON.parse(data);
            if (!data.status) {
                console.log(writeScriptContentURL);
                showErrorInfo(data.content);
                return false;
            }
            else {
                showSuccessNotic();
                $("#scriptArea").animate({
                    "top": "100%",
                }, function () {
                    document.getElementById("scriptArea").style.display = "none";
                });//close edit window
                try{
                	$(window.currentEditScriptContentButton.parentNode.parentNode).remove();
		}
		catch(e){

		}
                createScriptTableLine(data.content);
            }
        }
    });
}
function loadScriptList() {
    $.ajax({
        "url": scriptListURL,
        "dataType": "jsonp",
        "beforeSend": start_load_pic,
        "error": errorAjax,
        "complete": stop_load_pic,
        "success": function (data) {
            // responseCheck(data);
            data = JSON.parse(data);
            //data是一个dict
            console.log(data.content);
            if (!data.status) {
                showErrorInfo(data.content);
                return false;
            }
            else {
                var scripts = data.content;
                console.log(scripts);
                for (var filename in scripts) {
                    var line = scripts[filename];
                    createScriptTableLine(JSON.parse(line));
                }
            }
        }
    });
}
function scriptSelectServer() {
    $("#scriptDIV").show("fast");
    $("#scriptSelectServerTbody").children().remove();
    var hostGroups = [];
    window.currentSelectedServers = [];
    for (i in window.allServersList) {
        var group = window.allServersList[i].group;
        if (hostGroups.indexOf(group) > -1) {
            continue;
        }
        else {
            hostGroups.push(group);
        }
    }
    var scriptSelectServerTbody = document.getElementById("scriptSelectServerTbody");
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
        scriptSelectServerTbody.appendChild(tr);
    }
}
// function insertparagraph(data) {
//         var str = "<h5>";
//             str += data;
//             return str;
// }
function createScriptResult(data){
    var  content = data.replace(/\[?1h=/g,'');
    var bb = content.replace(/\[m/g,'');
    var aa = bb.replace(/\[K\[?1l>/g,'');
    // var aa = cc.replace(/K/g,'');
    // var aa = bb.replace(/commit/g,'id');
    // for (i=0;i<data.length;i++){
    // content = data.replace(pattern,'')
    // content = data.replace(/(^\w+)| (^\d+)(\w+)/,'')
    // }
    var showScriptResult = document.getElementById("showScriptResult");
    // var content = data.replace(/"([\<\>\[?1h=m]*)"/g,"");
    // para = "";
    // inner = "";
    // for(a = 0; a < aa.length;){
    //     if(aa[a] != '[' && aa[a] != '?' && aa[a] != '=' ){
    //         para += aa[a];
    //     }else {
    //             inner +=  insertparagraph(para);
    //             para = "";
    //     }
    //     a++;
    // }
    // console.log(inner);
    for (i = 0; i < 10; i++) {
        var item = document.createElement("div");
        item.className = "timeline__item timeline__item--" + i
        var opt = document.createElement("div")
        opt.className = "timeline__item__content"
        opt.innerHTML = aa
        item.appendChild(opt)
        // console.log(item);
        // showScriptResult.appendChild(item)
    }
    showScriptResult.appendChild(item)
    // console.log($(opt).find('h5').length);
    // var h = $(opt).find('h5');
    // test = []
    // for(abc=0;abc<h.length;abc++ ){
    //     if(abc % 5 == 0 ){
    //         break
    //     }else{
    //         test.push(h[abc]);
    //         console.log(test);
    //     }
    //     // test.push(abc);
    //
    // }
    // console.log(h);
    // for(b=0;b<h.length;b++){
    //     if(b % 5 == 0){
    //         for(c=0;c<=b;c++) {
    //             var item = document.createElement("div");
    //             item.className = "timeline__item timeline__item--1"
    //             var opt = document.createElement("div")
    //             opt.className = "timeline__item__content"
    //             opt.innerHTML = test
    //             item.appendChild(opt)
    //             showScriptResult.append(test[c]);
    //             console.log(test[c]);
    //             // break;
    //         }
    //     }else{
    //         test.push(h[b]);
    //         console.log(test);
    //         // for(d=0;d<h.length;d++){
    //         //     console.log(test);
    //         //     console.log(test[d]);
    //         // }
    //     }
    //
    // }
    // showScriptResult.appendChild(item);
    // var rows =  $('.Result').children().find("h5").prevAll();
    // console.log(rows);
    // showScriptResult.appendChild(item)
    // showScriptResult.appendChild(item)
    // console.log(inner);
}

function createScriptTableLine(data) {
    //create table
    var showScriptTbody = document.getElementById("showScriptTbody");
    var tr = document.createElement("tr");
    //script name
    var script = document.createElement("td");
    script.textContent = data["script"];
    tr.appendChild(script);
    //create  time
    var time = document.createElement("td");
    time.className = "hidden-xs";
    time.textContent = data["time"];
    tr.appendChild(time);
    //opeation button
    //edit button
    var opTd = document.createElement("td");
    var editButton = document.createElement("button");
    editButton.className = " btn btn-xs btn-primary  glyphicon glyphicon-eye-open";
    editButton.setAttribute("filename", data["script"]);
    editButton.onclick = function () {
	window.currentEditScriptContentButton=this;
        var filename = this.getAttribute("filename");
        showScriptContent(filename);
        document.getElementById("scriptContent").focus();
        document.getElementById("writeScriptContent").setAttribute("filename", filename);//bind submit button attr
    }
    opTd.appendChild(editButton);
    tr.appendChild(opTd);
    //del button
    var deleteButton = document.createElement("button");
    deleteButton.className = "btn btn-xs btn-danger glyphicon glyphicon-trash";
    deleteButton.setAttribute("filename", data["script"]);
    deleteButton.style.marginLeft = "3px";
    deleteButton.onclick = function () {
        deleteScript(this);
    }
    opTd.appendChild(deleteButton);
    tr.appendChild(opTd);
    //exec button
    var startButton = document.createElement("button");
    startButton.className = "btn btn-xs btn-success glyphicon glyphicon-play-circle";
    startButton.setAttribute("filename", data["script"]);
    startButton.style.marginLeft = "3px";
    startButton.onclick = function () {
        //choose server next step
        document.getElementById("scriptResultLoad").style.display = "none";
        document.getElementById("goParameter").removeAttribute("disabled");
        //close args button
        document.getElementById("goInit").setAttribute("disabled","disabled");
        $("#goRun").parent()[0].setAttribute("disabled", "disabled");//disable exec button
        $("#goRun").text("执行").removeClass("fa fa-spin fa-refresh");

        window.currentRunScriptName = this.getAttribute("filename");//script name
        $('#myTab li:eq(0) a').tab('show') // Select third tab (0-indexed)
        scriptSelectServer();//script with server option
    }
    opTd.appendChild(startButton);
    tr.appendChild(opTd);
    //add it to table
    showScriptTbody.appendChild(tr);
}
function deleteScript(deleteButton) {
    //deleteButton filename
    var filename = deleteButton.getAttribute("filename");
    var td = $(deleteButton).parent();
    var tr = $(td).parent();
    jQuery.ajax({
        "url": deleteScriptURL,
        "dataType": "jsonp",
        "data": {"filename": filename},
        "beforeSend": start_load_pic,
        "error": errorAjax,
        "complete": stop_load_pic,
        "success": function (data) {
            if (!data.status) {
                showErrorInfo(data.content);
                return false;
            }
            else {
                showSuccessNotic();
                $(tr).remove();//del line
            }
        }
    });
}
function scriptSelectAllServers() {
    window.runScriptServers = [];
    $("#scriptSelectServerTbody").find("span").filter(".glyphicon-check").filter(".hostClass").each(function () {
        //every checkbox val
        var ip = this.getAttribute("value");
        window.runScriptServers.push(ip);
    });
    if (window.runScriptServers.length == 0) {
        return false;
    }
    else {
        return true;
    }
}
function goInit() {
    $('#myTab li:eq(2) a').tab('show') // show script init gui
    //change pic
    $("#goRun").text("").addClass("fa fa-spin fa-refresh");
    createInitScriptProgress();// create script init gui
    //start request
    startScriptInit();


}

function initScriptDropZ() {
    var dropz = new Dropzone("#uploadScriptDropz", {
        url: uploadScriptToServer,
        clickable: false,//cancel click
    });
    dropz.on("addedfile", function (file) {
        $(".dz-preview").remove(); //del source text notice
        //show progress bar
        window.fileUploadLocalFileName = file.name;//filename;
        // startShadow();
        var showScriptProgressText = document.getElementById("showScriptProgressText");

        showScriptProgressText.innerText = 0 + "%";
        showScriptProgressText.style.width = "0%";
        $("#uploadScriptProgressDiv").animate(
            {
                "left": "0%",
            }
        );

    });
    dropz.on("uploadprogress", function (file, progress, sendsize) {
        var showScriptProgressText = document.getElementById("showScriptProgressText");
        progress = parseInt(progress);
        if (isNaN(progress)) {
            //upload bad
            showErrorInfo("不能连接到服务器")
            return false;
        }
        showScriptProgressText.innerText = progress + "%";
        showScriptProgressText.style.width = progress + "%";
    });
    dropz.on("success", function (file, data) {
        //upload success return data
        stopShadow();
        $("#dropz").slideUp("fast");//close upload gui
        $("#uploadScriptProgressDiv").animate(
            {
                "left": "120%",
            }
        ); //close progress bar
        data = JSON.parse(data);
        if (!data.status) {
            showErrorInfo(data.content);
            return false;
        }
        var content = data.content;
        createScriptTableLine(content);


    })
}

//search the  script content
function searchValue(input) {
    var searchValue = input.value.toLowerCase();
    var table = $("table").find("tbody tr");
    table.each(
        function () {
            // if(!searchValue)return false;
            var e = jQuery(this);
            var eValue = e.text().toLowerCase();
            if (!eValue.match(searchValue)) {
                e.hide();
            }
            else {
                e.show()
            }
        }
    );

};
//init
$(function () {
    initScriptDropZ()
    //bind refreash
    document.getElementById("refreshScriptList").onclick = function () {
        window.location.reload();
    }
    // script list
    loadScriptList();
    //bind close script content
    document.getElementById("closeScriptContent").onclick = function () {
        $("#scriptArea").animate({
            "top": "100%",
        }, function () {
            document.getElementById("scriptArea").style.display = "none";
        });
    }
    //bind keyboard input
    document.getElementById("scriptContent").onkeydown = function () {
        if (event.keyCode == 9) {
            $(this).insertAtCaret("\t");//tab
        }
    }
    //bind create / update
    document.getElementById("writeScriptContent").onclick = function () {
        submitScriptContent();
    }
    //close script input window
    document.getElementById("closeScriptNameButton").onclick = function () {
        stopShadow();
        $("#showScriptName").hide("fast");
    }
    //create script button
    document.getElementById("createScriptName").onclick = function () {
        $("#showScriptName").show("fast");
        document.getElementById("scriptName").focus();
        // startShadow();
    }

    //input script next step
    document.getElementById("inputScriptName").onclick = function () {
        var filename = document.getElementById("scriptName").value;
        if (/^ *$/.test(filename)) {
            $(".modal-content").effect("shake");//not had filename
            document.getElementById("scriptName").focus();
            return false;
        }
        stopShadow();
        document.getElementById("scriptName").value = "";
        document.getElementById("writeScriptContent").setAttribute("filename", filename);//bind attr for submit
        document.getElementById("showScriptName").style.display = "none";//close script name input window
	document.getElementById("scriptArea").style.display="block";
        $("#scriptArea").animate({
            "top": "0%",
        });
        document.getElementById("scriptContent").focus();
    }
    $(document).on('keyup', '.searchValue', function () {
        searchValue(this);
    });
    //cancel choose server
    document.getElementById("closeScriptDiv").onclick = function () {
        $("#scriptDIV").effect("puff", 500);
        stopShadow();
    }
    //choose all serve event
    $("#scriptSelectAllServers").toggle(
        function () {
            $(this).removeClass("glyphicon-check").addClass("glyphicon-unchecked");
            $("tbody").find("span").removeClass("glyphicon-check").addClass("glyphicon-unchecked");
        }, function () {
            $(this).removeClass("glyphicon-unchecked").addClass("glyphicon-check");
            $("tbody").find("span").removeClass("glyphicon-unchecked").addClass("glyphicon-check");

        }
    );
    //bind jump page button
    document.getElementById("goParameter").onclick = function () {
        if (!scriptSelectAllServers()) {
            //server = 0
            showErrorInfo("请选择主机!");
            return false;
        }
        else {
            this.setAttribute("disabled", "disabled");
            $('#myTab li:eq(1) a').tab('show');// Select third tab (0-indexed)
            //enable args page button
            document.getElementById("goInit").removeAttribute("disabled");
            var p = document.getElementById("inputScriptParameter");
            p.focus();
            p.value = "";
        }

    };
    //script input next step
    document.getElementById("goInit").onclick = function () {
        this.setAttribute("disabled", "disabled");
        goInit();
    };
    //bind exec script button
    document.getElementById("goRun").onclick = function () {
        this.parentNode.setAttribute("disabled", "disabled");
        goRun();//jump script run result
    };
    $( ".modal-content" ).draggable();

})

function _getScriptResult(tid, ip) {
    return function () {
        getScriptResult(tid, ip);
    }
}


function getScriptResult(tid, ip) {
    var progressBar = document.getElementById("runScriptProgress");
    var showScriptResult = document.getElementById("showScriptResult");
    jQuery.ajax({
        "url": getCommandResultURL,
        "data": {"ip": ip, "tid": tid},
        "error": errorAjax,
        "dataType": "jsonp",
        "success": function (data) {
            var progress = data.progress;
            progressBar.style.width = progress + "%";//show progress bar
            progressBar.textContent = progress + "%";
            var pre = document.createElement("pre");

            // console.log(data["content"]["content"]["commit"]);
           // pre.innerText = data["content"]["content"];//data format had 3 obj
           //  console.log(pre);
            if( /^ *$/.test(data["content"]["content"])){
                //null
            }
            else{
                //filter string
                var filter = data['content']['content'].replace(/\[m/g, '');
                var content1 = filter.replace("[?1h=",'');
                var content = content1.replace(/\[K\[?1l>/, '');
                pre.innerHTML = content
                //add content to page
                // createScriptResult(data["content"]["content"]);
                showScriptResult.appendChild(pre);
            }
            if (data.progress == 100) {
                $("#runScriptProgress").removeClass("active");
                document.getElementById("scriptResultLoad").style.display = "none";//
                showSuccessNotic();

            }
            else{
                setTimeout(_getScriptResult(tid, ip), 1000);
            }
        }
    });
}


function executeScript() {
    //every server exec cmd were different , will one and one to run
    $("#runScriptProgress").addClass("active");  //进度条添加动画
    var parameter = document.getElementById("inputScriptParameter").value;//脚本的参数
    for (var i = 0; i < window.successScriptInit.length; i++) {
        var cmd = window.successScriptInit[i].dfile;
        var ip = window.successScriptInit[i].ip;
        //每一个服务器
        var ip = window.successScriptInit[i].ip;
        var cmd = window.successScriptInit[i].dfile;
        cmd = cmd + "  " + parameter;//cmd + args
        var data = {"cmd": cmd, "force": true, "servers": [ip], "multi_thread": true, "task_type": "cmd"};
        data = JSON.stringify(data);
        var showScriptResult = document.getElementById("showScriptResult");//show cmd result
        var progressDiv = document.getElementById("runScriptProgress");
        $.ajax({
            "url": executeCommandURL,
            "data": {"parameters": data},
            "dataType": "jsonp",
            "error": errorAjax,
            "success": function (data) {
                if (!data.status) {
                    showErrorInfo(data.content);
                    return false;
                }
                else {
                    var tid = data.content;
                    getScriptResult(tid, ip);//show cmd result
                }
            }
        });
    }
}


function goRun() {
    executeScript();
    $('#myTab li:eq(3) a').tab('show') // Select third tab (0-indexed)
    $("#showScriptResult").children().remove();//clean last result
    document.getElementById("scriptResultLoad").style.display = "block";
}

function startScriptInit() {
    var inputScriptParameter = document.getElementById("inputScriptParameter").value;//script args
    window.successScriptInit = [];//[{"sid":111,"dfile":dfile}] server : script name
    window.failedScriptInitNum = 0;// init script num
    window.runScriptInitServerNum = $("#scriptInit").find("label").length;//save  to need run cmd server num
    $("#scriptInit").find("label").each(function () {
        //this -> label tag
        var ip = this.getAttribute("ip");
        var label = this;
        $.ajax({
            "url": scriptInitURL,
            "data": {"sfile": window.currentRunScriptName, "parameter": inputScriptParameter, "ip": ip},
            "error": errorAjax,
            "dataType": "jsonp",
            "success": function (data) {
                if (!data.status) {
                    var progressDiv = $(label).siblings().remove();//remote progress bar
                    var parent = $(label).parent()[0];//label,error,progress,html
                    var errLable = document.createElement("label");//error tag
                    errLable.className = "label label-danger";
                    errLable.textContent = data.content;
                    parent.appendChild(errLable);//add error tag to doc
                    window.failedScriptInitNum += 1; // error script + 1
                }
                else {
                    var tid = data.tid;
                    var dfile = data.dfile;
                    getScriptInitProgress(label, tid, dfile, ip)
                }
            }
        });
    })
    listenScriptInitStatus();
}


function _getScriptInitProgress(label, tid, dfile, ip) {
    return function () {
        getScriptInitProgress(label, tid, dfile, ip);
    }
}

function getScriptInitProgress(label, tid, dfile, ip) {
    //label -> ip
    $.ajax({
        "url": getFileTransProgressURL,
        "dataType": "jsonp",
        "error": errorAjax,
        "data": {"tid": tid},
        "success": function (data) {
            if (!data.status) {
                var progressDiv = $(label).siblings().remove();
                var parent = $(label).parent()[0];//label,error,progress
                var errLable = document.createElement("label");//error tag
                errLable.className = "label label-danger";
                errLable.textContent = data.content;
                parent.appendChild(errLable);//add  error tag to doc
                window.failedScriptInitNum += 1;
            }
            else {
                var progress = parseInt(data.progress);
                if (progress < 100) {
                    var progressDiv = $(label).siblings()[0];//progress区域
                    var sonProgressDiv = $(progressDiv).children()[0];
                    sonProgressDiv.style.width = progress + "%";
                    sonProgressDiv.textContent = progress + "%";
                    setTimeout(_getScriptInitProgress(label, tid, dfile, ip), 1000);
                }
                else {
                    //document.getElementById("scriptResultLoad").style.display="none";//
                    var parent = $(label).parent()[0];
                    $(label).siblings().remove();
                    var successLabel = document.createElement("label");
                    successLabel.className = "label label-success";
                    successLabel.textContent = "成功";
                    parent.appendChild(successLabel);
                    info = {
                        "ip": ip,
                        "dfile": dfile,
                    };
                    window.successScriptInit.push(info);//save success server
                }
            }
        }
    });
}

function listenScriptInitStatus() {
    //listen script status until  finish
    if (window.successScriptInit.length + window.failedScriptInitNum < window.runScriptInitServerNum) {
        setTimeout(listenScriptInitStatus, 1000);
    }
    else if (window.runScriptInitServerNum == window.failedScriptInitNum + window.successScriptInit.length) {
        //finish
        if (window.runScriptInitServerNum == window.successScriptInit.length) {
            //all script were finish
            goRun();
        }
        else {
            //error script notice , reset  start
            $("#scriptInit").effect("shake");
            document.getElementById("goRun").parentNode.removeAttribute("disabled");
        }
    }
    $("#goRun").removeClass("fa fa-spin fa-refresh").text("执行");


}
