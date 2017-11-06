/**
 * Created by wupeijin on 17/3/22.
 */
    $(function () {
        var updateInterval = 100;
        function test () {

            $.ajax({
                url: 'http://192.168.0.101:8080/hello',
                success: function (respsonse) {
                    console.log('response');
                }
            });
        }
        function update() {
            test()
                 setTimeout(update, updateInterval);
             }

             update();

    })
