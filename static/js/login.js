$(function() {
	$("#boom").on('click', function () {
		if (document.getElementById("edit-name").value == '' || document.getElementById("edit-pwd").value == '') {
			document.getElementById('edit-name').style.backgroundColor = "#f2dede";
			document.getElementById('edit-pwd').style.backgroundColor = "#f2dede";
			return false;
		} else {
			var username = $("#edit-name").val();
			var password = $("#edit-pwd").val();
			console.log({"username":username,"password":password});
		$.ajax({
			type: "POST",
			url: "/ops/index",
			dataType:"json",
			// data:JSON.stringify({"username":username,"password":password}),
			 data:{"username":username,"password":password},
			success: function (response) {
				if (response == 'no_user') {
					document.getElementById('edit-name').style.backgroundColor = "#f2dede";
				} else if (response == 'pwd_err') {
					document.getElementById('edit-pwd').style.backgroundColor = "#f2dede";
				} else {
                    // console.log(document.forms[0].elements[0].name);
					 // window.location.href = "/ops/index?" + document.forms[0].elements[0].name + '=' + response.username;
					document.getElementById('edit-name').style.backgroundColor = "#f2dede";
				}
			}
		});
	}
	})
});
 //TODO :接收后段登录返回的消息  进行人性化的交互显示
// function Gogin() {
// 			$.ajax({
// 			type: "GET",
// 			url: "/ops/index",
// 			success: function (response) {
// 					if (response == 'no_user') {
// 						document.getElementById('edit-name').style.backgroundColor = "#f2dede";
// 					} else {
// 						document.getElementById('edit-pwd').style.backgroundColor = "#f2dede";
// 					}
// 				}
// 			})
// }
// $(function () {
// 		Gogin()
// })
