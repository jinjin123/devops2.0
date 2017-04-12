/**
 * Created by wupeijin on 17/4/10.
 */

$(function(){
    initKeyFileDropZ();
    showKeyFileTable();//load key list
    $(document).on('keyup', '.searchValue', function () {
        searchValue(this);
    });
})

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

function initKeyFileDropZ(){
    var dropz = new Dropzone("#uploadKeyFileDropz", {
        url: uploadKeyFileURL,
        clickable:false,
    });
    dropz.on("addedfile", function (file) {
        $(".dz-preview").remove(); //删除自带的文本提示
        document.getElementById("uploadKeyFileProgress").style.display="block";
        window.fileUploadLocalFileName=file.name;
        startShadow();
    });
    dropz.on("uploadprogress", function (file, progress, sendsize) {
        var uploadKeyFileProgress=document.getElementById("uploadKeyFileProgress");
        progress=parseInt(progress);
        if(isNaN(progress)){
            showErrorInfo("不能连接到服务器")
        }
        uploadKeyFileProgress.innerText=progress +"%";
    });
    dropz.on("success",function(file,tmp){
        stopShadow();
        document.getElementById("uploadKeyFileProgress").style.display="none";
        createKeyFileTbody(window.whoami,file.name);
        showSuccessNotic();


    })
    document.getElementById("refreshKeyFileList").onclick=function(){
       loadKeyFileAdminHTML();
    }

}


function createKeyFileTbody(filename){
    var showKeyFileTbody=document.getElementById("showKeyFileTbody");
    var tr=document.createElement("tr");
    var filenameTd=document.createElement("td");
    filenameTd.innerText=filename;// filename
    tr.appendChild(filenameTd);
    var opTd=document.createElement("td");
    var deleteButton=document.createElement("button");
    deleteButton.className="btn btn-xs btn-danger glyphicon glyphicon-trash";
    deleteButton.setAttribute("filename",filename);
    deleteButton.onclick=function(){
        deleteKeyFile(this);
    }
    opTd.appendChild(deleteButton);
    //opeation button
    var editButton=document.createElement("button");
    editButton.style.marginLeft="3px";
    editButton.className="btn btn-xs btn-success glyphicon glyphicon-edit ";
    editButton.onclick=function(){
        chownKeyFile();
    }
    opTd.appendChild(editButton);
    tr.appendChild(opTd);
    showKeyFileTbody.appendChild(tr);
}

function chownKeyFile(){
    showErrorInfo("TODO  feature")
    return false;
}

function deleteKeyFile(team){
    var filename=team.getAttribute("filename");
    var td=$(team).parent();
    var tr=$(td).parent();
    var data={"filename":filename};
    data=JSON.stringify(data);
    jQuery.ajax({
        "url":deleteKeyFileURL,
        "dataType":"jsonp",
        "data":{"parameters":data},
        "error":errorAjax,
        "beforeSend":start_load_pic,
        "complete":stop_load_pic,
        "success":function(data){
            if(!data.status){
                showErrorInfo(data.content);
                return false;
            }
            else{
                showSuccessNotic();
                $(tr).remove();
            }
        }
    });
}

function showKeyFileTable(){
    jQuery.ajax({
        "url":keyAdminURL,
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
                var content=data.content;//[]
                for(var i=0;i<content.length;i++){
                    line=content[i];
                    createKeyFileTbody(line.keyfile);
                }

            }

        }
    });
}