/**
 * Created by wupeijin on 17/4/6.
 */
$(function(){
    // LoadNodeList();
    // NodeClick();
    // DelNode();
    // console.log(window.ContainerNodeList)
    setTimeout('createNode()',100);
    $("#refreash").on('click',function(){
        // document.getElementById('container').contentWindow.location.reload();
        // var table = document.getElementById("container").contentWindow.document.getElementsByTagName('tbody')[0]
        // console.log(table)
        // setTimeout(test, 500)
        // let url = DockerIMG
        // new Promise(function (resolve,reject){
        //     let XHR = new XMLHttpRequest();
        //     XHR.open('GET',url,true);
        //     XHR.send();
        //     XHR.onreadystatechange = function (){
        //       if (XHR.readyState == 4){
        //         if (XHR.status == 200) {
        //             try {
        //               var res = JSON.parse(XHR.responseText);
        //               resolve(res);
        //             } catch (e){
        //               reject(e);
        //             }
        //         } else {
        //           reject(new Error(XHR.statusText));
        //         }
        //       }
        //     }
        // })

    })
    // $("#SaveCTNNode").on('click',function(){
    //     NodeName = $(".NodeName").children()[0].value
    //     NodeIp = $(".Nodeaddress").children()[0].value
    //     $(".NodeId").children()[0].value  = GenNonDuplicateID()
    //     NodeId = $(".NodeId").children()[0].value
    //     data = {"NodeName": NodeName, "NodeIp": NodeIp, "NodeId": NodeId}
    //     console.log(data)
    //     createNode(JSON.stringify(data));
    //     // data = { "NodeId" : data},
    //     postJSON(ContainerNode, data)
    //     clearNodeContent();
    //     console.log(NodeName);
    //     console.log(NodeIp);
    //     console.log(NodeId);
    // })
    // Node click get the value
    // function NodeClick(){
    //   $('#myTab').find('li').on('click',function(e){
    //        CatchNode = $(this).children()[0].title
    //        console.log(CatchNode);
    //   })
    // }
    // function DelNode (){
    //    $('#myTab').find('div').on('click',function(e){
    //        //got the prev  array
    //            DelNode = $(this).prev()[0].textContent
    //            console.log(DelNode)
    //            li = $(this).prev()
    //            console.log(li)
    //            // console.log(DelNode)
    //            $('#DelBxCheck').show();
    //            $('.close').css({"width": "20px","height": "20px","background-color": "green","border-radius": "10px",
    //            "border": "1px solid #DBE6EF","display": "inline-block","position": "relative","bottom": "1px",
    //            "right": "1px"  })
    //            // console.log($('.DelBxCheck_main').find('p'))
    //            //transfer  node content in  this
    //            $('.DelBxCheck_main').find('p')[0].innerHTML = DelNode
    //           //  data = $(this).prev()[0]
    //           //事件触发不能传值，多个事件嵌套内的值 可以直接使用
    //            $("#CkDelNode").on('click',function(){
    //               //remove this li
    //                li.parent().remove()
    //                postJSON(ContainerDelNode,DelNode)
    //
    //            })
    //     })
    // }
    //random Nodeid
    // function GenNonDuplicateID(){
    //     return Math.random().toString(36).substr(3)
    // }
    //
    // function clearNodeContent(){
    //   $(".NodeName").children()[0].value = ''
    //   $(".Nodeaddress").children()[0].value = ''
    // }

})
  $("#SaveCTNNode").on('click',function(){
      NodeName = $(".NodeName").children()[0].value
      NodeIp = $(".Nodeaddress").children()[0].value
      $(".NodeId").children()[0].value  = GenNonDuplicateID()
      NodeId = $(".NodeId").children()[0].value
      data = {"NodeName": NodeName, "NodeIp": NodeIp, "NodeId": NodeId}
      console.log(data)
      createNode(JSON.stringify(data));
      // data = { "NodeId" : data},
      postJSON(ContainerNode, data)
      clearNodeContent();
      console.log(NodeName);
      console.log(NodeIp);
      console.log(NodeId);
    })
    function GenNonDuplicateID(){
        return Math.random().toString(36).substr(3)
    }

    function clearNodeContent(){
      $(".NodeName").children()[0].value = ''
      $(".Nodeaddress").children()[0].value = ''
    }
    //createNode add  Node of li
    function createNode (data){
        console.log(typeof(data))
        if(typeof(data) ==  "string"){
                data = JSON.parse(data)
            // for(x=0;x<data.length;x++){
                // data = JSON.parse(data[x])
                html = "<li ><a href=\"#ios\" data-toggle=\"tab\" title=\"" + data.NodeIp + "\" >" + data.NodeName + "</a>"
                +  "<div style id=\"del_node\" class=\"del_node\" title=\"删除空间\" ></div></li>"
                $("#myTab").append(html)
            // }
        }else if(typeof(data) == "object" || "undefined"){
            nodelist = window.ContainerNodeList
            //循环的时候重新赋值data  导致只循环一次
            for(x=0;x<nodelist.length;x++){
                data = JSON.parse(nodelist[x])
                html = "<li ><a href=\"#ios\" data-toggle=\"tab\" title=\"" + data.NodeIp + "\" >" + data.NodeName + "</a>"
                +  "<div style id=\"del_node\" class=\"del_node\" title=\"删除空间\" ></div></li>"
                $("#myTab").append(html)
            }
        }
        NodeClick();
        DelNode();
    }
    function NodeClick(){
      $('#myTab').find('li').on('click',function(e){
           CatchNode = $(this).children()[0].title
           console.log(CatchNode);
      })
    }
    function DelNode (){
       $('#myTab').find('div').on('click',function(e){
           //got the prev  array
               DelNode = $(this).prev()[0].textContent
               console.log(DelNode)
               li = $(this).prev()
               console.log(li)
               // console.log(DelNode)
               $('#DelBxCheck').show();
               $('.close').css({"width": "20px","height": "20px","background-color": "green","border-radius": "10px",
               "border": "1px solid #DBE6EF","display": "inline-block","position": "relative","bottom": "1px",
               "right": "1px"  })
               // console.log($('.DelBxCheck_main').find('p'))
               //transfer  node content in  this
               $('.DelBxCheck_main').find('p')[0].innerHTML = DelNode
              //  data = $(this).prev()[0]
              //事件触发不能传值，多个事件嵌套内的值 可以直接使用
               $("#CkDelNode").on('click',function(){
                  //remove this li
                   li.parent().remove()
                   postJSON(ContainerDelNode,DelNode)

               })
        })
    }
    //add the Nodename list  into  ServiceNode  option 
      $('#Service').on('click',function(){
          nodelist = window.ContainerNodeList
          console.log(nodelist)
          for(x=0;x<nodelist.length;x++){
              var data =  JSON.parse(nodelist[x])
              console.log(nodelist[x])
              $("#DependsNode").append("<option value=' "+data.NodeName+" '>"+data.NodeName+"</option>")
          }
      })
        //   console.log(window.ContainerNodeList)
        //   // createNode(i[x])


        // data = JSON.parse(window.ContainerNodeList);
        // html = "<li ><a href=\"#ios\" data-toggle=\"tab\" title=\"" + data.NodeIp + "\" >" + data.NodeName + "</a>"
        // +  "<div style id=\"del_node\" class=\"del_node\" title=\"删除空间\" ></div></li>"
        // $("#myTab").append(html)
        // NodeClick();
        // DelNode();
        // console.log(a);
    //load  Node list
    // function  LoadNodeList() {
    //   getJSON(ContainerNodeList).then(function(data){
    //         // data = data.replace(/[\\]/g,"");
    //         data = JSON.parse(data)
    //         // window.ContainerNodeList = JSON.parse(data)
    //         console.log(data)
    //         // return data
    //         // //n 得到下标
    //         $.map(data,function (i,n ){
    //           for(x=0;x<i.length;x++){
    //             // console.log(i[x])
    //             window.ContainerNodeList = i[x]
    //             console.log(window.ContainerNodeList)
    //             // createNode(i[x])
    //           }
    //         })
    //   });
    // }
      // $('#Service').on('click',function(){
      //     // Node =  LoadNodeList()
      //     // Node = JSON.parse(Node.data)
      //     console.log(window.ContainerNodeList )
      // })
    // function test (){
    //   document.getElementById("container").contentEditable = true;
    //   var content =  "<table>"
    //   + "<tbody>"
    //   + "<tr>"
    //   + "<td>Tanmay</td>"
    //   + "<td>Tanmay</td>"
    //   + "<td>Tanmay</td>"
    //   + "<td>Tanmay</td>"
    //   + "<td>Tanmay</td>"
    //   + "</tr>"
    //   + "</tbody>"
    //   + "</table>"
    //   document.getElementById("container").contentWindow.document.write(content)
    // }

    //    $('#Scontainer').empty();
    //    var html = "<iframe id='container' frameborder='0' scrolling='no' width='1000px'  marginheight='0' style='margin-left: 220px;margin-bottom: 20px;padding-left: 0;padding-right: 0;margin-top: -55%;left: 100px;'></iframe>"
    //    $('#Scontainer').append(html)
    //    document.getElementById("Scontainer").contentWindow.document.designMode = "on";
    //    document.getElementById("Scontainer").contentEditable = true;
    //    document.getElementById("Scontainer").contentWindow.document.write('aa');


