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
//load pulled images list
function  load_pulled_images(){
  $.ajax({
      "url": Docker_pulled_images,
      "dataType": "jsonp",
      "beforeSend": start_load_pic,
      "error": errorAjax,
      "complete": stop_load_pic,
      "success": function (data) {
        //  console.log(JSON.parse(data));
        data = JSON.parse(data)
        console.log(data)
        if (data.status == false){
              showErrorInfo(data.content);
        } else {
           console.log(data.content)
              createImageLine(data.content);
          //  for (let i in data.content){
          //      console.log(i)
          //     data.content[i] = JSON.parse(data.content[i]);
          //     console.log(data.content[i]);
          //     // console.log(data.content[i]);
          //     // showSuccessNotic();
          //     createImageLine(data.content[i]);
          //  }
        }
          // if (!data.status) {
              // showErrorInfo(data.content);
              // return false;
          // }
          // else {
              // showSuccessNotic();
              // createRepoTableLine(data.content);
          // }
      }
  })
}
function createImageLine(data){
    $('#showDockerImagesTbody').children().remove();
    for(let i in data){
       data[i] = JSON.parse(data[i]);
       var showDockerImagesTbody = document.getElementById("showDockerImagesTbody");
       var tr = document.createElement("tr")
       // title
       var Title = document.createElement("td");
       Title.textContent = data[i]["fromImage"];
       tr.appendChild(Title);
       //tag
       var tag = document.createElement("td");
       tag.textContent = data[i]["tag"];
       tr.appendChild(tag);
       // id
       var id = document.createElement("td");
       id.textContent = data[i]["id"];
       tr.appendChild(id);
       //size
       var size = document.createElement("td");
       size.textContent = data[i]["size"] + 'M';
       tr.appendChild(size);
       //date
       var created = document.createElement("td");
       created.textContent = data[i]["created"] ;
       tr.appendChild(created);
       //action
       var opTd = document.createElement("td");
       var deleteButton = document.createElement("button");
       deleteButton.className = "btn btn-xs btn-danger glyphicon glyphicon-trash";
       deleteButton.setAttribute("image_name", data[i]["fromImage"]);
       deleteButton.style.marginLeft = "3px";
       deleteButton.onclick = function () {
           deleteImg(this);
       }
       opTd.appendChild(deleteButton);
       tr.appendChild(opTd);
       showDockerImagesTbody.appendChild(tr);

      //  $('#showDockerImagesTbody').children().remove();
    }
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
//del  docker repo
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
//del  docker  images
function deleteImg(deleteButton) {
    //deleteButton filename
    var delname = deleteButton.getAttribute("image_name");
    console.log(delname)
    var td = $(deleteButton).parent();
    var tr = $(td).parent();
    jQuery.ajax({
        "url": deleteImgURL,
        "dataType": "jsonp",
        "data": {"name": delname},
        "beforeSend": start_load_pic,
        "error": errorAjax,
        "complete": stop_load_pic,
        "success": function (data) {
            console.log(data);
            if (data.result != 'Deleted') {
                showErrorInfo(data.result);
                return false;
            }
            else {
                showSuccessNotic();
                $(tr).remove();//del line
            }
        }
    });
}
//del contaniner ip range
function DelContainerIprange(deleteButton){
    var delname = deleteButton.getAttribute("Nodename");
    console.log(delname)
    var td = $(deleteButton).parent();
    var tr = $(td).parent();
    jQuery.ajax({
        "url": deleteCTNetRange,
        "dataType": "jsonp",
        "data": {"name": delname},
        "beforeSend": start_load_pic,
        "error": errorAjax,
        "complete": stop_load_pic,
        "success": function (data) {
            console.log(data);
            if (data.result != 'Deleted') {
                showErrorInfo(data.result);
                return false;
            }
            else {
                showSuccessNotic();
                $(tr).remove();//del line
                LoadAvailableContainerIp();
            }
        }
    });
}
//create  Container  ip range
function LoadAvailableContainerIp (){
  getJSON(Container_Ava_Ip).then(function(data){
    //if empty the ip list  its null,then  show the  info is create  network
    if(data.result == 'empty'){
      $('#showAvailableIp').children().empty()
      var showAvailableIp = document.getElementById("showAvailableIp");
      var tr = document.createElement("tr");
      var empty = document.createElement("td");
      empty.style = "position: absolute;vertical-align: middle;padding-right: 0;box-sizing: border-box;padding: 16px 10px 16px 500px;line-height: 24px;color: #999;text-align: center;"
      empty.textContent = "你还没有创建子网,现在就"
      var content = document.createElement("a");
      content.setAttribute("id","CreateNetwork")
      content.textContent = "创建第一个吧";
      empty.append(content)
      tr.append(empty);
      showAvailableIp.append(tr);
      console.log(data);
      $("#CreateNetwork").on('click',function (){
          $('#CreateNetworkShow').show();
      })
    }else{
      $('#showAvailableIp').children().remove()
      $.map(data.result,function (i,n){
        console.log(i)
        data = JSON.parse(i)
        console.log(data)
        var showAvailableIp = document.getElementById('showAvailableIp')
        var tr = document.createElement("tr");
        var name = document.createElement("td");
        name.textContent = data.netname
        tr.appendChild(name)

        var node = document.createElement("td");
        node.textContent =  data.Nodename
        tr.appendChild(node)

        var netrange = document.createElement("td");
        netrange.textContent = data.Netrange
        tr.appendChild(netrange)

        var available = document.createElement("td");
        available.textContent = data.available
        tr.appendChild(available)
        // opeation button
        var opTd = document.createElement("td");
        var deleteButton = document.createElement("button");
        deleteButton.className = "btn btn-xs btn-danger glyphicon glyphicon-trash";
        deleteButton.setAttribute("Nodename", data.Nodename);
        deleteButton.style.marginLeft = "3px";
        deleteButton.onclick = function () {
            DelContainerIprange(this);
        }
        opTd.appendChild(deleteButton);
        tr.appendChild(opTd);
        showAvailableIp.appendChild(tr)
    })
   }
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
    a = guid()
    console.log(a)
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
    $("#docker_pull").on('click',function () {
        load_pulled_images();
    });
    $("#container_ip").on('click',function () {
        LoadAvailableContainerIp();
    });
    //limit input network alias name length  of compute
    $('#subnetName').keyup(function(){
        len = $.trim(this.value).length
        $(this).parent().find("span")[0].textContent =  len + '/' + '60'
    })
    $('.nw-ce-btn').on('click',function(){
        NetName = $('#subnetName')[0].value;
        len = $('#key-number')[0].value;
        if(len != ''){
          $('#instead-key')[0].textContent = $('#key-number')[0].value;
        }
        Netrange = 88 + '.' + 99 + '.' + $('#instead-key')[0].textContent + '.' +  0 + '/'
        Netmask = $('#Net-range').children()[1].value
        nodename = $('.node-select')[0].value
        data = {"netname": NetName,"Nodename": nodename,"Netrange": Netrange + Netmask}
        postJSON(Create_Container_Net,data).then(function (data){
            if(data.status){
              showSuccessNotic();
              $('#CreateNetworkShow').hide();
              LoadAvailableContainerIp();
            }else{
              showErrorInfo(data.result);
            }
        })
        // console.log(Netrange)
        // console.log(node)
        // console.log($('#Net-range').children()[1].value);
    })
    $(document).on('keyup', '.searchValue', function () {
        searchValue(this);
    });
    $('#Search_images').keyup(function () {
            var term = $('#Search_images').val();
            $.post(Docker_search_images, {'term': term}, function (data) {
                if (data.length > 0) {
                    $('.search_result').text('')
                    //control  content size show
                    $('.search_result').css({"height": "300px","overflow-y": "auto"})
                    for (var key in data) {
                        $('.search_result').append(
                                '<div class="col-lg-12 col-md-12"><div class="card" style="background:white; padding:   10px 20px; border-bottom: 1px solid #dadada;"><div class="card-block row"><div class="col-md-12"><h4 class="card-title">' + data[key].name + '</h4></div><div class="col-md-12"><div class="col-lg-8 col-md-8 col-sm-12"><p class="card-text">Description: ' + data[key].description + '</p></div><div class="col-lg-2 col-md-2 col-sm-6"><i class="fa fa-star"></i> ' + data[key].star_count + '</div><div class="col-lg-2 col-md-2 col-sm-6"><button class="btn btn_color pull">Pull</button></div><div class="'+data[key].name+'"></div></div></div></div></div>'
                        );
                    }
                }
                else {
                    $('.search_result').html('<p class="heading text-center">No Images Found :(</p>')
                }
            });

      });
      timer2 = false
      count = 0
      function timer(){
          if(count == 0){
              $('.search_result').text('');
              $('.search_result').css({"display": "none"});
              load_pulled_images();
              // window.location = Docker_pulled_images
          }
          timer2 = setTimeout(timer, 1000)
      }
      $("body").on("click", ".pull", function (e) {
          e.preventDefault();
          count += 1
          console.log(timer2)
          if(!timer2){
              timer()
          }
          $(this).off('click')
          imageName = $($(this).closest('.card-block').children()[0]).text()
          $(this).text('Pulling..');
          this1 = $(this)
          // $.post(Docker_pull_images, {imageName: imageName},
          uuid_token = guid()
          $.post( Docker_pull_images  + uuid_token + '/', {imageName: imageName},
              function (data, status, xhr) {
                   console.log(data);
                  if (status == 'success') {
                      if (data['status'] == 'ok') {
                          this1.text('Pulled')
                          count -= 1
                      }
                  }
              });
     });
     function S4() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
     };
     //create the uuid
     function guid() {
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
     };
})
