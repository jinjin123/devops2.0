 $(function() {
             // We use an inline data source in the example, usually data would
             // be fetched from a server
             var data = [],
                 totalPoints = 300;
             var readdata = [];
             var writedata = [];
             var recedata = [];
             var transdata = [];

             function getData() {
                 if (data.length > 0){
                     data = data.slice(1);
                     $.ajax({
                          url: "/cpu/",
                        dataType: "json",
                        success:function(datas){
                            if(datas[0] == 0){
                                data.push(datas[2]['cpuuse'])
                            }
                        }
                     });
                 }

                 // Do a random walk

                 while (data.length < totalPoints) {
                     y = 0;
                     data.push(y);
                 }

                 // Zip the generated y values with the x values

                 var res = [];
                 for (var i = 0; i < data.length; ++i) {
                     res.push([i, data[i]])
                 }

                 return [{label: 'CPU', data:res}];
             }
             // Set up the control widget
             // io data
                 // Do a random walk
             // net data
             var updateInterval = 3000;
             var plot = $.plot("#placeholder",  getData(), {
                 series: {
                     shadowSize: 0   // Drawing is faster without shadows
                 },
                 yaxis: {
                     min: 0,
                     max: 100,
                     tickFormatter: function suffixFormat(val, axis){
                        return val.toFixed(axis.tickDecimals) + "%";
                     }
                 },
                 xaxis: {
                     show: false
                 }
             });
              function update() {
                 plot.setData(getData());
                 // Since the axes don't change, we don't need to call plot.setupGrid()
                 plot.draw();
                 setTimeout(update, updateInterval);
             }
             update();
             // Add the Flot version string to the footer

         });
