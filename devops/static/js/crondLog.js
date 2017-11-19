function CrondSelectServer() {
    $("#showCrondHost").show("fast");
    $("#selectCrondTbody").children().remove();
    var hostGroups = [];
    for (i in window.allServersList) {
        var group = window.allServersList[i].group;
        if (hostGroups.indexOf(group) > -1) {//>-1  ? will find :  not find{
            continue;
        }
        else {
            hostGroups.push(group);
        }
    }
    var tbody = document.getElementById("selectCrondTbody");
    for (var i = 0; i < hostGroups.length; i++) {
        group = hostGroups[i];
        //ioop  group  , if group <-> host  , view
		var tr = document.createElement("tr"); // everyline  group |  host A, B
		var td = document.createElement("td"); //group | host A，B
        var groupSpan = document.createElement("span");//show checkbox
        groupSpan.innerHTML = hostGroups[i];//show val
        groupSpan.setAttribute("value", hostGroups[i]);//val - > attr
        td.appendChild(groupSpan);//span and td， first group
        tr.appendChild(td);
        td = document.createElement("td");

        for (h in window.allServersList) {//ioop  get the group <-> host
            if (group === window.allServersList[h].group) {//whent group <-> host , view
                hostSpan = document.createElement("span");
                hostSpan.className = "glyphicon glyphicon-unchecked"; //default
                hostSpan.onclick = function () {
                    if ($(this).hasClass("glyphicon-check")) {
                        $(this).removeClass("glyphicon-check").addClass("glyphicon-unchecked")
                    }
                    else {
                        $(tbody).find(".glyphicon-check").each(function(){
                            $(this).removeClass("glyphicon-check").addClass("glyphicon-unchecked");
                        });
                        $(this).removeClass("glyphicon-unchecked").addClass("glyphicon-check")
                    }
                };
                hostSpan.style.cssText = "margin:10px;cursor:pointer;";
                hostSpan.innerHTML =  window.allServersList[h].ip;//show ip
                hostSpan.setAttribute("value", window.allServersList[h]["ip"]); //show ip
                td.appendChild(hostSpan);
            }
        }
        tr.appendChild(td);
        tbody.appendChild(tr);
    }
}




function changeCrontab(team){
	// startShadow();
	$("#showCrontabDiv").show("fast");
	var data=team.getAttribute("data");
	data=JSON.parse(data);
	var ip=data.ip;
	var runTime=data.time;
	var cmd=data.cmd;
	var dest=data.dest;
	var sid=data.sid;
	var tid=team.getAttribute("tid");

	document.getElementById("server").value=ip;
	document.getElementById("server").setAttribute("sid",sid);
	document.getElementById("runtime").value=runTime;
	document.getElementById("cmd").value=cmd;
	document.getElementById("dest").value=dest;
	document.getElementById("saveCrontab").setAttribute("tid",tid);

	document.getElementById("saveCrontab").setAttribute("action","modify");


}

function deleteCrontab(team){
	//del cron task
	var data=team.getAttribute("data");
	data=JSON.parse(data);
	var sid=data.sid
	var tid=team.getAttribute("tid");
	jQuery.ajax({
		"url":deleteCrondListURL,
		"error":errorAjax,
		"dataType":"jsonp",
		"type":"get",
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"data":{"tid":tid,"sid":sid},
		"success":function(data){
			// responseCheck(data);
			if (!data.status){
				showErrorInfo(data.content);
				return false;
			}
			else{
				$(team).parent().parent().remove();
				showSuccessNotic();
			}
		}
	});
}



