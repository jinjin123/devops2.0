function addConfigData(obj) {
			var btnObj = $(obj);
			btnObj.attr('disabled',true);
			var post_data = {};
			var putUrl = global_config;
			var form = document.getElementById('addConfig');
			for (var i = 0; i < form.length; ++i) {
				var name = form[i].name;
				var value = form[i].value;
				if (name.length > 0 && value.length > 0){
					post_data[name] = value;
				}

			};
			post_data['op'] = 'log';
      var token = get_global_csrf_token()
			$.ajax({
				dataType: "JSON",
				url:putUrl, //请求地址
				type:"POST",  //提交类似
        headers: {'X-CSRFToken': token },
				data:post_data, //提交参数
				success:function(response){
					btnObj.removeAttr('disabled');
          showSuccessNotic()
					location.reload();
				},
		    	error:function(response){
		    		btnObj.removeAttr('disabled');
            showErrorInfo('修改失败');
		    		location.reload();
		    	}
			})
		}

		function addEmailData(obj) {
			var btnObj = $(obj);
			btnObj.attr('disabled',true);
			var required = ["host","port","user","passwd","site"];
			var post_data = {};
			var putUrl = global_config;
			var form = document.getElementById('addEmail');
			for (var i = 1; i < form.length; ++i) {
				var name = form[i].name;
				var value = form[i].value;
				idx = $.inArray(name, required);
				if (idx >= 0 && value.length == 0){
          showErrorInfo('请注意必填项不能为空~')
					return false;
				};
				if ( value.length != 0 && name.length != 0 ){
					post_data[name] = value;
				};
			};
			post_data['op'] = 'email';
      var token = get_global_csrf_token()
			$.ajax({
				dataType: "JSON",
				url:putUrl, //请求地址
				type:"POST",  //提交类似
        headers: {'X-CSRFToken': token },
				data:post_data, //提交参数
				success:function(response){
					btnObj.removeAttr('disabled');
          showSuccessNotic()
// 					location.reload();
				},
		    	error:function(response){
		    		btnObj.removeAttr('disabled');
            showErrorInfo('修改失败');
		    	}
			})
		}
