$(function(){
    setTimeout("force_show_mail()",500)
    $('#assets_close').click(function(){
      $('#assets_update').hide()
    })
})
function addIdcData(obj) {
    var btnObj = $(obj);
    var token = get_global_csrf_token()
    btnObj.attr('disabled',true);
    var required = ['name', 'address','tel','contact','contact_phone','jigui','ip_range','bandwidth'];
    var post_data = {};
    var form = document.getElementById('idc_assets');
    for (var i = 0; i < form.length; ++i) {
        var name = form[i].name;
        var value = form[i].value;
        idx = $.inArray(name,required);
        if (idx >= 0 && value.length ==0){
           showErrorInfo('请注意必填项不能为空~')
	         return false;
        }
        else if( value.length != 0 && name.length != 0 ){
            post_data[name] =value
        }
    };
    $.ajax({
        dataType:"JSON",
        headers: {
          'X-CSRFToken': token
        },
        type:"POST",
        url: create_idc,
        data:post_data,
        success: function (response) {
            btnObj.removeAttr('disabled');
            showSuccessNotic()
            location.reload();
        },
        error: function (response) {
            btnObj.removeAttr('disabled');
            showErrorInfo('机房添加失败')
            location.reload();
        }
    })
}

function addAssetsData(obj,op) {
		var btnObj = $(obj);
    var token = get_global_csrf_token()
		btnObj.attr('disabled',true);
		var post_data = {};
		if (op=="service"){
			var putUrl = create_service;
			var form = document.getElementById('service_assets');
		}
		else if (op=="business"){
			var putUrl = create_business;
			var form = document.getElementById('business_assets');
		}
		else if (op=="group"){
			var putUrl = Get_Group_api;
			var form = document.getElementById('group_assets');
		}
		else if (op=="zone"){
			var putUrl = create_zone;
			var form = document.getElementById('zone_assets');
		}
		else if (op=="idc"){
			var putUrl = create_idc;
			var form = document.getElementById('idc_assets');
		}
		else if (op=="line"){
			var putUrl = create_line;
			var form = document.getElementById('line_assets');
		}
		else if (op=="raid"){
			var putUrl = create_raid;
			var form = document.getElementById('raid_assets');
		}
		else if (op=="status"){
			var putUrl = assets_status;
			var form = document.getElementById('status_assets');
		}
		for (var i = 0; i < form.length; ++i) {
			var name = form[i].name;
			var value = form[i].value;
			if ( value.length == 0){
        showErrorInfo('请注意必填项不能为空~')
				return false;
			}

		};
		post_data[name] = value;
		$.ajax({
			dataType: "JSON",
      headers:{
        'X-CSRFToken':  token
      },
			url:putUrl,
			type:"POST",
			data:post_data,
			success:function(response){
				btnObj.removeAttr('disabled');
        showSuccessNotic()
				location.reload();

			},
	    	error:function(response){
	    		btnObj.removeAttr('disabled');
          showErrorInfo('资产添加失败')
          console.log(response)
	    	}
		})
	}

function  modfAssetsData(obj,op,id){
    var token = get_global_csrf_token()
    $('#assets_update').show()
    $('#assets_update_button').click(function(){
    var btnObj = $(obj);
    var post_data = {};
    var result = $('#asset_name').val();
    console.log(op)
    if (result.length == 0){
      return;
    };
    if (op=="service"){
      var putUrl = create_service+ id +'/';
      post_data['service_name'] = result;
    }
    else if (op=="group"){
      var putUrl = Get_Group_api+ id +'/';
      post_data['name'] = result;
    }
    else if (op=="idc"){
      var putUrl = create_idc +id +'/';
      post_data['name'] = result;
    }
    else if (op=="line"){
      var putUrl = create_line+ id +'/';
      post_data['line_name'] = result;
    }
    else if (op=="raid"){
      var putUrl = create_raid+ id +'/';
      post_data['raid_name'] = result;
    }
    else if (op=="status"){
      var putUrl =  assets_status+ id +'/';
      post_data['status_name'] = result;
    };
    $.ajax({
        type: 'PUT',
        headers:{
          'X-CSRFToken': token
        },
        url: putUrl,
        data:post_data,
          success:function(response){
                showSuccessNotic()
                location.reload();
      },
            error:function(response){
              console.log(response)
              showErrorInfo('修改失败!')
            },
      });
  })
 }

function delAssetsData(obj,op,id) {
    var token = get_global_csrf_token()
		var btnObj = $(obj);
		if (op=="service"){
			var putUrl = create_service + id + '/';
		}
		else if (op=="group"){
			var putUrl =  Get_Group_api + id + '/';
		}
		else if (op=="zone"){
			var putUrl = create_zone + id + '/';
		}
		else if (op=="line"){
			var putUrl = create_line + id + '/';
		}
		else if (op=="raid"){
			var putUrl = create_raid + id + '/';
		}
		else if (op=="status"){
			var putUrl = assets_status + id + '/';
		}
		else if (op=="idc"){
			var putUrl = create_idc + id + '/';
		}
		else if (op=="business"){
			var putUrl = create_business + id + '/';
		}
		$.ajax({
			dataType: "JSON",
      headers:{
        'X-CSRFToken': token
      },
			url:putUrl,
			type:"DELETE",
			success:function(response){
        showSuccessNotic()
				location.reload();

			},
	    	error:function(response){
          showErrorInfo('资产删除失败~')
	    	    location.reload();
	    	}
		})
	}


  function get_update_record(obj){
       //获取要更新的记录信息, *** eq 从1 开始 ***
       var token = get_global_csrf_token()
       var btnObj = $(obj);
       var post_data = {};
       var tr = $(obj).parent().parent().find('td');
       var idn = $("#update_id_input").val(tr.eq(0).text());
       var puturl = create_idc+ idn.val() +'/';
       var name = $("#update_name_input").val(tr.eq(1).text());
       var address = $("#update_address_input").val(tr.eq(2).text());
       var tel = $("#update_tel_input").val(tr.eq(3).text());
       var contact = $("#update_contact_input").val(tr.eq(4).text());
       var contact_phone = $("#update_contact_phone_input").val(tr.eq(5).text());
       var jigui = $("#update_jigui_input").val(tr.eq(6).text());
       var ip_range = $("#update_ip_range_input").val(tr.eq(7).text());
       var bandwidth = $("#update_bandwidth_input").val(tr.eq(8).text());
       $("#update_one_record_modal").modal('show');
       $('#update_record').click(function(){
       post_data['name'] = name.val();
       post_data['address'] = address.val();
       post_data['tel'] = tel.val();
       post_data['contact'] = contact.val();
       post_data['contact_phone'] = contact_phone.val();
       post_data['jigui'] = jigui.val();
       post_data['ip_range'] = ip_range.val();
       post_data['bandwidth'] = bandwidth.val();
       $.ajax({
             type:'PUT',
             headers:{
               'X-CSRFToken': token
             },
             url:puturl,
             data: post_data,
             success:function(response){
                 showSuccessNotic();
                 location.reload();
             },
             error:function(response){
                 showErrorInfo('修改失败！')
             },
         });
       })
   }
