/**
 * Created by wupeijin on 17/4/6.
 */
$(function() {
  LoadContainerService()
  setTimeout('createNode()', 100);
  $("#Refreash").on('click', function() {
    window.location.reload()
  })
  //close the Service detail info
  $('#closeCheckInfo').click(function (){
    $('#showServerCheckInfo').hide();
  })
  // save Container depends Node
  $("#SaveCTNNode").on('click', function() {
    NodeName = $(".NodeName").children()[0].value
    NodeIp = $(".Nodeaddress").children()[0].value
    $(".NodeId").children()[0].value = GenNonDuplicateID()
    NodeId = $(".NodeId").children()[0].value
    data = {
      "NodeName": NodeName,
      "NodeIp": NodeIp,
      "NodeId": NodeId
    }
    console.log(data)
    createNode(JSON.stringify(data));
    // data = { "NodeId" : data},
    postJSON(ContainerNode, data)
    clearNodeContent();
    console.log(NodeName);
    console.log(NodeIp);
    console.log(NodeId);
  })
  //add the Nodename list  into  ServiceNode  option
  $('#Service').on('click', function() {
    // 防止重复加载
    $('#DependsNode').children().remove()
    $('#image').children().remove()
    images = window.pulled_images
    // console.log(images)
    nodelist = window.ContainerNodeList
    // console.log(nodelist)
    for (x = 0; x < nodelist.length; x++) {
      var data = JSON.parse(nodelist[x])
      // console.log(nodelist[x])
      $("#DependsNode").append("<option value=' " + data.NodeName + " '>" + data.NodeName + "</option>")
    }
    for (z = 0; z < images.length; z++) {
      var image = JSON.parse(images[z])
      $('#image').append("<option value=' " + image.fromImage + ":" + image.tag + " '>" + image.fromImage + ":" + image.tag + "</option>")
    }
  })
  //  commit  Container  configuration
  $('#SaveCTNService').on('click', function() {
    dependsnode = $('#DependsNode')[0].value
    servicename = $('#ServiceName')[0].value
    serviceAddress = $('#ServiceAddress')[0].value
    image = $('#image')[0].value
    memory = $('#MemLimit')[0].value
    cpu = $('#CpuLimit')[0].value
    datainfo = {
      "dependsnode": dependsnode,
      "servicename": servicename,
      "serviceAddress": serviceAddress,
      "image": image,
      "memory": memory,
      "cpu": cpu
    }
    Create_CTN_Service = Rmspace(Create_CTN_Service + image + '/')
    // console.log(Create_CTN_Service)
    postJSON(Create_CTN_Service, datainfo).then(function(data) {
      // console.log(data)
      content = JSON.parse(data)
      console.log(content)
      if (content.status) {
        //{"result": '['{"created": "2017-08-16 11:08:32", "image": " ubuntu-upstart:latest ", "container_id": "049c7cb459ab", "servicename": "abc", "serviceAddress": "88.99.1.2", "memory": "500", "password": "@#L<9UEEIBGWIC.", "cpu": "1", "dependsnode": " default ", "user": "j"}']',"status": True}
        //map  must  be  recived  a list to ioop
        $('#ContainerService').hide()
        $.map(content, function(i, n) {
          for (x = 0; x < i.length; x++) {
            ServiceInfo = JSON.parse(i[x])
            console.log(ServiceInfo)
            var showContainerService = document.getElementById('showContainerService')
            var tr = document.createElement("tr");
            var container_id = document.createElement("td");
            container_id.textContent = ServiceInfo.container_id
            tr.appendChild(container_id)

            var servicename = document.createElement("td");
            servicename.textContent = ServiceInfo.servicename
            tr.appendChild(servicename)

            var node = document.createElement("td");
            node.textContent = ServiceInfo.dependsnode
            tr.appendChild(node)

            var user = document.createElement("td");
            user.textContent = ServiceInfo.user
            tr.appendChild(user)

            var serviceaddress = document.createElement("td");
            serviceaddress.textContent = ServiceInfo.serviceAddress
            tr.appendChild(serviceaddress)

            var image = document.createElement("td");
            image.textContent = ServiceInfo.image
            tr.appendChild(image)

            var memory = document.createElement("td");
            memory.textContent = ServiceInfo.memory + 'M'
            tr.appendChild(memory)

            var cpu = document.createElement("td");
            cpu.textContent = ServiceInfo.cpu
            tr.appendChild(cpu)

            var created = document.createElement("td");
            created.textContent = ServiceInfo.created
            tr.appendChild(created)


            //get the  container status  TODO: setTimeout  request the container status
            var status = document.createElement("td");
            status.setAttribute("id", ServiceInfo.container_id)
            status.className = "status"
            status.style.cursor = "pointer";
            var span = document.createElement("span")
            tr.appendChild(status)

            //opeation  button
            var opeation = document.createElement("td");
            var restart = document.createElement("button");
            restart.className = "btn btn-xs btn-default glyphicon glyphicon-refresh";
            restart.setAttribute("container_id", ServiceInfo.container_id);
            restart.onclick = function() {
              //Container_restart(this)
              Container_restart (this.getAttribute("container_id"))
            }
            opeation.appendChild(restart);

            var stop = document.createElement("button");
            stop.style.marginLeft = "3px";
            stop.className = "btn btn-xs btn-default glyphicon glyphicon-stop";
            stop.setAttribute("container_id", ServiceInfo.container_id);
            stop.onclick = function() {
              if(this.className == "btn btn-xs btn-default glyphicon glyphicon-stop"){
                Container_stop(this.getAttribute("container_id"))
              }else{
                Container_start(this.getAttribute("container_id"))
              }
            }
            opeation.appendChild(stop);

            var backup = document.createElement("button");
            backup.style.marginLeft = "3px";
            backup.className = "btn btn-xs btn-default glyphicon glyphicon-hdd";
            backup.setAttribute("container_id", ServiceInfo.container_id);
            backup.onclick = function() {
              //Container_backup(this)
                Container_backup(this.getAttribute("container_id"));
            }
            opeation.appendChild(backup);

            var del = document.createElement("button");
            del.style.marginLeft = "3px";
            del.className = "btn btn-xs btn-default glyphicon glyphicon-trash";
            del.setAttribute("container_id", ServiceInfo.container_id);
            del.onclick = function() {
              //Container_del(this)
              Container_remove(this.getAttribute("container_id"))
            }
            opeation.appendChild(del);
            tr.appendChild(opeation);
            showContainerService.appendChild(tr)
            checkcontainer(ServiceInfo.serviceAddress, ServiceInfo.container_id)
            $(document).on('keyup', '.Search_container', function () {
                searchValue(this);
            });
          }
          //ioop all container  then show success
          showSuccessNotic()
        })
      }
    })

    console.log(servicename, serviceAddress, image, memory, cpu)
  })

})
function GenNonDuplicateID() {
  return Math.random().toString(36).substr(3)
}