{/* <table class="table table-hover">
                              <thead>
                                <tr>
                                  <th>ID</th>
                                  <th>服务名称</th>
                                  <th>所属节点</th>
                                  <th>所属用户</th>
                                  <th>服务地址</th>
                                  <th>使用镜像</th>
                                  <th>内存分配</th>
                                  <th>CPU分配</th>
                                  <th>创建时间</th>
                                  <th>服务状态</th>
                                  <th>服务操作</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>Tanmay</td>
                                  <td>Bangalore</td>
                                  <td>560001</td>
                                  <td>560001</td>
                                  <td>560001</td>
                                  <td>560001</td>
                                  <td>Bangalore</td>
                                  <td>560001</td>
                                  <td>560001</td>
                                  <td>560001</td>
                                  <td>560001</td>
                                </tr>
                                <tr>
                                  <td>Sachin</td>
                                  <td>Mumbai</td>
                                  <td>400003</td>
                                  <td>Sachin</td>
                                  <td>Mumbai</td>
                                  <td>400003</td>
                                  <td>Mumbai</td>
                                  <td>400003</td>
                                  <td>Sachin</td>
                                  <td>Mumbai</td>
                                  <td>400003</td>
                                </tr>
                                <tr>
                                  <td>Uma</td>
                                  <td>Pune</td>
                                  <td>411027</td>
                                  <td>Uma</td>
                                  <td>Pune</td>
                                  <td>411027</td>
                                  <td>Mumbai</td>
                                  <td>400003</td>
                                  <td>Sachin</td>
                                  <td>Mumbai</td>
                                  <td>400003</td>
                                </tr>
                              </tbody>
                            </table> */}


