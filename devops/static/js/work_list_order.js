$(function () {
    create_order_list();
    hook_list();
    // test();
    setTimeout("push_hook_server_chooice()",200);
    $('#hook-save').click(function(){
        script = $('#hook_script')[0].value
        repo = $('#Git_repo')[0].value
        branch = $('#Branch')[0].value
        server = Rmspace($("#hook_server option:selected").val())
        hook_opt = document.getElementById('hook-save')
        opt = hook_opt.getAttribute('opt')
        if(opt=="update"){
          hook_index = hook_opt.getAttribute('hook_index')
          data = {"shell": script, "repo": repo,"branch": branch,"server": server ,"status":0,"opt":opt,"hook_index": hook_index}
        }else{
          data = {"shell": script, "repo": repo,"branch": branch,"server": server ,"status":0,"opt":opt}
        }
        postJSON(save_hook_info, data).then(function(){
            showSuccessNotic();
            init();
            hook_list();
        })
    })
    $('#hook_history_back').click(function(){
      $('#hook_history').hide()
    })
    $('#hook-edit-close').click(function(){
      $('#add_hook').hide()
    })
    // $('td span').live('mouseenter',function(e){
    //     e.target.className = '';
    //     e.target.textContent = '';
    //     var I = document.createElement("i")
    //     I.className = "fa-refresh   fa fa-lg  fa-li";
    //     I.style.position="static";
    //     e.target.appendChild(I)
    //   }).live('mouseleave',function(e){
    //     e.target.className = 'label label-success';
    //     e.target.textContent = '已处理';
    //   });
})

function create_order_list(){
  getJSON(work_order_listURL).then(function(data){
    console.log(JSON.parse(data))
    data = JSON.parse(data)
    $('#show_work_order_tbody').children().remove();
    if(data.data.totals == 0){
      console.log('no data')
    }
    for(let i in data.data){
      // console.log(i)
      data[i] = JSON.parse(data.data[i]);
      // console.log(data[i])
      var showorder_list_Tbody = document.getElementById("show_work_order_tbody");
      var tr = document.createElement("tr")
      var Title = document.createElement("td");
      Title.textContent = data[i]["title"];
      tr.appendChild(Title)

      var time = document.createElement("td");
      time.textContent = data[i]["time"]
      tr.appendChild(time)

      var status = document.createElement("td");
      var span=document.createElement("span");
      if(data[i]['status'] == "未确认"){
            span.className="label label-danger";
            span.textContent="未处理"
      }else{
            span.className="label label-success";
            span.textContent="已处理"
      }
      status.appendChild(span)
      tr.appendChild(status)

      var opTd = document.createElement("td");
      var deleteButton = document.createElement("button");
      deleteButton.className = "btn btn-xs btn-danger glyphicon glyphicon-trash";
      deleteButton.setAttribute("time", data[i]["time"]);
      deleteButton.style.marginLeft = "3px";
      deleteButton.onclick = function () {
          delete_work_order(this);
      }
      opTd.appendChild(deleteButton);

      var startButton = document.createElement("button");
      startButton.className = "btn btn-xs btn-success glyphicon glyphicon-play-circle";
      startButton.setAttribute("title", data[i]["title"]);
      startButton.setAttribute("time", data[i]["time"]);
      startButton.style.marginLeft = "3px";
      startButton.onclick = function () {
        $('#add_hook').slideDown('slow')
      }
      opTd.appendChild(startButton);

      var ConfirmButton = document.createElement("button");
      ConfirmButton.className = "btn btn-xs btn-warning glyphicon glyphicon-ok";
      ConfirmButton.setAttribute("title", data[i]["title"]);
      ConfirmButton.setAttribute("time", data[i]["time"]);
      ConfirmButton.style.marginLeft = "3px";
      ConfirmButton.onclick = function () {
          publish_finish(event)
      }
      opTd.appendChild(ConfirmButton);
      tr.appendChild(opTd);
      showorder_list_Tbody.appendChild(tr)
    }
 })
}

// update time line  and change work_order  status
function publish_finish(e){
  worder_content = e.target.parentNode.parentNode.children[0].textContent
  line = document.getElementsByClassName('min-line')
  circle = document.getElementsByClassName('min-circle')
  for(x=0;x<line.length;x++){
      line[x].className = 'min-line line_active'
  }
  for(i=0;i<circle.length;i++){
      circle[i].className = "min-circle round_active"
  }

  e.target.parentNode.previousSibling.children[0].textContent = "已处理"
  e.target.parentNode.previousSibling.children[0].className = "label label-success"
  time = e.target.getAttribute('time')
  postJSON(update_work_order_status_url,{"time":time}).then(function(data){
    if(data.status == 'success'){
       showSuccessNotic()
       postJSON(work_order_finish_notify,{"title":worder_content,"status": '已发布完成'})
    }else{
       showErrorInfo('更新出现异常')
       postJSON(work_order_finish_notify,{"title":worder_content,"status": '发布出现异常,紧急联系值班人员!'})
    }
  })
}


