$(function(){
  get_work_plan_list();
  $('#plan-save').click(function(){
      ops = $('#plan-ops')[0].value
      time = $('#plan-time')[0].value
      data = {"title": ops, "start": time}
      console.log(data)
      postJSON(work_plan_listURL,data).then(function(data){
          if(data.status == "success"){
              showSuccessNotic()
              $('#plan-ops')[0].value = '';
              get_work_plan_list()
          }else{
             showErrorInfo("提交排班计划失败,请尝试几次，如不行，请人肉排班!")
          }
      })
  })
})

function  get_work_plan_list(){
  $('#show_work_plan_detail').children().remove()
   getJSON(get_work_plan_listURL).then(function(data){
      planlist = JSON.parse(data)
      for(let i in planlist){
        plan = JSON.parse(planlist[i]);
        var show_work_plan_detail = document.getElementById("show_work_plan_detail");
        var tr = document.createElement("tr")
        var Title = document.createElement("td");
        Title.textContent = plan["title"];
        tr.appendChild(Title)

        var time = document.createElement("td");
        time.textContent = plan["start"];
        tr.appendChild(time)

        var opTd = document.createElement("td");
        var deleteButton = document.createElement("button");
        deleteButton.className = "btn btn-xs btn-danger glyphicon glyphicon-trash";
        deleteButton.setAttribute("ops", plan["title"]);
        deleteButton.style.marginLeft = "3px";
        deleteButton.onclick = function () {
            delete_work_ops(this);
        }
        opTd.appendChild(deleteButton);
        tr.appendChild(opTd)

        show_work_plan_detail.appendChild(tr)
      }
   })
}

function  delete_work_ops(e){
  var admin = Rmtab($("#user_id")[0].textContent)
  var token = get_global_csrf_token()
  if(admin == window.admin){
    ops = e.getAttribute("ops")
    $.ajax({
        type: "POST",
        url: del_work_plan_ops,
        headers: {'X-CSRFToken': token },
        data: ops,
        error: errorAjax,
        beforeSend: start_load_pic,
        complete: stop_load_pic,
        success: function (response, status) {
            if (!status == 200) {
                return false;
            }
            else {
                showSuccessNotic();
                $('#show_work_plan_detail').children().remove();
                get_work_plan_list();
            }
        }
    })
  }else{
    showErrorInfo("只有Jimmy 才能操作!")
  }
}
