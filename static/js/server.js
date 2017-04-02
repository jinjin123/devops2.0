/**
 * Created by wupeijin on 17/3/26.
 */
$(function(){
    InitServer();
})


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
// clear edit
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
//edit server  to upgrade
    $('#add_server_list').on('click',function () {
        var LG_type = $(this).parent().parent().find('option')[0].textContent;
        var US_SUDO = $(this).parent().parent().find('i')[0].textContent;
        var US_SU = $(this).parent().parent().find('i')[1].textContent;
        var input = $(this).parent().parent().find('input');
        var IP = input[0].value;
        var PORT = input[1].value;
        var GROUP = input[2].value;
        var USER = input[3].value;
        var KEY = input[4].textContent;
        var PASSWORD = input[5].value;
        var SUDO = input[6].value;
        var SU = input[7].value;
        var BZ = input[8].value;
        var ID = input[9].value;
        // console.log(input);
        if (IP == '' || PORT == '' || USER == ''){
            showErrorInfo();
        }else {
            data = {
                "ip": IP,
                "port": PORT,
                "group": GROUP,
                "user": USER,
                "lg_type": LG_type,
                "key": KEY,
                "password": PASSWORD,
                "us_sudo": US_SUDO,
                "us_su": US_SU,
                "sudoPassword": SUDO,
                "suPassword": SU,
                "status": 0,
                "BZ": BZ,
                "id": ID,
            },
                $.ajax({
                    url: addserverURL,
                    type: "post",
                    // contentType: "application/x-www-form-urlencoded;charset=UTF-8",
                    data: JSON.stringify(data),
                    // data: data,
                    error: errorAjax,
                    beforeSend: start_load_pic,
                    complete: stop_load_pic,
                    success: function (response, status) {
                        if (!status == 200) {
                            return false;
                            // showErrorInfo(data.content);
                        }
                        else {
                            showSuccessNotic();
                            CLose_edit_server();
                            // window.location.href = '/ops/host_input';
                            // ajax.load('/ops/host_input');
                        }
                    }
                })
        }
    })
})

