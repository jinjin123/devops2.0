$(function(){
  $('#assetsListTable').DataTable({
	         responsive: true
   });

})
function deleteAssets(obj,id){
  var token = get_global_csrf_token()
  $.ajax({
      type: 'DELETE',
      headers: {'X-CSRFToken': token },
      url: assets+id+'/',
        success:function(response){
            showSuccessNotic()
            location.reload();
        },
            error:function(response){
              showErrorInfo('删除失败!')
            }
    });
}
function assetsUpdate(obj, id,ip,type){
      var token = get_global_csrf_token()
      $.ajax({
          type: 'POST',
          headers: {'X-CSRFToken': token },
          beforeSend: start_load_pic,
          complete: stop_load_pic,
          url: assets_facts,
          data:{
            "ip":ip,
            "server_id":id,
            "type":type
          },
            success:function(response){
                    if (response["code"]=="200"){
                      showSuccessNotic()
                    }
                else{
                  showErrorInfo(response['msg'])
                }
        },
              error:function(response){
                console.log(response)
                  showErrorInfo('请求更新失败')
              },
        });
  }