// function collapseAll() {
//     $('#image_list').treeview('collapseAll', {silent: true});
// }

// // submit  repo conf
// function SubmitRepoName (){
//     var address = document.getElementById("address").value;
//     var username = document.getElementById("repo_user").value;
//     var password = document.getElementById("repot_pass").value;
//     console.log(address);
//     var data =  {"address": address,"repo_user": username,"repo_pass": password};
//     data = JSON.stringify(data) ;
//     $.ajax({
//         "type":"POST",
//         "url": SubmitRepoURL,
//         "dataType": "json",
//         "data": {"parameters":data},
//         "beforeSend": start_load_pic,
//         "error": errorAjax,
//         "complete": stop_load_pic,
//         "success": function (data) {
//             console.log(data);
//             if (!data.status) {
//                 showErrorInfo(data.content);
//                 return false;
//             }
//             else {
//                 showSuccessNotic();
//             }
//         }
//     })

// }
// //load repo list
// function load_repo_list(){
//     $.ajax({
//         "url": LoadRepoListContentURL,
//         "dataType": "jsonp",
//         "beforeSend": start_load_pic,
//         "error": errorAjax,
//         "complete": stop_load_pic,
//         "success": function (data) {
//           //  console.log(data.content);
//            for (let i in data.content){
//               data.content[i] = JSON.parse(data.content[i]);
//               // console.log(data.content[i]);
//            }
//               // console.log(data.content);
//             // let data1 = (data.content.data);
//             // data2 = JSON.parse(data1);
//             // console.log(data2);
//             // let result = Array.from(data.content)
//             // responseCheck(data);
//             // var data = JSON.parse(data);
//             if (!data.status) {
//                 showErrorInfo(data.content);
//                 return false;
//             }
//             else {
//                 showSuccessNotic();
//                 createRepoTableLine(data.content);
//             }
//         }
//     })
// }
// function deleteRepo(deleteButton) {
//     //deleteButton filename
//     var addname = deleteButton.getAttribute("address");
//     console.log(addname)
//     var td = $(deleteButton).parent();
//     var tr = $(td).parent();
//     jQuery.ajax({
//         "url": deleteRepotURL,
//         "dataType": "jsonp",
//         "data": {"addname": addname},
//         "beforeSend": start_load_pic,
//         "error": errorAjax,
//         "complete": stop_load_pic,
//         "success": function (data) {
//             if (!data.status) {
//                 showErrorInfo(data.content);
//                 return false;
//             }
//             else {
//                 showSuccessNotic();
//                 $(tr).remove();//del line
//             }
//         }
//     });
// }
// //create table
// function createRepoTableLine(data) {
//     // console.log(data);
//     //防止多次加载
//     $("#showDockerRepoTbody").children().remove();
//     for(let arr in data){
//         var showDockerRepoTbody = document.getElementById("showDockerRepoTbody");
//         var tr = document.createElement("tr");
//         //script name
//         var Repo = document.createElement("td");
//         Repo.textContent = data[arr]["address"];
//         tr.appendChild(Repo);
//         //create  time
//         var time = document.createElement("td");
//         time.className = "hidden-xs";
//         time.textContent = data[arr]["time"];
//         tr.appendChild(time);
//         //opeation button
//         var opTd = document.createElement("td");
//         var deleteButton = document.createElement("button");
//         deleteButton.className = "btn btn-xs btn-danger glyphicon glyphicon-trash";
//         deleteButton.setAttribute("address", data[arr]["address"]);
//         deleteButton.style.marginLeft = "3px";
//         deleteButton.onclick = function () {
//             deleteRepo(this);
//         }
//         opTd.appendChild(deleteButton);
//         tr.appendChild(opTd);
//         showDockerRepoTbody.appendChild(tr);