function clearNodeContent() {
  $(".NodeName").children()[0].value = ''
  $(".Nodeaddress").children()[0].value = ''
}
//createNode add  Node of li
function createNode(data) {
  // console.log(typeof(data))
  if (typeof(data) == "string") {
    data = JSON.parse(data)
    // data = JSON.parse(data[x])
    html = "<li ><a href=\"#ios\" data-toggle=\"tab\" title=\"" + data.NodeIp + "\" >" + data.NodeName + "</a>" +
      "<div style id=\"del_node\" class=\"del_node\" title=\"删除空间\" ></div></li>"
    $("#myTab").append(html)
  } else if (typeof(data) == "object" || "undefined") {
    // console.log(data);
    nodelist = window.ContainerNodeList
    //循环的时候重新赋值data  导致只循环一次
    for (x = 0; x < nodelist.length; x++) {
      data = JSON.parse(nodelist[x])
      // console.log(data.NodeName)
      //except  'default' node name
      if (data.NodeName == 'default') {
        continue
      } else {
        html = "<li ><a href=\"#ios\" data-toggle=\"tab\" title=\"" + data.NodeIp + "\" >" + data.NodeName + "</a>" +
          "<div style id=\"del_node\" class=\"del_node\" title=\"删除空间\" ></div></li>"
        $("#myTab").append(html)
      }
    }
  }
  NodeClick();
  DelNode();
}

