/**
 * Created by wupeijin on 17/4/6.
 */


//load docker img list
function load_docker_img(){
      fetch(DockerIMG, {
            method: 'get',
            //headers: {"Content-type": "application/javascript charset=UTF-8"}
            headers: {"Content-type": "application/json  charset=UTF-8"}
        })
        .then(
            function(response) {
                response.json().then(function(data) {
                if (response.status == 200) {
                    console.log(JSON.parse(data));
                    data = JSON.parse(data  )
                    var tree_view = []
                    $.each(data, function (index, fvalue, array) {
                        var img = {}
                        if (fvalue['sub']) {
                            img['text'] = fvalue.name
                            img['tags'] = [fvalue.sub.length]
                            img['nodes'] = []

                            $.each(fvalue.sub, function (index, svalue, array) {
                                img['nodes'].push({
                                    "text": svalue.name,
                                    //show this image tag detail content
                                    // "href": "docker_imagestags?" + JSON.stringify(res),
                                    "href": "docker_imagestags?image=" + fvalue.name + "/" + svalue.name,
                                    // "href": "docker_img?image=" + fvalue.name + "/" + svalue.name,
                                    "selectable": false
                                })
                            })
                            img["selectable"] = false
                            tree_view.push(img)
                        }
                    })
                    $.each(data, function (index, fvalue, array) {
                        var img = {}
                        if (!fvalue['sub']) {
                            img['text'] = fvalue.name
                            //show this images  content
                            img["href"] = "docker_img?image=" + fvalue.name
                            img["selectable"] = false
                            tree_view.push(img)
                        }
                    })
                    if (tree_view.length) {
                        $('#image_list').treeview({
                            data: tree_view,
                            levels: 1,
                            showTags: true,
                            enableLinks: true
                        });
                    } else {
                        $('#image_list').treeview({data: [{"text": "仓库是空的 ..."}]})
                        $('#image_list').treeview('disableAll', {silent: true});
                        $('#btn_collapse_all').attr('disabled', true)
                        $('#btn_delete_images').attr('disabled', true)
                        $('#ipt_search_images').attr('disabled', true)
                    }
                }
            });
        })
          .catch(function (err) {
              alert("标签列表获取异常！" + err);
          });

        var search = function(e) {
            var options = {
                ignorecase: true,
                exactmatch: false,
                revealresults: true
            }
            var pattern = $('#ipt_search_images').val();
            var results = $('#image_list').treeview('search', [ pattern, options ]);
            if (!$('#ipt_search_images').val()) {
                collapseAll()
            }
        }
        $('#ipt_search_images').on('keyup', search);
}

function collapseAll() {
    $('#image_list').treeview('collapseAll', {silent: true});
}

// submit  repo conf
function SubmitRepoName (){
    var address = document.getElementById("address").value;
    var username = document.getElementById("repo_user").value;
    var password = document.getElementById("repot_pass").value;
    console.log(address);
    var data =  {"address": address,"repo_user": username,"repo_pass": password};
    data = JSON.stringify(data) ;
    $.ajax({
        "type":"POST",
        "url": SubmitRepoURL,
        "dataType": "json",
        "data": {"parameters":data},
        "beforeSend": start_load_pic,
        "error": errorAjax,
        "complete": stop_load_pic,
        "success": function (data) {
            console.log(data);
            if (!data.status) {
                showErrorInfo(data.content);
                return false;
            }
            else {
                showSuccessNotic();
            }
        }
    })

}
//load repo list
function load_repo_list(){
    $.ajax({
        "url": LoadRepoListContentURL,
        "dataType": "jsonp",
        "beforeSend": start_load_pic,
        "error": errorAjax,
        "complete": stop_load_pic,
        "success": function (data) {
          //  console.log(data.content);
           for (let i in data.content){
              data.content[i] = JSON.parse(data.content[i]);
              // console.log(data.content[i]);
           }
              // console.log(data.content);
            // let data1 = (data.content.data);
            // data2 = JSON.parse(data1);
            // console.log(data2);
            // let result = Array.from(data.content)
            // responseCheck(data);
            // var data = JSON.parse(data);
            if (!data.status) {
                showErrorInfo(data.content);
                return false;
            }
            else {
                showSuccessNotic();
                createRepoTableLine(data.content);
            }
        }
    })
}
function deleteRepo(deleteButton) {
    //deleteButton filename
    var addname = deleteButton.getAttribute("address");
    console.log(addname)
    var td = $(deleteButton).parent();
    var tr = $(td).parent();
    jQuery.ajax({
        "url": deleteRepotURL,
        "dataType": "jsonp",
        "data": {"addname": addname},
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
//create table
function createRepoTableLine(data) {
    // console.log(data);
    //防止多次加载
    $("#showDockerRepoTbody").children().remove();
    for(let arr in data){
        var showDockerRepoTbody = document.getElementById("showDockerRepoTbody");
        var tr = document.createElement("tr");
        //script name
        var Repo = document.createElement("td");
        Repo.textContent = data[arr]["address"];
        tr.appendChild(Repo);
        //create  time
        var time = document.createElement("td");
        time.className = "hidden-xs";
        time.textContent = data[arr]["time"];
        tr.appendChild(time);
        //opeation button
        var opTd = document.createElement("td");
        var deleteButton = document.createElement("button");
        deleteButton.className = "btn btn-xs btn-danger glyphicon glyphicon-trash";
        deleteButton.setAttribute("address", data[arr]["address"]);
        deleteButton.style.marginLeft = "3px";
        deleteButton.onclick = function () {
            deleteRepo(this);
        }
        opTd.appendChild(deleteButton);
        tr.appendChild(opTd);
        showDockerRepoTbody.appendChild(tr);

    }
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
    )

};
function GotBackPage(){
        document.getElementById("address").value = '';
        document.getElementById("repo_user").value = '';
        document.getElementById("repot_pass").value = '';
        document.getElementById("MoveCreateDiv").style.display = "block";
        $('#CreateDockerRepo').css({background: "white", height: "100%", display: "block"});
        $('#CreateRepo').attr("disabled",true);
        $("#showCreateDiv").hide("fast");
}
//init
$(function () {
    load_repo_list();
    //bind refreash
    document.getElementById("refreshRepoList").onclick = function () {
        window.location.reload();
    }
    //create repo button
    document.getElementById("CreateRepoDiv").onclick = function () {
        // $("#CreateDockerRepo").css("display","none");
        document.getElementById("MoveCreateDiv").style.display="none";
        $('#CreateDockerRepo').css({background:"#F3F3F4",height:"100%",display:"block"})
        $("#showCreateDiv").show("fast");
        document.getElementById("address").focus();
    };
    //GotBack repo list
    document.getElementById("GotBack").onclick = function () {
            GotBackPage();
    };
    //enable button
    $(document).on('keyup','#address',function(){
        $('#CreateRepo').attr("disabled",false);
    });

    //toggle chick
    $('#supportbuild').on('click',function(){
        $("#no_support_build").attr("checked",false);
    });
    $('#no_support_build').on('click',function(){
        $("#supportbuild").attr("checked",false);
    });
    $("#CreateRepo").on('click',function(){
            SubmitRepoName();
            GotBackPage();
    });
    $("#docker_img").on('click',function () {
            load_docker_img();
    });
    $("#Docker_repo").on('click',function () {
        load_repo_list();
    });
    $(document).on('keyup', '.searchValue', function () {
        searchValue(this);
    });

})
