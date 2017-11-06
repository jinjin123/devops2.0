/**
 * Created by wupeijin on 17/3/29.
 */




function initGetServersList() {
    jQuery.ajax({
        "url": loadServerListURL,
        // "dataType": "json",
        "success": function (data) {
            if (!responseCheck(data)) {
                showErrorInfo(data.content);
                // showErrorInfo(data.content);
            }
            else {
                window.allServersList = responseCheck(data);//全局服务器
                console.log(responseCheck(data));
                console.log('接收所有服务器');
            }
        },
        "error": console.log('a'),
    });
}