//     }
// }


// //search the  script content
// function searchValue(input) {
//     var searchValue = input.value.toLowerCase();
//     var table = $("table").find("tbody tr");
//     table.each(
//         function () {
//             // if(!searchValue)return false;
//             var e = jQuery(this);
//             var eValue = e.text().toLowerCase();
//             if (!eValue.match(searchValue)) {
//                 e.hide();
//             }
//             else {
//                 e.show()
//             }
//         }
//     )

// };
// function GotBackPage(){
//         document.getElementById("address").value = '';
//         document.getElementById("repo_user").value = '';
//         document.getElementById("repot_pass").value = '';
//         document.getElementById("MoveCreateDiv").style.display = "block";
//         $('#CreateDockerRepo').css({background: "white", height: "100%", display: "block"});
//         $('#CreateRepo').attr("disabled",true);
//         $("#showCreateDiv").hide("fast");
// }
// //init
// $(function () {
//     load_repo_list();
//     //bind refreash
//     document.getElementById("refreshRepoList").onclick = function () {
//         window.location.reload();
//     }
//     //create repo button
//     document.getElementById("CreateRepoDiv").onclick = function () {
//         // $("#CreateDockerRepo").css("display","none");
//         document.getElementById("MoveCreateDiv").style.display="none";
//         $('#CreateDockerRepo').css({background:"#F3F3F4",height:"100%",display:"block"})
//         $("#showCreateDiv").show("fast");
//         document.getElementById("address").focus();
//     };
//     //GotBack repo list
//     document.getElementById("GotBack").onclick = function () {
//             GotBackPage();
//     };
//     //enable button
//     $(document).on('keyup','#address',function(){
//         $('#CreateRepo').attr("disabled",false);
//     });

//     //toggle chick
//     $('#supportbuild').on('click',function(){
//         $("#no_support_build").attr("checked",false);
//     });
//     $('#no_support_build').on('click',function(){
//         $("#supportbuild").attr("checked",false);
//     });
//     $("#CreateRepo").on('click',function(){
//             SubmitRepoName();
//             GotBackPage();
//     });
//     $("#docker_img").on('click',function () {
//             load_docker_img();
//     });
//     $("#Docker_repo").on('click',function () {
//         load_repo_list();
//     });
//     $(document).on('keyup', '.searchValue', function () {
//         searchValue(this);
//     });

// })