function NodeClick() {
  $('#myTab').find('li').on('click', function(e) {
    CatchNode = $(this).children()[0].title
    console.log(CatchNode);
  })
}

function DelNode() {
  $('#myTab').find('div').on('click', function(e) {
    //got the prev  array
    DelNode = $(this).prev()[0].textContent
    console.log(DelNode)
    li = $(this).prev()
    // console.log(DelNode)
    $('#DelBxCheck').show();
    $('.close').css({
      "width": "20px",
      "height": "20px",
      "background-color": "green",
      "border-radius": "10px",
      "border": "1px solid #DBE6EF",
      "display": "inline-block",
      "position": "relative",
      "bottom": "1px",
      "right": "1px"
    })
    // console.log($('.DelBxCheck_main').find('p'))
    //transfer  node content in  this
    $('.DelBxCheck_main').find('p')[0].innerHTML = DelNode
    //  data = $(this).prev()[0]
    //事件触发不能传值，多个事件嵌套内的值 可以直接使用
    $("#CkDelNode").on('click', function() {
      //remove this li
      li.parent().remove()
      postJSON(ContainerDelNode, DelNode)

    })
  })
}


//  load Container  service
function LoadContainerService(){
    getJSON(Container_Service).then(function(data){
      // console.log(data)
      content = JSON.parse(data)
      console.log(content)
      if (content.status) {
        //{"result": '['{"created": "2017-08-16 11:08:32", "image": " ubuntu-upstart:latest ", "container_id": "049c7cb459ab", "servicename": "abc", "serviceAddress": "88.99.1.2", "memory": "500", "password": "@#L<9UEEIBGWIC.", "cpu": "1", "dependsnode": " default ", "user": "j"}']',"status": True}
        //map  must  be  recived  a list to ioop
        $('#ContainerService').hide()
        $.map(content, function(i, n) {
          for (x = 0; x < i.length; x++) {
            ServiceInfo = JSON.parse(i[x])
            // console.log(ServiceInfo)
            var showContainerService = document.getElementById('showContainerService')
            var tr = document.createElement("tr");
            var container_id = document.createElement("td");
            container_id.textContent = ServiceInfo.container_id
            tr.appendChild(container_id)

            var servicename = document.createElement("td");
            servicename.textContent = ServiceInfo.servicename
            tr.appendChild(servicename)

            var node = document.createElement("td");
            node.textContent = ServiceInfo.dependsnode
            tr.appendChild(node)

            var user = document.createElement("td");
            user.textContent = ServiceInfo.user
            tr.appendChild(user)

            var serviceaddress = document.createElement("td");
            serviceaddress.textContent = ServiceInfo.serviceAddress
            tr.appendChild(serviceaddress)

            var image = document.createElement("td");
            image.textContent = ServiceInfo.image
            tr.appendChild(image)

            var memory = document.createElement("td");
            memory.textContent = ServiceInfo.memory + 'M'
            tr.appendChild(memory)

            var cpu = document.createElement("td");
            cpu.textContent = ServiceInfo.cpu
            tr.appendChild(cpu)

            var created = document.createElement("td");
            created.textContent = ServiceInfo.created
            tr.appendChild(created)


            //get the  container status  TODO: setTimeout  request the container status
            var status = document.createElement("td");
            status.setAttribute("id", ServiceInfo.container_id)
            status.className = "status"
            status.style.cursor = "pointer";
            var span = document.createElement("span")
            tr.appendChild(status)

            //opeation  button
            var opeation = document.createElement("td");
            var restart = document.createElement("button");
            restart.className = "btn btn-xs btn-default glyphicon glyphicon-refresh";
            restart.setAttribute("container_id", ServiceInfo.container_id);
            restart.onclick = function() {
              //Container_restart(this)
              Container_restart (this.getAttribute("container_id"))
            }
            opeation.appendChild(restart);

            var stop = document.createElement("button");
            stop.style.marginLeft = "3px";
            stop.className = "btn btn-xs btn-default glyphicon glyphicon-stop";
            stop.setAttribute("container_id", ServiceInfo.container_id);
            stop.onclick = function() {
              if(this.className == "btn btn-xs btn-default glyphicon glyphicon-stop"){
                Container_stop(this.getAttribute("container_id"))
              }else{
                Container_start(this.getAttribute("container_id"))
              }
            }
            opeation.appendChild(stop);

            var backup = document.createElement("button");
            backup.style.marginLeft = "3px";
            backup.className = "btn btn-xs btn-default glyphicon glyphicon-hdd";
            backup.setAttribute("container_id", ServiceInfo.container_id);
            backup.onclick = function() {
              //Container_backup(this)
              Container_backup(this.getAttribute("container_id"));
            }
            opeation.appendChild(backup);

            var del = document.createElement("button");
            del.style.marginLeft = "3px";
            del.className = "btn btn-xs btn-default glyphicon glyphicon-trash";
            del.setAttribute("container_id", ServiceInfo.container_id);
            del.onclick = function() {
              Container_remove(this.getAttribute("container_id"))
            }
            opeation.appendChild(del);
            tr.appendChild(opeation);
            showContainerService.appendChild(tr)
            checkcontainer(ServiceInfo.serviceAddress, ServiceInfo.container_id)
            $(document).on('keyup', '.Search_container', function () {
                searchValue(this);
            });
          }
          //ioop all container  then show success
          showSuccessNotic()
        })
      }
    })
}
//search the Container
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

