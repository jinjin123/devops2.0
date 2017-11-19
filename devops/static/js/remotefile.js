/**
 * Created by wupeijin on 17/4/8.
 */

function closeEditDiv(){
    //close edit remote file Div
    stopShadow();
    $("#remoteFileEditDiv").hide("fast");
}

function showEditDiv(){
    //edit remote file Div
    // startShadow();
    $("#remoteFileEditDiv").show("fast");
    document.getElementById("remoteFilePath").focus();
}

function createRemoteFileLine(data){
    var tbody=document.getElementById("remoteFileTbody");
    var id=data.id;
    var path=data.path;
    var server=data.ip;
    var description=data.description;
    var ip=data.ip;
    var tr=document.createElement("tr");

    //path
    var td=document.createElement("td");
    td.textContent=path;
    td.className="path";
    tr.appendChild(td);

    //server
    var td=document.createElement("td");
    td.textContent=ip;
    td.setAttribute("sid",server);
    td.className="ip";
    tr.appendChild(td);

    //description
    var td=document.createElement("td");
    td.textContent=description;
    td.className="description";
    tr.appendChild(td);

    //operation
    //show button
    var td=document.createElement("td");
    var viewButton=document.createElement("button");
    viewButton.className="btn btn-primary  btn-xs glyphicon glyphicon-eye-open";
    viewButton.onclick=function(){
        window.currentRemoteFileViewButton=this;// update file need it .
        var tid=this.getAttribute("id");
        var action="GET";
        loadRemoteFileContentToTextArea(tid,action);
    }
    viewButton.setAttribute("id",id);
    viewButton.style.marginLeft="3px";
    td.appendChild(viewButton);
    //edit button
    var editButton=document.createElement("button");
    editButton.className="btn btn-success btn-xs  glyphicon glyphicon-edit";
    editButton.setAttribute("tid",id);
    editButton.style.marginLeft="3px";
    editButton.onclick=function(){
        document.getElementById("saveRemoteFileManage").setAttribute("tid",this.getAttribute("tid"));
        window.currentRemoteFileModel="edit";
        window.currentRemoteFileButton=this;
        loadRemoteFileToEdit(this);

    }
    td.appendChild(editButton);
    //del button
    var deleteButton=document.createElement("button");
    deleteButton.className="btn btn-danger btn-xs  glyphicon glyphicon-trash";
    deleteButton.setAttribute("id",id);
    deleteButton.style.marginLeft="3px";
    deleteButton.onclick=function(){
        deleteRemoteFile(this);
    }
    td.appendChild(deleteButton);
    tr.appendChild(td);

    tbody.appendChild(tr);
}

