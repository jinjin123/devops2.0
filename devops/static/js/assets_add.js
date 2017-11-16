$(function () {
   $("[data-toggle='tooltip']").tooltip();
});

// filter = ''
function getFormData (form, filler) {
		var assets = {};
		var server = {};
		var net = {};
		for (var i = 0; i < form.length; ++i) {
			var name = form[i].name;
			var value = form[i].value;
			if (name.length == 0)
				continue;
			if (value.length == 0) {
				if ((typeof filler != 'string') || (filler.length == 0))
					continue;
				else
					value = filler;
			}
			var assetStart = name.indexOf("asset_");
			var serverStart = name.indexOf("server_");
			var netStart = name.indexOf("net_");
			if (assetStart==0){
				var asz = "assets."+name.replace("asset_","")+" = '" + value + "'";
				try {
					eval(asz);
				} catch (e) {
					alert(e);
				}
			}
			else if(serverStart==0){
				var ssz = "server."+name.replace("server_","")+" = '" + value + "'"; //server.line = '3' like this , put into  key value into dict
				try {
					eval(ssz);
				} catch (e) {
					alert(e);
				}
			}
			else if(netStart==0){
				var nsz = "net."+name.replace("net_","")+" = '" + value + "'";
				try {
					eval(nsz);
				} catch (e) {
					alert(e);
				}
			}

		}
    // { assets:{}, xx:xx}
		if (assets.assets_type == "server"){
			   server.assets = assets;
      if(server.login_type == "密码方式"){
        server.key = 'N';
      }
			return server;
		}
		else {
			net.assets = assets;
			return net;
		}
	}

  function oBtAssetsType() {
		   var obj = document.getElementById("assets_type_select");
		   var index = obj.selectedIndex;
		   var value = obj.options[index].value;
		   if (value=="server"){
			   document.getElementById("asset_server_chioce").style.display = "";
			   document.getElementById("asset_net_chioce").style.display = "none";
		   }
		   else if (value==""){
			   document.getElementById("asset_net_chioce").style.display = "none";
			   document.getElementById("asset_server_chioce").style.display = "none";
		   }
		   else {
			   document.getElementById("asset_net_chioce").style.display = "";
			   document.getElementById("asset_server_chioce").style.display = "none";
		   }
	}
	function oBtAuthType() {
		   var obj = document.getElementById("auth_type_select");
		   var index = obj.selectedIndex;
		   var value = obj.options[index].value;
		   if (value=="密码方式"){
			   document.getElementById("auth_accout_select").style.display = "";
		   }
		   else {
			   document.getElementById("auth_accout_select").style.display = "none";
		   }
	}

	function addAssetsData(obj) {
		var form = document.getElementById('addHost');
		for (var i = 0; i < form.length; ++i) {
			var name = form[i].name;
			var value = form[i].value;
			var assetStart = name.indexOf("asset_");
			if (assetStart==0 && value.length == 0){
        // showErrorInfo('请注意必填项不能为空~')
        console.log('xxx')
				return false;
			}

		};
		var asset_data = getFormData(document.getElementById('addHost'),'');
//	 	alert(JSON.stringify(asset_data));
		var btnObj = $(obj);
		if (asset_data.assets.assets_type=="server"){
			var putUrl = create_server;
		}
		else {
			var putUrl = create_net;
		}
    var token = get_global_csrf_token()
    console.log(asset_data)
		$.ajax({
			dataType: "JSON",
      headers: {
        'X-CSRFToken': token
      },
			url:putUrl, //请求地址
			type:"POST",  //提交类似
			contentType: "application/json",
			data: JSON.stringify({
				'data':asset_data
			}),  //提交参数
			success:function(response){
        showSuccessNotic()
			},
	    	error:function(response){
          console.log(response);
          showErrorInfo('添加资产失败')
	    	}
		})
	}

    $(".form_datetime").datetimepicker({format: 'yyyy-mm-dd'});