// Container stop , just post the  container_id  value ,not  key
function Container_stop (container_id){
   $('.loader').show()
  postJSON(ContainerSPURL, container_id).then(function(data){
    content = JSON.parse(data)
    console.log(content)
   $('.loader').hide()
    if(content.status){
      showSuccessNotic();
      $("#"+container_id).nextAll().children()[1].className="btn btn-xs btn-default glyphicon glyphicon-play"
    }else{
        showErrorInfo(content.result)
    }
    console.log(content)
  })
}
// Container  start
function  Container_start (container_id){
  $('.loader').show()
 postJSON(ContainerSTURL, container_id).then(function(data){
   content = JSON.parse(data)
   console.log(content)
  $('.loader').hide()
   if(content.status){
     showSuccessNotic();
     $("#"+container_id).nextAll().children()[1].className="btn btn-xs btn-default glyphicon glyphicon-stop"
   }else{
       showErrorInfo(content.result)
   }
   console.log(content)
 })
}
// Container restart
function Container_restart (container_id){
  $('.loader').show()
 postJSON(ContainerRSURL, container_id).then(function(data){
   content = JSON.parse(data)
   console.log(content)
  $('.loader').hide()
   if(content.status){
     showSuccessNotic();
   }else{
       showErrorInfo(content.result)
   }
 })
}
// Container remove
function Container_remove (container_id){
  $('.loader').show()
 postJSON(ContainerRMURL, container_id).then(function(data){
   content = JSON.parse(data)
   console.log(content)
  $('.loader').hide()
   if(content.status){
     $("#"+container_id).parent().remove();
     showSuccessNotic();
   }else{
       showErrorInfo(content.result)
   }
 })
}
//Backup Container
function  Container_backup(container_id){
  console.log(container_id)
    $('#showBackupFrom').show()
    $('#SubmitBackupName').click(function(){
      console.log('aaaa')
      backupname = $('#backupname')[0].value
      var data = {"backupname": backupname, "container_id": container_id}
      $('#showBackupFrom').hide()
      $('.loader').show()
      postJSON(ContainerBKURL, data).then(function(data){
        content = JSON.parse(data)
        console.log(content)
       $('.loader').hide()
        if(content.status){
          showSuccessNotic();
        }else{
            showErrorInfo(content.result)
        }
      })
    })
}
