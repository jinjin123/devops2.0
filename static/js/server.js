/**
 * Created by wupeijin on 17/3/26.
 */
$(function () {
    $('#lg_choice').change(function () {
        var opt = $('#lg_choice').val();
        if (opt == 'key') {
            $('#choice_lg').css("display", "block");
            $('.key').css("display", "block");
            $('#choice_lg3').css("display", "block");
        } else {
            $('#choice_lg').css("display", "none");
            $('.key').css("display", "none");
            $('#choice_lg3').css("display", "none");
        }
    })
    document.getElementById("sudo").onclick = function () {
        //this是div，
        sudoProgress(this)
    }
    //绑定su选择
    document.getElementById("su").onclick = function () {
        //this是div，
        suProgress(this)
    }
    function sudoProgress(div) {
        //点击sudo按钮的时候要处理的事情
        //div是i和span,i中是check
        var sudoPassword = document.getElementById("sudoPassword");
        var suPassword = document.getElementById("suPassword");

        var check = $(div).find("i")[0];
        if ($(check).hasClass("glyphicon-check")) {
            //如果点击之前是被选中的，则取消选中
            $(check).removeClass("glyphicon-check").addClass("glyphicon-unchecked")
            sudoPassword.setAttribute("disabled", true);//取消了以后，就不能输入密码了
        }
        else {
            $(check).removeClass("glyphicon-unchecked").addClass("glyphicon-check")
            sudoPassword.removeAttribute("disabled");
            //这里做了sudo的选中，所以取消su的选中
            var suDiv = $("#su");
            var suCheck = $(suDiv).find("i")[0];
            $(suCheck).removeClass("glyphicon-check").addClass("glyphicon-unchecked");
            suPassword.setAttribute("disabled", true)
        }

    }

    function suProgress(div) {
        //点击su按钮的时候要处理的事情
        var sudoPassword = document.getElementById("sudoPassword");
        var suPassword = document.getElementById("suPassword");
        //div是i和span,i中是check
        var check = $(div).find("i")[0];
        if ($(check).hasClass("glyphicon-check")) {
            //如果点击之前是被选中的，则取消选中
            $(check).removeClass("glyphicon-check").addClass("glyphicon-unchecked")
            suPassword.setAttribute("disabled", true)
        }
        else {
            $(check).removeClass("glyphicon-unchecked").addClass("glyphicon-check")
            suPassword.removeAttribute("disabled");
            //这里做了su的选中，所以取消sudo的选中
            var sudoDiv = $("#sudo");
            var sudoCheck = $(sudoDiv).find("i")[0];
            $(sudoCheck).removeClass("glyphicon-check").addClass("glyphicon-unchecked");
            sudoPassword.setAttribute("disabled", true)
        }

    }
})

// clear edit
$(function () {
    $('#close_edit').one('click',function () {
        document.getElementById("ip").value = "";
        document.getElementById("port").value = "";
        document.getElementById("group").value = "";
        document.getElementById("user").value = "";
        document.getElementById("password").value = "";
        var LoginSelect = document.getElementById("lg_choice");
        LoginSelect.options[0].textContent = "password";
        LoginSelect.options[1].textContent = "key";
        $('#choice_lg').css("display", "none");
        $('.key').css("display", "none");
        $('#choice_lg3').css("display", "none");
        document.getElementById("sudo").value = "";
        document.getElementById("sudoPassword").value = "";
        document.getElementById("su").value = "";
        document.getElementById("suPassword").value = ""
        document.getElementById("bz").value = "";
    })
})
//Edit get the this line  value   to  editpage.
function EditServer() {
    $('.cd-content').one('click', '.edit-server', function () {
        var td = $(this).parent().prevAll();
        var IP = td[12].textContent;
        var PORT = td[11].textContent;
        var GROUP = td[10].textContent;
        var USER = td[9].textContent;
        var LG_type = td[8].textContent;
        var KEY = td[7].textContent;
        var PASSWORD = td[6].textContent;
        var US_SUDO = td[5].textContent;
        var US_SU = td[4].textContent;
        var SUDO = td[3].textContent;
        var SU = td[2].textContent;
        var STATUS = td[1].textContent;
        var BZ = td[0].textContent;
        console.log(td);

        document.getElementById("ip").value = IP;//ip
        document.getElementById("port").value = PORT;
        document.getElementById("group").value = GROUP;
        document.getElementById("user").value = USER;
        var LoginSelect = document.getElementById("lg_choice");

        if(LG_type == "秘钥方式"){
            //hide  key input
            $('#choice_lg').css("display", "block");
            $('.key').css("display", "block");
            $('#choice_lg3').css("display", "block");
            LoginSelect.options[0].textContent = 'key';
            LoginSelect.options[1].textContent = 'password';
            $('#choice_lg3').value = KEY;
        } else {
            $('#choice_lg').css("display", "none");
            $('.key').css("display", "none");
            $('#choice_lg3').css("display", "none");

        }
        document.getElementById("password").value = PASSWORD;

        $('#im_host').show();
        // ClearServerEdit();
    })
}

function DelServer() {
    $('.cd-content').one('click', '.del-server', function () {
         var td = $(this).parent().prevAll();
         var IP = td[12].textContent;
        // document.querySelector('table').GM('refreshGrid',true); //TODO: 目前只能删除当条数据刷新页面重新get 数据
        //  $(td).parent().parents().remove();
    })
}