// limit user  to opeation
function  delete_work_order(e){
  var admin = Rmtab($("#user_id")[0].textContent)
  if(admin == window.admin){
    thistime = e.getAttribute("time")
    $.ajax({
        type: "POST",
        url: del_work_order,
        data: thistime,
        error: errorAjax,
        beforeSend: start_load_pic,
        complete: stop_load_pic,
        success: function (response, status) {
            if (!status == 200) {
                return false;
            }
            else {
                showSuccessNotic();
                $('#show_work_order_tbody').children().remove();
                create_order_list();
            }
        }
    })
  }else if(admin  in window.today_work_ops ){
    $.ajax({
        type: "POST",
        url: del_work_order,
        data: thistime,
        error: errorAjax,
        beforeSend: start_load_pic,
        complete: stop_load_pic,
        success: function (response, status) {
            if (!status == 200) {
                return false;
            }
            else {
                showSuccessNotic();
                $('#show_work_order_tbody').children().remove();
                create_order_list();
            }
        }
    })
  }else{
    showErrorInfo("只有当天值班人员才能操作!")
  }
}

function  push_hook_server_chooice(){
  for(let i in window.allServersList){
    server = window.allServersList[i]
    // no have space
    $('#hook_server').append("<option value='"+ server.ip+"'>" + server.ip + "</option>")
  }
}

function hook_list(){
  $('#hook_list_tbody').children().remove();
    getJSON(get_hook_info).then(function(data){
      // console.log(data)
      // data = JSON.parse(data)
      for(let i in data){
        //  console.log(JSON.parse(data[i]))
         content  = JSON.parse(data[i])
        //  content = JSON.parse(content)
        //  console.log(content)
         var hook_list_tbody = document.getElementById('hook_list_tbody')
         var tr = document.createElement("tr")
         var repo = document.createElement("td");
         var a = document.createElement("a");
         a.setAttribute("redirect", content['id'])
         a.setAttribute("onclick",'hook_log(event)')
         a.textContent = content['repo'] + '@' + content['branch']
         repo.appendChild(a)
         tr.appendChild(repo)

         var shell = document.createElement("td");
         var pre = document.createElement("pre");
         pre.setAttribute('class','shell_content')
         pre.textContent = content['shell']
         shell.appendChild(pre)
         tr.appendChild(shell)

         var server = document.createElement("td");
         server.textContent = content['server']
         tr.appendChild(server)

         var hook_time = document.createElement("td");
         // convert time
         last_hook = strtimetounix(content['lastUpdate'])
         last_hook = timetounicode(last_hook)
         hook_time.textContent =  last_hook
         tr.appendChild(hook_time)

         var status = document.createElement("td");
         var span=document.createElement("span");
         span.setAttribute("id",content['key'])
         Status =  hook_status(content['status'])
         console.log(Status)
         span.className="label";
         span.style.background = Status.color;
         span.textContent= Status.text;
         span.onmouseenter=function(e){
          //  e.stopPropagation()
          //   $('span').live('mouseenter',function(e){
          //     e.target.className = '';
          //     e.target.textContent = '';
          //     var I = document.createElement("i")
          //     I.className = "fa-refresh   fa fa-lg  fa-li";
          //     I.style.position="static";
          //     e.target.appendChild(I);
          //     }).live('mouseleave',function(e){
          //       e.target.className = 'label label-success';
          //       e.target.textContent = '已处理';
          //     });
          }
         status.appendChild(span)
         tr.appendChild(status)

         var opTd = document.createElement("td");
         var deleteButton = document.createElement("button");
         deleteButton.className = "btn btn-xs btn-danger glyphicon glyphicon-trash";
         deleteButton.setAttribute("repo", content["repo"]);
         deleteButton.setAttribute("server", content["server"]);
         deleteButton.setAttribute("branch", content["branch"]);
         deleteButton.setAttribute("key", content["key"]);
         deleteButton.style.marginLeft = "3px";
         deleteButton.onclick = function () {
             del_hook_list(this);
         }
         opTd.appendChild(deleteButton);

         var EditButton = document.createElement("button");
         EditButton.className = "btn btn-xs btn-success glyphicon glyphicon-edit";
         EditButton.setAttribute("repo", content["repo"]);
         EditButton.setAttribute("server", content["server"]);
         EditButton.setAttribute("branch", content["branch"]);
         EditButton.setAttribute("shell", content["shell"]);
         EditButton.setAttribute("key", content["key"]);
         EditButton.setAttribute("hook_index", content['id'])
         EditButton.style.marginLeft = "3px";
         EditButton.onclick = function () {
            edit_hook_info(this);
         }
         opTd.appendChild(EditButton)

         var CopyButton = document.createElement("div");
         var span=document.createElement("span");
         CopyButton.className = "btn-xs btn-default glyphicon glyphicon-copyright-mark";
         span.className = "copy_tips"
         span.textContent = window.location.href +'_webhook_callback' + '/' + content['key']
         CopyButton.appendChild(span)
         opTd.appendChild(CopyButton)
         tr.appendChild(opTd)
         hook_list_tbody.appendChild(tr)
      }
    })
    setInterval("Socket()",20000);
}

