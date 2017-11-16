$(function () { $("[data-toggle='tooltip']").tooltip(); });

function oBtAuthType() {
	   var obj = document.getElementById("auth_type_select");
	   var index = obj.selectedIndex;
	   var value = obj.options[index].value;
	   if (value=="0"){
		   document.getElementById("auth_accout_select").style.display = "";
	   }
	   else {
		   document.getElementById("auth_accout_select").style.display = "none";
	   }
}
