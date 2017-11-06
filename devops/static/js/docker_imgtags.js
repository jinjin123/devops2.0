$(function (){
  fetch(DockerIMGTAGS + 'j/couchdb', {
      method: 'get',
      headers: {"Content-type": "application/json charset=UTF-8"}
  })
  .then(
      function(response) {
          // response.json().then(function(data_format) {
          // function(data) {
            //  console.log(typeof(data),'293');
          if (response.status == 200) {
              var tree_view = []
              // console.log(data.tag_list,'297')
              $.each(data.tag_list, function(index, value, array) {
                  source_data[value.tag] = value
                  var tag_size = 0
                  $.each(value.layer_detail, function(i, v, a) {
                      tag_size += v.size
                  })
                  tree_view.push({
                      "text":value.tag,
                      "tags":[value.layer_count + " Layers",(tag_size / 1024 / 1024).toFixed(2) + " MB",value.last_modified]
                  })
              });
              if (tree_view.length) {
                  $('#tag_list').treeview({
                      data: tree_view,
                      multiSelect: true,
                      levels: 1,
                      showTags: true
                  });
                  $('#btn_select_all').attr('disabled',false)
                  $('#btn_del_images').attr('disabled',false)
                  $('#btn_tag_manifest').attr('disabled',false)
                  $('#btn_tag_history').attr('disabled',false)
                  $('#ipt_search_tags').attr('disabled',false)
              } else {
                  $('#tag_list').treeview({data: [{"text":"镜像木有标签 ..."}]})
                  $('#tag_list').treeview('disableAll', { silent: true });
                  $('#btn_collapse_all').attr('disabled',true)
                  $('#btn_delete_images').attr('disabled',true)
                  $('#ipt_search_tags').attr('disabled',true)
              }
          }
      // });
  })
  .catch(function(err) {
      alert("标签列表获取异常！" + err);
  });

  $('#image_title').text(" > " + image)
  $('#docker_img').on('click',function (e){
      window.location.href = '/ops/docker_repo';
  })
  $('#refreshRepoList').on('click',function (e) {
      window.location.reload();
  })

  $('#mdl_show_detail').on('hide.bs.modal', function (e) {
      $('#ul_tag_detail_body').empty()
      $('#sp_tag_url').empty()
      $('#sp_tag_size').empty()
      $('#sp_tag_digest').empty()
  })

  $('#mdl_show_history').on('hide.bs.modal', function (e) {
      $('#div_tag_history_body').empty()
  })

  $('#mdl_info').on('hide.bs.modal', function (e) {
      $('#sp_info_title').empty()
      $('#sp_info_body').empty()
      $('#sp_info_foot').empty()
      top.location = 'docker_imagestags?image=' + image
  })
});
  function get_tag_manifest() {
      var sel_tag = $('#tag_list').treeview('getSelected', { silent: true });
      if (sel_tag.length == 1) {
          var tag_size = 0
          var tag_detail = source_data[sel_tag[0].text]

          $.each(tag_detail.layer_detail, function(index, value, array) {
              tag_size += value.size
              $('#ul_tag_detail_body').append("<li class=\"list-group-item\" style=\"word-wrap:break-word\"> \
                  <span class=\"badge\">" + (value.size / 1024 / 1024).toFixed(2) + " MB</span> \
                  <small><strong>mediaType: </strong>"
                  + value.mediaType + "<br/><strong>digest: </strong>"
                  + value.digest + "</small></li>")
          })
          $('#sp_tag_digest').text(tag_detail.digest.split(':')[1])
          $('#sp_tag_url').text(tag_detail.url)
          $('#sp_tag_size').text((tag_size / 1024 / 1024).toFixed(2) + " MB")
          $('#mdl_show_detail').modal('show')
      } else {
          $('#sp_info_title').text('错误')
          $('#sp_info_body').append('<span>没有选择标签或者选择了 <strong>多个标签</strong></span>')
          $('#sp_info_foot').append('<button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>')
          $('#mdl_info').modal('show')
      }
  }

  function get_tag_history() {
      var sel_tag = $('#tag_list').treeview('getSelected', { silent: true });
      if (sel_tag.length == 1) {
              // fetch('/api/v1/tag/history?image=' + image + '&tag=' + sel_tag[0].text, {
              fetch(DockerIMGTAGS_HISTORY + image + '&tag=' + sel_tag[0].text, {
                  method: 'get',
                  headers: {"Content-type": "application/json charset=UTF-8"}
              })
              .then(
                  function(response) {
                      response.json().then(function(data) {
                      if (response.status == 200) {
                          data =  JSON.parse(data);
                          $('#sp_tag_title').text(data.image + ":" + data.tag)
                          // console.log(data.history)
                          var history = ""
                          $.each(data.history, function(index, value, array) {
                              // console.log(value);
                              if (value.container_config){
                                  history = "<div class=\"panel panel-default\"><div class=\"panel-heading\" role=\"tab\" id=\"head" + value.id + "\">"
                                  + "<a data-toggle=\"collapse\" data-parent=\"#div_tag_history_body\" href=\"#" + value.id + "\" aria-expanded=\"true\" aria-controls=\""
                                  + value.id + "\">" + value.created.split('T')[0] + " " + value.created.split('T')[1].split('.')[0] + "</a></div>"
                                  + "<div id=\"" + value.id + "\" class=\"panel-collapse collapse\" role=\"tabpanel\" aria-labelledby=\"head" + value.id + "\">"
                                  + "<div class=\"panel-body\" style=\"word-wrap:break-word\"><small>"
                                  + JSON.stringify(value.container_config.Cmd)
                                  + "</small></div></div></div>"
                                  $('#div_tag_history_body').append(history)
                              }
                          })
                      }
                  });
              })
              .catch(function(err) {
                  alert("标签列表获取异常！" + err);
              });
          $('#mdl_show_history').modal('show')
      } else {
          $('#sp_info_title').text('错误')
          $('#sp_info_body').append('<span>没有选择标签或者选择了 <strong>多个标签</strong></span>')
          $('#sp_info_foot').append('<button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>')
          $('#mdl_info').modal('show')
      }
  }

  function select_all() {
      var node_ids = []
      var all_tags = $('#tag_list').treeview('getSiblings', { silent: true });
      var sel_tags = $('#tag_list').treeview('getSelected', { silent: true });
      $.each(all_tags, function(index, value, array) {
          node_ids.push(value.nodeId)
      })
      if (!sel_tags.length){
          $('#tag_list').treeview('selectNode', [ node_ids, { silent: true } ]);
      } else {
          $('#tag_list').treeview('unselectNode', [ node_ids, { silent: true } ]);
      }
  }

  var search = function(e) {
      var options = {
          ignorecase: true,
          exactmatch: false,
          revealresults: true
      }
      var pattern = $('#ipt_search_tags').val();
      var results = $('#tag_list').treeview('search', [ pattern, options ]);
  }
  $('#ipt_search_tags').on('keyup', search);

  function del_images(verify) {
      var sel_tags = $('#tag_list').treeview('getSelected', { silent: true });
      if (sel_tags.length) {
          if (verify) {
              $('#sp_info_title').text('删除镜像')
              $('#sp_info_body').empty()
              $('#sp_info_foot').empty()
              $('#sp_info_foot').append('<button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>')
              //$('#mdl_info').modal('show')
              $.each(sel_tags, function(index, value, array) {
                  $('#sp_info_body').append('<small><span>正在删除镜像 <strong>'
                      + image + ':' + value.text + '</strong> 。第 ' + (index + 1) + ' 个，共 '
                      + sel_tags.length + ' 个。</span><span id=\'sp_tmp_' + index + '\'></span></small><br />'
                  )
                  var body = {
                      "image":image,
                      "tag":value.text
                  }
                  // console.log(body)
                  fetch( DockerIMGDEL, {
                      body: JSON.stringify(body),
                      method: 'delete',
                      headers: {"Content-type": "application/json charset=UTF-8"}
                  })
                  .then(
                      function(response) {
                          response.json().then(function(data) {
                          console.log(response);
                          if (response.status == 200) {
                              $('#sp_tmp_' + index).text("成功")
                          }
                          else {
                              $('#sp_tmp_' + index).text("失败")
                          }
                          if ((index + 1) == sel_tags.length) {
                              $('#sp_info_body').append('<br /><span><strong>删除完成！</strong></span>')
                          }
                      });
                  })
              })
          } else {
              $('#sp_info_title').text('删除镜像')
              $('#sp_info_body').append('<span>请确认您 <strong>删除镜像</strong> 的操作</span>')
              $('#sp_info_foot').append('<button type="button" class="btn btn-default" data-dismiss="modal">关闭</button> \
              <button type="button" class="btn btn-danger" onclick="del_images(1)">确认</button>')
              $('#mdl_info').modal('show')
          }
      } else {
          $('#sp_info_title').text('错误')
          $('#sp_info_body').append('<span>您似乎木有选择 <strong>要删除</strong> 的标签</span>')
          $('#mdl_info').modal('show')
      }
  }