function loadRemoteFileContentToTextArea(tid,action){
    //load file content in frame
    jQuery.ajax({
        "url":getRemoteFileContentURL,
        "dataType":"jsonp",
        "data":{"tid":tid,"action":action},
        "error":errorAjax,
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "success":function(data){
		// responseCheck(data)
            if(!data.status){
		        showErrorInfo(data.content);
                return false;
            }
            else{
		        document.getElementById("remoteFileArea").style.display="block";// view frame
                $("#remoteFileArea").animate({
                    "top":"0%",
                });
                var content=data.content;
                var t=document.getElementById("showRemoteFileContent");
                t.value=content;
                t.focus();
                $('#showRemoteFileContent').setTextareaCount();
            }
        }
    });
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


function updateRemoteFileList(){
    //update remote file   Div configure
    var td=window.currentRemoteFileButton.parentNode;
    var path=document.getElementById("remoteFilePath").value;
    var select=document.getElementById("remoteFileServer");//select option
    var options=select.options;//all options
    var index=select.selectedIndex;//option choose index
    var ip=options[index].text;//get option content
    var description=document.getElementById("remoteFileDescription").value;
    if(/^ *$/.test(path)   ){
        //not null
        $("#remoteFileEditDiv").effect("shake");
        return false;
    }
    else{
        $(td).siblings(".path")[0].textContent=path;
        $(td).siblings(".ip")[0].textContent=ip;
        $(td).siblings(".description")[0].textContent=description;
    }
}

function loadRemoteFileToEdit(editButton){
    //load remote file list
    var td=editButton.parentNode;
    var id=editButton.getAttribute("id");
    // var owner=$(td).siblings(".owner")[0].textContent;
    var path=$(td).siblings(".path")[0].textContent;
    var sid=$(td).siblings(".ip")[0].getAttribute("sid");
    var description=$(td).siblings(".description")[0].textContent;
    showEditDiv();
    document.getElementById("remoteFilePath").value=path;
    document.getElementById("remoteFileDescription").value=description;
    //设置服务器选中值
    var serverSelect = document.getElementById("remoteFileServer");
    for(var i=0; i<serverSelect.options.length; i++){
        if(serverSelect.options[i].value == sid){
            serverSelect.options[i].selected = true;
            break;
        }
    }
}

function deleteRemoteFile(deleteButton){
    //del id  with remote file
    var id=deleteButton.getAttribute("id");
    jQuery.ajax({
        "url":deleteRemoteFileListURL,
        "data":{"id":id},
        "dataType":"jsonp",
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "error":errorAjax,
        "success":function(data){
            if(!data.status){
                showErrorInfo(data.content);
                return false;
            }
            else{
                showSuccessNotic();
                //del a line
                var td=deleteButton.parentNode;
                var tr=td.parentNode;
                $(tr).remove();
            }
        }
    });
}

function getRemoteFileSetValue(){
    //get  form input value
    var path=document.getElementById("remoteFilePath").value;
    var select=document.getElementById("remoteFileServer");
    var server=select.value; // select option value
    var options=select.options;// all options
    var index=select.selectedIndex;//option choose index
    var ip=options[index].text;//get  option content
    var description=document.getElementById("remoteFileDescription").value;
    var tid=document.getElementById("saveRemoteFileManage").getAttribute("tid");
    if(/^ *$/.test(path)  ){
        //not null
        $(".modal-dialog").effect("shake");
        return false;
    }
    else{
        var _data={"path":path,"server":server,"description":description,"ip":ip};
        //if  save button had id ? action = update : create
        if(tid){
            _data["id"]=tid;
        }

        $.ajax({
            "url":addRemoteFileURL,
            "data":_data,
            "dataType":"jsonp",
            "beofreSend":start_load_pic,
            "complete":stop_load_pic,
            "error":errorAjax,
            "success":function(data){
                if(!data.status){
                    showErrorInfo(data.content);
                    return false;
                }
                else{
                    _data["id"]=data.tid;
                    if(window.currentRemoteFileModel=="create"){
                        createRemoteFileLine(_data);
                        console.log(_data);
                    }
                    else{
                        updateRemoteFileList()
                    }
                    closeEditDiv();
                    showSuccessNotic();
                }
            }

        });
    }
}
function loadServers(){
    var select=document.getElementById("remoteFileServer");
    for(var i=0;i<window.allServersList.length;i++){
        var sid=window.allServersList[i]["id"];
        var ip=window.allServersList[i]["ip"];
        var option=document.createElement("option");
        option.textContent=ip;
        option.value=sid;
        select.appendChild(option);
    }
}


function loadRemoteFileList(){
    //load remote file path list
    jQuery.ajax({
        "url":getRemoteFileListURL,
        "dataType":"jsonp",
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "error":errorAjax,
        "success":function(data){
            if(!data.status){
                showErrorInfo(data.content);
                return false;
            }
            else{
                var content=data.content;
                for( id in content){
                    var line=content[id];
                    createRemoteFileLine(line);
                }
            }
        }
    });
}


(function ($) {
    //tab sign for textarea input
    $.fn.extend({
        insertAtCaret: function (myValue) {
            var $t = $(this)[0];
            if (document.selection) {
                this.focus();
                sel = document.selection.createRange();
                sel.text = myValue;
                this.focus();
            }
            else if ($t.selectionStart || $t.selectionStart == '0') {
                var startPos = $t.selectionStart;
                var endPos = $t.selectionEnd;
                var scrollTop = $t.scrollTop;
                $t.value = $t.value.substring(0, startPos) + myValue + $t.value.substring(endPos, $t.value.length);
                this.focus();
                $t.selectionStart = startPos + myValue.length;
                $t.selectionEnd = startPos + myValue.length;
                $t.scrollTop = scrollTop;
            }
            else {
                this.value += myValue;
                this.focus();
            }
        }
    })
})($);

function closeAreaText(){
    //close textcontent windows
    $("#remoteFileArea").animate({
        "top":"100%",
    },function(){
		document.getElementById("remoteFileArea").style.display="none";
	});
}

function updateRemoteFileContent(){
    //update remote file content
    var content=document.getElementById("showRemoteFileContent").value;
    var tid=window.currentRemoteFileViewButton.getAttribute("id");
    jQuery.ajax({
        "url":writeRemoteFileContentURL,
        "type":"POST",
        "data":{"tid":tid,"content":content},
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "error":errorAjax,
        "success":function(data){
            if(!data){
                return false;
            }
            closeAreaText();
            showSuccessNotic();
        }
    });

}

$(function(){
    setTimeout('loadServers()',1000);//load server list
    //close Div
    document.getElementById("closeRemoteFileDiv").onclick=function(){
        closeEditDiv();
    }
    //show Div
    document.getElementById("createRemoteFile").onclick=function(){
        document.getElementById("saveRemoteFileManage").removeAttribute("tid");//del tid , new create
        window.currentRemoteFileModel="create";
        showEditDiv();
    }
    //bind refreash
    document.getElementById("refreshRemoteFile").onclick=function(){
        loadRemoteFileList();
    }
    //bind save
    document.getElementById("saveRemoteFileManage").onclick=function(){
        getRemoteFileSetValue();

    }
    //load remote file list
    loadRemoteFileList();
    //$("#showRemoteFileContent").setTextareaCount();//bind a line
    // bind  remote file content keyboard input
    document.getElementById("showRemoteFileContent").onkeydown = function () {
        if (event.keyCode == 9) {
            $(this).insertAtCaret("\t");// tab
        }
    }
    //search input
    $(document).on('keyup', '.searchValue', function () {
        searchValue(this);
    });
    // bind close show remote file content  button
    document.getElementById("closeRemoteFileContentButton").onclick=function(){
        closeAreaText()
    }
    //bind update remote file content
    document.getElementById("writeRemoteFileContentButton").onclick=function(){
        updateRemoteFileContent();
    }

    $( ".modal-content" ).draggable();// window to move

})