function del_hook_list(e){
  repo = e.getAttribute("repo")
  branch = e.getAttribute("branch")
  server = e.getAttribute("server")
  key = e.getAttribute("key")
  data = {"repo": repo, "branch":branch,"server":server,"key":key}
  postJSON(del_hook_info,data).then(function(data){
    if(data.status == 'sccuess'){
       showSuccessNotic();
       hook_list()
    }else{
      showErrorInfo("删除失败")
    }
  })
}

function  edit_hook_info(e){
  // console.log(e)
  $('#Git_repo')[0].value = e.getAttribute("repo")
  $('#Branch')[0].value = e.getAttribute("branch")
  $('#hook_script')[0].value = e.getAttribute("shell")
  $('#hook_server').val(e.getAttribute("server"))
  hook_save = document.getElementById('hook-save')
  hook_save.setAttribute('opt','update')
  hook_save.setAttribute('hook_index', e.getAttribute('hook_index'))
}
function copy(e){
  // a = e.getAttribute('data-clipboard-text');
  // window.clipboardData.setData("Text",a);
  console.log(e)
}

function init(){
  $('#Git_repo')[0].value = ''
  $('#Branch')[0].value = ''
  $('#hook_script')[0].value = ''
}

// update status  real-time of websocket
function Socket(){
  // if(window.s){
  //   window.s.close()
  // }
  var socket = new WebSocket("ws://" + hook_socket_host +"/webhook_callback/1755bc91fc44d03f0f4440530ddc8c01")
  socket.onopen = function(){
    console.log('open');
    socket.send('heihei')
  };
  socket.onmessage = function(e){
    if(e.data != '1'){
      status = JSON.parse(e.data)['status']
      key = JSON.parse(e.data)['key']
      if(status=4){
        document.getElementById(''+JSON.parse(e.data)['key']+'').style.background='green'
        document.getElementById(''+JSON.parse(e.data)['key']+'').textContent='成功'
        var last_hook = strtimetounix(JSON.parse(e.data)['time'])
        var last_hook = timetounicode(last_hook)
        // document  style is js , jq is $('#id')
        $(''+'#'+JSON.parse(e.data)['key']+'').parents().prevAll()[0].textContent = last_hook
      }
    }else{
      console.log('no update work')
    }
  };
  // socket.onerror = function(){
  //   console.log("websocket.error")
  // }
}
//
function hook_log(e){
  var num = parseInt(e.target.getAttribute('redirect'))
  // $('#hook_history').show()
  postJSON(hook_history_url,num).then(function(data){
        //  console.log(data)
         for (x = 0; x < data.length; x++) {
           content = data[x]
          //  console.log(content)
           var hook_history_tbody = document.getElementById('hook_history_tbody')
           var tr = document.createElement("tr")
           var hisotry_id = document.createElement("td")
           hisotry_id.textContent = content.id
           tr.appendChild(hisotry_id)

           var pushuser = document.createElement("td")
           pushuser.textContent = content.push_user
           tr.appendChild(pushuser)

           var log = document.createElement("td")
           var log_format = document.createElement("pre")
           var newBox = document.createElement("div");
           var btn = document.createElement("a");
           log_format.setAttribute('class','shell_content')
           log_format.setAttribute('id','shell_log')
           log_format.style.height = '100px';
           log_format.style.width = '400px';
           log_format.textContent = content.shell_log
           log.appendChild(log_format)
           tr.appendChild(log)

           var time = document.createElement("td")
           time_convert = strtimetounix(content.update_time)
           last_hook = timetounicode(time_convert)
           time.textContent =  last_hook
           tr.appendChild(time)

           var status = document.createElement("td");
           var span=document.createElement("span");
           Status =  hook_status(content.status)
           span.className="label";
           span.style.background = Status.color;
           span.textContent= Status.text;
           status.appendChild(span)
           tr.appendChild(status)

           hook_history_tbody.appendChild(tr)
        //  show()
         }
  })
  $('#hook_history').show()
}
//  内容太长，折叠
function show()
{
  var box = document.getElementsByTagName("pre");
  for(var i = 0, l = box.length; i < l; i++){
    var text = box[i].textContent;
    console.log(text)
    var newBox = document.createElement("div");
    var btn = document.createElement("a");
    newBox.textContent = text.substring(0,50);
    btn.textContent = text.length > 50 ? "...显示全部" : "";
    btn.href = "#";
    btn.onclick = function(){
      if(btn.textContent == "...显示全部")
      {
        btn.textContent = "收起";
        newBox.textContent = text;
      }
      else
      {
        btn.textContent = "...显示全部";
        newBox.textContent = text.substring(0,50);
      }
    }
    box[i].textContent = "";
    box[i].appendChild(newBox);
    box[i].appendChild(btn);
  }
}