$(function () {
//upload server excel filter & progressbar
    $('#drag-and-drop-zone').dmUploader({
        url: '/ops/host_input',
        dataType: 'json',
        allowedTypes: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        onInit:function () {
        $.danidemo.addLog('#demo-debug', 'default', 'Plugin initialized correctly');
    }
    ,
    onBeforeUpload: function (id) {
        $.danidemo.addLog('#demo-debug', 'default', 'Starting the upload of #' + id);

        $.danidemo.updateFileStatus(id, 'default', 'Uploading...');
    }
    ,
    onNewFile: function (id, file) {
        $.danidemo.addFile('#demo-files', id, file);
    }
    ,
    onComplete: function () {
        $.danidemo.addLog('#demo-debug', 'default', 'All pending tranfers completed');
    }
    ,
    onUploadProgress: function (id, percent) {
        var percentStr = percent + '%';

        $.danidemo.updateFileProgress(id, percentStr);
    }
    ,
    onUploadSuccess: function (id, data) {
        $.danidemo.addLog('#demo-debug', 'success', 'Upload of file #' + id + ' completed');

        $.danidemo.addLog('#demo-debug', 'info', 'Server Response for file #' + id + ': ' + JSON.stringify(data));

        $.danidemo.updateFileStatus(id, 'success', 'Upload Complete');

        $.danidemo.updateFileProgress(id, '100%');
    }
    ,
    onUploadError: function (id, message) {
        $.danidemo.updateFileStatus(id, 'error', message);

        $.danidemo.addLog('#demo-debug', 'error', 'Failed to Upload file #' + id + ': ' + message);
    }
    ,
    onFileTypeError: function (file) {
        $.danidemo.addLog('#demo-debug', 'error', 'File \'' + file.name + '\' cannot be added: must be an xls/xlsx');
    }
    ,
    onFileSizeError: function (file) {
        $.danidemo.addLog('#demo-debug', 'error', 'File \'' + file.name + '\' cannot be added: size excess limit');
    }
    ,
    /*onFileExtError: function(file){
     $.danidemo.addLog('#demo-debug', 'error', 'File \'' + file.name + '\' has a Not Allowed Extension');
     },*/
    onFallbackMode: function (message) {
        $.danidemo.addLog('#demo-debug', 'info', 'Browser not supported(do something else here!): ' + message);
    }
   })
});
//server info  table
$(function () {
    var table = document.querySelector('table');
    table.GM({
        supportRemind: true
        , gridManagerName: 'test'
        //   , disableCache: true
        , isCombSorting: true
        , height: '300px'
        , supportAjaxPage: true
        , supportSorting: true
        , ajax_url: '/ops/host_input'
//			,ajax_headers: {'header-test': 'baukh'}
        , ajax_type: 'POST'
        , query: {pluginId: 1}
        , pageSize: 20
        , columnData: [{
            key: 'Ip',
            remind: 'the name',
            width: '50px',
            text: 'IP',
            sorting: 'IP'
        }, {
            key: 'Port',
            remind: 'the info',
            text: '端口',
            sorting: ''
        }, {
            key: 'Group',
            remind: 'the url',
            text: ' 主机组',
            sorting: ''
        }, {
            key: 'User',
            remind: '用户名',
            text: '用户名'
        }, {
            key: 'lg_type',
            remind: '登录方式',
            text: '登录方式'
        }, {
            key: 'Key',
            remind: '秘钥文件',
            text: '秘钥文件'
        }, {
            key: 'Pwd',
            remind: '密码',
            text: '密码'
        }, {
            key: 'US_SUDO',
            remind: '使用Sudo',
            text: '使用Sudo'
        }, {
            key: 'US_SU',
            remind: '使用Su',
            text: '使用SU'
        }, {
            key: 'SUDO',
            remind: 'SuDO密码',
            text: 'SUDO'
        }, {
            key: 'SU',
            remind: 'Su密码',
            text: 'SU'
        }, {
            key: 'Status',
            remind: '状态',
            text: '状态'
        }, {
            key: 'bz',
            remind: '备注',
            text: '备注'
        }, {
            key: 'action',
            remind: 'the action',
            width: '50px',
            text: '操作',
            template: function (action, rowObject) {
                return '<button onclick="EditServer(this)"   class="edit-server btn btn-success btn-xs glyphicon glyphicon-edit " style="margin-left:3px  " learnLink-id="' + rowObject.id + '"></button>'
                    + '<button onclick="DelServer(this)" class="del-server btn btn-danger btn-xs glyphicon glyphicon-trash" style="margin-left: 3px;" learnLink-id="' + rowObject.id + '"></button>';
            }
        }
        ]
        // 分页前事件
        , pagingBefore: function (query) {
            console.log('pagingBefore', query);
        }
        // 分页后事件
        , pagingAfter: function (data) {
            console.log('pagingAfter', data);
        }
        // 排序前事件
        , sortingBefore: function (data) {
            console.log('sortBefore', data);
        }
        // 排序后事件
        , sortingAfter: function (data) {
            console.log('sortAfter', data);
        }
        // 宽度调整前事件
        , adjustBefore: function (event) {
            console.log('adjustBefore', event);
        }
        // 宽度调整后事件
        , adjustAfter: function (event) {
            console.log('adjustAfter', event);
        }
        // 拖拽前事件
        , dragBefore: function (event) {
            console.log('dragBefore', event);
        }
        // 拖拽后事件
        , dragAfter: function (event) {
            console.log('dragAfter', event);
        }
    });

    // 日期格式化,不是插件的代码,只用于处理时间格式化
    Date.prototype.format = function (fmt) {
        var o = {
            "M+": this.getMonth() + 1, //月份
            "D+": this.getDate(), //日
            "d+": this.getDate(), //日
            "H+": this.getHours(), //小时
            "h+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        if (/([Y,y]+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    };

    // 绑定搜索事件
    document.querySelector('.search-action').addEventListener('click', function () {
        var _query = {
            name: document.querySelector('[name="name"]').value,
            info: document.querySelector('[name="info"]').value,
            url: document.querySelector('[name="url"]').value
        };
        table.GM('setQuery', _query).GM('refreshGrid', function () {
            console.log('搜索成功...');
        });
    });

    // 绑定重置
    document.querySelector('.reset-action').addEventListener('click', function () {
        document.querySelector('[name="name"]').value = '';
        document.querySelector('[name="info"]').value = '';
        document.querySelector('[name="url"]').value = '';
    });
})


//Edit get the this line  value   to  editpage.
function EditServer() {
    $('.cd-content').one('click', '.edit-server', function () {
        var td = $(this).parent().prevAll();
        var ID =  td[13].textContent;
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
        console.log(US_SUDO);

        document.getElementById("id").value = ID;//ip
        document.getElementById("ip").value = IP;//ip
        document.getElementById("port").value = PORT;
        document.getElementById("group").value = GROUP;
        document.getElementById("user").value = USER;
        var LoginSelect = document.getElementById("lg_choice");

        if(LG_type == "秘钥方式"){
            document.getElementById("choice_lg3").textContent = KEY;
            $('#choice_lg').css("display", "block");
            $('.key').css("display", "block");
            $('#choice_lg3').css("display", "block");
            LoginSelect.options[0].textContent = 'key';
            LoginSelect.options[1].textContent = 'password';
        } else {
            //hide  key input
            $('#choice_lg').css("display", "none");
            $('.key').css("display", "none");
            $('#choice_lg3').css("display", "none");

        }
        document.getElementById("passwd").value = PASSWORD;
        document.getElementById("BZ").value = BZ;
        if(US_SUDO == 'Y'){
            $('#us_sudo').removeClass("glyphicon-unchecked").addClass("glyphicon-check");
            document.getElementById("sudoPassword").removeAttribute("disabled", true);
            // document.getElementById("us_sudo").textContent = US_SUDO;
            document.getElementById("sudoPassword").value = SUDO;
        }else{
            $('#us_sudo').removeClass("glyphicon-check").addClass("glyphicon-unchecked");
            document.getElementById('sudoPassword').setAttribute("disabled", true)
        }
        if(US_SU == 'Y'){
            $('#us_su').removeClass("glyphicon-unchecked").addClass("glyphicon-check");
            document.getElementById("suPassword").removeAttribute("disabled", true);
            // document.getElementById("us_su").textContent = US_SU;
            document.getElementById("suPassword").value = SU;
        }else{
            $('#us_su').removeClass("glyphicon-check").addClass("glyphicon-unchecked");
            document.getElementById('suPassword').setAttribute("disabled", true)
        }


        $('#im_host').show();
    })
}

//when the edited server  to close  windnow
function CLose_edit_server(){
        $('#im_host').slideDown('slow').hide();
}


function DelServer() {
    $('.cd-content').one('click', '.del-server', function () {
         var td = $(this).parent().prevAll();
         var id = td[13].textContent;
         var ip = td[12].textContent;
        console.log(id,ip);
        $.ajax({
            type:"POST",
            url: delserverURL,
            data:JSON.stringify({"id":id,"ip":ip}),
            error: errorAjax,
            beforeSend: start_load_pic,
            complete: stop_load_pic,
            success: function (response, status) {
                if (!status == 200) {
                    return false;
                    // showErrorInfo(data.content);
                }
                else {
                    showSuccessNotic();
                    CLose_edit_server();
                    // window.location.href = '/ops/host_input';
                    // ajax.load('/ops/host_input');
                }
            }

        })
        // // document.querySelector('table').GM('refreshGrid',true); //TODO: 目前只能删除当条数据刷新页面重新get 数据
    })
}

function InitServer(){
     initGetServersList();
    document.getElementById("closeButton").onclick = function () {
        $("#showErrorInfoDIV").hide("fast");
        document.getElementById("shadow").style.display = "none";
    }
}