function crondLog(){
	$.ajax({
		"url":getCrondListURL,
		"type":"GET",
		"dataType":"jsonp",
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"error":errorAjax,
		"success":function(data){
			// responseCheck(data);
			if (! data.status){
				showErrorInfo(data.content);
				return false;
			}
			else{
				var tbody=document.getElementById("AshowCrondLog");
				var data=data.content;
				console.log(data);
				for (ip in data){
					var crondList=data[ip];//server -> all dict；{1:...,2:...}
					for (id in crondList){
						var tr=document.createElement("tr");
						var td=document.createElement("td");
						td.textContent=ip;//ip
						tr.appendChild(td);
						var td=document.createElement("td");
						td.textContent=crondList[id]["time"];//time
						tr.appendChild(td);

						var td=document.createElement("td");
						td.textContent=crondList[id]["cmd"];//cmd
						tr.appendChild(td);

						var td=document.createElement("td");
						td.textContent=crondList[id]["dest"];//description
						tr.appendChild(td);
						//collection time
						var td=document.createElement("td");
						td.textContent=crondList[id]["collect_time"];
						tr.appendChild(td);
						//operation
						//del btn
						var _crondList=JSON.stringify(crondList[id]);
						var td=document.createElement("td");
						var deleteButton=document.createElement("button");
						deleteButton.setAttribute("data",_crondList);
						deleteButton.setAttribute("tid",id);
						deleteButton.className="btn btn-danger btn-xs glyphicon glyphicon-trash";
						deleteButton.onclick=function(){
							deleteCrontab(this);
						}
						//edit
						var editButton=document.createElement("button");
						editButton.className="btn btn-success btn-xs glyphicon glyphicon-edit";
						editButton.setAttribute("data",_crondList);
						editButton.setAttribute("tid",id);
						editButton.style.marginLeft="2px";
						editButton.onclick=function(){
							changeCrontab(this);
						}
						td.appendChild(deleteButton);
						td.appendChild(editButton);
						tr.appendChild(td);
						tbody.appendChild(tr);
					}
				}
			}
		}
	})
}





function clearCrontabDiv(){
	// clean input div data
	// startShadow();
	$("#showCrontabDiv").show("fast")
	document.getElementById("server").value="";
	document.getElementById("runtime").value="";
	document.getElementById("cmd").value="";
	document.getElementById("dest").value="";
	document.getElementById("saveCrontab").setAttribute("action","create");
}

function saveCrontabList(){
	//save task
	$("#showCrontabDiv").hide("fast");
	stopShadow();
	var ip=document.getElementById("server").value;
        var sid=document.getElementById("server").getAttribute("sid");
        var runtime=document.getElementById("runtime").value;
        var cmd=document.getElementById("cmd").value;
        var dest=document.getElementById("dest").value;
	var action=document.getElementById("saveCrontab").getAttribute("action");
	var data={
			"ip":ip,
			"sid":sid,
			"runtime":runtime,
			"cmd":cmd,
			"dest":dest,
		}
	if (action==="modify"){
		data["tid"]=document.getElementById("saveCrontab").getAttribute("tid");
	}
	data=JSON.stringify(data);
	jQuery.ajax({
		"type":"POST",
		"url":saveCrondToServerURL,
		"data":{"action":action,"data":data},
		"beforeSend":start_load_pic,
		"complete":stop_load_pic,
		"error":errorAjax,
		"success":function(data){
			responseCheck(data);
			data=JSON.parse(data);
			if (!data.status){
				showErrorInfo(data.content);
				return false;
			}
			else{
				refreshCrond();
			}
		}
	})
}


function refreshCrond(){
		$("tbody").children().remove();
		crondLog();
}


$(function(){
    crondLog();
	document.getElementById("refreshCrond").onclick=function(){
		refreshCrond();
	}
	document.getElementById("closeCrontab").onclick=function(){
		$("#showCrontabDiv").hide("fast");//close edit task window
		stopShadow();
	}
	document.getElementById("saveCrontab").onclick=function(){
		stopShadow();
		$("#showCrontabDiv").hide("fast");//close edit task window
		saveCrontab();
	}
	document.getElementById("server").onclick=function(){
		document.getElementById("showCrontabDiv").style.display="none";
		CrondSelectServer();

	}
	document.getElementById("closeServerSelect").onclick=function(){
		document.getElementById("showCrontabDiv").style.display="block";
		document.getElementById("showCrondHost").style.display="none";
	}
	// bind hook server
	document.getElementById("saveServerSelect").onclick=function(){
		var e=$("#selectCrondTbody").find(".glyphicon-check")[0];
        console.log(e);
		var ip=e.textContent;
		var sid=e.getAttribute("value");
		var server=document.getElementById("server");
		server.setAttribute("sid",sid);
		server.value=ip;
		document.getElementById("showCrontabDiv").style.display="block";
		document.getElementById("showCrondHost").style.display="none";
	}
	document.getElementById("saveCrontab").onclick=function(){
		var e=document.getElementById("server")
		var ip=e.value;
		var sid=e.getAttribute("sid");
		var time=document.getElementById("runtime").value;
		var cmd=document.getElementById("cmd").value;
		var dest=document.getElementById("dest").value;

	}
	document.getElementById("createCrond").onclick=function(){
		clearCrontabDiv();
	}
	//bind save btn
	document.getElementById("saveCrontab").onclick=function(){
		saveCrontabList();

	}

})
