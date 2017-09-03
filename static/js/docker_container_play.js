$(function(){
  setTimeout("load_container()",200);
  // load_container();
  $('#images_button').click(function(){
       $('#backup_images').show();
       get_container_backup();
  })
  $('#runprocesses_button').click(function(){
     $('#backup_images').hide();
    Container_process();
  })
  $('#filechanges_button').click(function(){
     $('#backup_images').hide();
     container_get_filediff();
  })
  $('#terminal_button').click(function(){
    //  $('#shell').css('display', 'block');
    setTimeout("terminal_func()",200);
  })
})
//memory graph
$(function () {
    var commonOptions = {
      // colors: ['#f68936', '#70ba47', '#33b5e6', '#fd8f40', '#e7ca60', '#40abaf', '#f6f7f8', '#e9e9eb'],
      global: {
        useUTC: false
      },
      chart: {
        style: {
          fontFamily: 'Roboto Light',
          fontWeight: 'normal',
          fontSize: '12px',
          color: '#585858',
        }
      },
      title: {
        text: null
        // text: '内存使用情况(MB)'
      },
      subtitle: {
        text: null
      },
      credits: {
        enabled: false
      },
      xAxis: {
        title: {
          style: {
            fontFamily: 'Roboto',
            color: "#bbb",
          }
        },
        labels: {
          style:{ color: '#bbb' },
        },
        //刻度标志
        tickWidth:1,
        lineWidth: 1
        // tickLength: 1,
      },

      // Area Chart
      plotOptions: {
        series: {
          fillOpacity: 0.1
        },
        area: {
          lineWidth: 1,
          marker: {
            lineWidth: 2,
            symbol: 'circle',
            fillColor: 'white',
            radius:3,
          },
          legend: {
            radius: 2,
          }
        }
      },
      tooltip: {
        useHTML: true,
        shared: true,
        backgroundColor: '#5f5f5f',
        borderWidth: 0,
        style: {
          padding:10,
          color: '#fefefe',
        }
      },
      legend: {
        itemStyle: {
          fontFamily: 'Roboto Light',
          fontWeight: 'normal',
          fontSize: '12',
          color: '#666666',
        },
        marker: {
          symbol: 'square',
          verticalAlign: 'middle',
          radius: '4',
        },
        symbolHeight: 6,
        symbolWidth: 6,
      },
    };

    // -----------------------------------------------------
    $('.memory').each(function() {
      $(this).highcharts(Highcharts.merge(commonOptions, {
        chart: {
          type: 'area' ,
          events: {
            load: mem_usage
          }
        },
        xAxis: {
          //x y 显示的名字
          title: null,
          type: 'datetime',
          dateTimeLabelFormats: {
            day: '%eth %b'
          }
        },
        yAxis: {
          title: null
        },
        series: [{
          // 鼠标喵点显示名字
          name: '内存使用',
          // 0是 x轴 占位 刻度 多少个0 就代表显示多少个时间
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          //remove  series name
          showInLegend: false,
          color: '#f68936',
          marker: { lineColor: '#f68936', fillColor: 'white', },
          legendIndex:1,
        },{
          name: '限制内存',
          // 0是 x轴 占位 刻度 多少个0 就代表显示多少个时间
          data: [90, 95, 98, 80, 70, 68, 85, 71, 64, 90],
          //remove  series name
          showInLegend: false,
          color: '#70ba47',
          legendIndex:0,
          marker: { lineColor: '#70ba47', fillColor: 'white', },
        }]
      }))

    });
    function mem_usage() {
      setInterval(function(){
        $.ajax({
           type: "post",
           url: Container_mem,
           data: document.getElementById("myTab").getElementsByClassName("active")[0].textContent,
           dataType: "json",
           success : function(data){
             console.log(JSON.parse(data))
             data = JSON.parse(data)
            //  console.log($('.cpu_percentage').highcharts())
             //x one line
            $('.memory').highcharts().series[0].addPoint(data[0],true,true)
            //x two line
            $('.memory').highcharts().series[1].addPoint(data[1],true,true)
           }
         });
      },3000)
    }

    $('.highcharts-grid > path:last-child').remove();
    $('.highcharts-markers > path:last-child').remove();
  });
  //内存使用率
  $(function () {
      var commonOptions = {
        // colors: ['#f68936', '#70ba47', '#33b5e6', '#fd8f40', '#e7ca60', '#40abaf', '#f6f7f8', '#e9e9eb'],
        global: {
          useUTC: false
        },
        chart: {
          style: {
            fontFamily: 'Roboto Light',
            fontWeight: 'normal',
            fontSize: '12px',
            color: '#585858',
          }
        },
        title: {
          text: null
          // text: '内存使用情况(MB)'
        },
        subtitle: {
          text: null
        },
        credits: {
          enabled: false
        },
        xAxis: {
          title: {
            style: {
              fontFamily: 'Roboto',
              color: "#bbb",
            }
          },
          labels: {
            style:{ color: '#bbb' },
          },
          //刻度标志
          tickWidth:1,
          lineWidth: 1
          // tickLength: 1,
        },

        // Area Chart
        plotOptions: {
          series: {
            fillOpacity: 0.1
          },
          area: {
            lineWidth: 1,
            marker: {
              lineWidth: 2,
              symbol: 'circle',
              fillColor: 'white',
              radius:3,
            },
            legend: {
              radius: 2,
            }
          }
        },
        tooltip: {
          useHTML: true,
          shared: true,
          backgroundColor: '#5f5f5f',
          borderWidth: 0,
          style: {
            padding:10,
            color: '#fefefe',
          }
        },
        legend: {
          itemStyle: {
            fontFamily: 'Roboto Light',
            fontWeight: 'normal',
            fontSize: '12',
            color: '#666666',
          },
          marker: {
            symbol: 'square',
            verticalAlign: 'middle',
            radius: '4',
          },
          symbolHeight: 6,
          symbolWidth: 6,
        },
      };

      // -----------------------------------------------------
      $('.mem_percentage').each(function() {
        $(this).highcharts(Highcharts.merge(commonOptions, {
          chart: {
            type: 'area' ,
            events: {
              load: mem_percentage
            }
          },
          xAxis: {
            //x y 显示的名字
            title: null,
            type: 'datetime',
            dateTimeLabelFormats: {
              day: '%eth %b'
            }
          },
          yAxis: {
            title: null
          },
          series: [{
            // 鼠标喵点显示名字
            name: '内存使用率',
            // 0是 x轴 占位 刻度 多少个0 就代表显示多少个时间
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            //remove  series name
            showInLegend: false,
            color: '#f68936',
            marker: { lineColor: '#f68936', fillColor: 'white', },
            // legendIndex:1,
          }]
        }))

      });
      function mem_percentage() {
        setInterval(function(){
          $.ajax({
             type: "post",
             url: Container_mem_percentage,
             data: document.getElementById("myTab").getElementsByClassName("active")[0].textContent,
             dataType: "json",
             success : function(data){
               data = JSON.parse(data)
               console.log(data)
              //  console.log($('.areaChartTwoWay').highcharts())
              $('.mem_percentage').highcharts().series[0].addPoint(data,true,true)
             }
           });
        },3000)
      }

      $('.highcharts-grid > path:last-child').remove();
      $('.highcharts-markers > path:last-child').remove();
    });
    //CPU 使用率
    $(function () {
        var commonOptions = {
          // colors: ['#f68936', '#70ba47', '#33b5e6', '#fd8f40', '#e7ca60', '#40abaf', '#f6f7f8', '#e9e9eb'],
          global: {
            useUTC: false
          },
          chart: {
            style: {
              fontFamily: 'Roboto Light',
              fontWeight: 'normal',
              fontSize: '12px',
              color: '#585858',
            }
          },
          title: {
            text: null
            // text: '内存使用情况(MB)'
          },
          subtitle: {
            text: null
          },
          credits: {
            enabled: false
          },
          xAxis: {
            title: {
              style: {
                fontFamily: 'Roboto',
                color: "#bbb",
              }
            },
            labels: {
              style:{ color: '#bbb' },
            },
            //刻度标志
            tickWidth:1,
            lineWidth: 1
            // tickLength: 1,
          },

          // Area Chart
          plotOptions: {
            series: {
              fillOpacity: 0.1
            },
            area: {
              lineWidth: 1,
              marker: {
                lineWidth: 2,
                symbol: 'circle',
                fillColor: 'white',
                radius:3,
              },
              legend: {
                radius: 2,
              }
            }
          },
          tooltip: {
            useHTML: true,
            shared: true,
            backgroundColor: '#5f5f5f',
            borderWidth: 0,
            style: {
              padding:10,
              color: '#fefefe',
            }
          },
          legend: {
            itemStyle: {
              fontFamily: 'Roboto Light',
              fontWeight: 'normal',
              fontSize: '12',
              color: '#666666',
            },
            marker: {
              symbol: 'square',
              verticalAlign: 'middle',
              radius: '4',
            },
            symbolHeight: 6,
            symbolWidth: 6,
          },
        };

        // -----------------------------------------------------
        $('.cpu').each(function() {
          $(this).highcharts(Highcharts.merge(commonOptions, {
            chart: {
              type: 'area' ,
              events: {
                load: cpu
              }
            },
            xAxis: {
              //x y 显示的名字
              title: null,
              type: 'datetime',
              dateTimeLabelFormats: {
                day: '%eth %b'
              }
            },
            yAxis: {
              title: null
            },
            series: [{
              // 鼠标喵点显示名字
              name: 'CPU使用率',
              // 0是 x轴 占位 刻度 多少个0 就代表显示多少个时间
              data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              //remove  series name
              showInLegend: false,
              color: '#f68936',
              marker: { lineColor: '#f68936', fillColor: 'white', },
              // legendIndex:1,
            }]
          }))

        });
        function cpu() {
          setInterval(function(){
            $.ajax({
               type: "post",
               url: Container_cpuusage,
               data: document.getElementById("myTab").getElementsByClassName("active")[0].textContent,
               dataType: "json",
               success : function(data){
                 console.log(JSON.parse(data))
                 data =  JSON.parse(data)
                //  console.log($('.areaChartTwoWay').highcharts())
                $('.cpu').highcharts().series[0].addPoint(data,true,true)
               }
             });
          },3000)
        }

        $('.highcharts-grid > path:last-child').remove();
        $('.highcharts-markers > path:last-child').remove();
      });
      // 网络IO
      $(function () {
          var commonOptions = {
            // colors: ['#f68936', '#70ba47', '#33b5e6', '#fd8f40', '#e7ca60', '#40abaf', '#f6f7f8', '#e9e9eb'],
            global: {
              useUTC: false
            },
            chart: {
              style: {
                fontFamily: 'Roboto Light',
                fontWeight: 'normal',
                fontSize: '12px',
                color: '#585858',
              }
            },
            title: {
              text: null
              // text: '内存使用情况(MB)'
            },
            subtitle: {
              text: null
            },
            credits: {
              enabled: false
            },
            xAxis: {
              title: {
                style: {
                  fontFamily: 'Roboto',
                  color: "#bbb",
                }
              },
              labels: {
                style:{ color: '#bbb' },
              },
              //刻度标志
              tickWidth:1,
              lineWidth: 1
              // tickLength: 1,
            },

            // Area Chart
            plotOptions: {
              series: {
                fillOpacity: 0.1
              },
              area: {
                lineWidth: 1,
                marker: {
                  lineWidth: 2,
                  symbol: 'circle',
                  fillColor: 'white',
                  radius:3,
                },
                legend: {
                  radius: 2,
                }
              }
            },
            tooltip: {
              useHTML: true,
              shared: true,
              backgroundColor: '#5f5f5f',
              borderWidth: 0,
              style: {
                padding:10,
                color: '#fefefe',
              }
            },
            legend: {
              itemStyle: {
                fontFamily: 'Roboto Light',
                fontWeight: 'normal',
                fontSize: '12',
                color: '#666666',
              },
              marker: {
                symbol: 'square',
                verticalAlign: 'middle',
                radius: '4',
              },
              symbolHeight: 6,
              symbolWidth: 6,
            },
          };

          // -----------------------------------------------------
          $('.network').each(function() {
            $(this).highcharts(Highcharts.merge(commonOptions, {
              chart: {
                type: 'area' ,
                events: {
                  load: network
                }
              },
              xAxis: {
                //x y 显示的名字
                title: null,
                type: 'datetime',
                dateTimeLabelFormats: {
                  day: '%eth %b'
                }
              },
              yAxis: {
                title: null
              },
              series: [{
                // 鼠标喵点显示名字
                name: '进入流量',
                // 0是 x轴 占位 刻度 多少个0 就代表显示多少个时间
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                //remove  series name
                showInLegend: false,
                color: '#f68936',
                marker: { lineColor: '#f68936', fillColor: 'white', },
                legendIndex:1,
              },{
                name: '出口流量',
                // 0是 x轴 占位 刻度 多少个0 就代表显示多少个时间
                data: [90, 95, 98, 80, 70, 68, 85, 71, 64, 90],
                //remove  series name
                showInLegend: false,
                color: '#70ba47',
                legendIndex:0,
                marker: { lineColor: '#70ba47', fillColor: 'white', },
              }]
            }))

          });
          function network() {
            setInterval(function(){
              // var data = {"container_id": document.getElementById("myTab").getElementsByClassName("active")[0].textContent}
              $.ajax({
                 type: "post",
                 url: Container_net,
                 data: document.getElementById("myTab").getElementsByClassName("active")[0].textContent,
                 dataType: "json",
                 success : function(data){
                   console.log(JSON.parse(data))
                   data = JSON.parse(data)
                  //  console.log($('.cpu_percentage').highcharts())
                   //x one line
                  $('.network').highcharts().series[0].addPoint(data[0],true,true)
                  //x two line
                  $('.network').highcharts().series[1].addPoint(data[1],true,true)
                 }
               });
            },3000)
          }

          $('.highcharts-grid > path:last-child').remove();
          $('.highcharts-markers > path:last-child').remove();
        });
  $(document).on( 'shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
    $( ".newChart" ).each(function() {
      var chart = jQuery(this).highcharts();
      console.log(chart)
      chart.reflow();
    });
  })
//push container option to the left list
 function load_container (){
    content = window.owner_container
    $.map(content, function(i, n) {
        for (x = 0; x < i.length; x++){
            container = JSON.parse(i[x]);
            var ul = document.getElementById("myTab")
            var li = document.createElement("li")
            if(x==0){
                li.className  = "active"
            }
            var a  = document.createElement("a")
            a.setAttribute("title",container.container_id)
            a.textContent = container.container_id
            li.appendChild(a)
            ul.appendChild(li)
            // console.log(container)
        }
    });

 }

function  get_container_backup(){
    var data = {"container_id": document.getElementById("myTab").getElementsByClassName("active")[0].textContent}
    //防治重复
    $('#ContainerBackup').children().remove();
    postJSON(Get_container_backup,data).then(function(data){
        console.log(data)
        data = JSON.parse(data);
        if(data.status){
          $.map(data,function (i,n){
              for (x = 0; x < i.length; x++) {
                table = JSON.parse(i[x])
                console.log(table)
                var ContainerBackup = document.getElementById('ContainerBackup')
                var tr = document.createElement("tr");
                var backup_name = document.createElement("td");
                backup_name.setAttribute("id", table.backupname);
                backup_name.textContent = table.backupname
                tr.appendChild(backup_name)

                var tag = document.createElement("td");
                tag.textContent = table.tag
                tr.appendChild(tag)

                var backup_id = document.createElement("td");
                backup_id.textContent = table.image_id
                tr.appendChild(backup_id)

                var Size = document.createElement("td");
                Size.textContent = table.size + "M"
                tr.appendChild(Size)

                var date = document.createElement("td");
                date.textContent = table.created
                tr.appendChild(date)

                //opeation  button
                var opeation = document.createElement("td");
                var del = document.createElement("button");
                del.style.marginLeft = "3px";
                del.className = "btn btn-xs btn-default glyphicon glyphicon-trash";
                del.setAttribute("id", table.image_id);
                del.onclick = function() {
                  rmcontent = {"rmname": this.getAttribute("id"),"container_id": document.getElementById("myTab").getElementsByClassName("active")[0].textContent,"backupname": table.backupname}
                  Image_remove(rmcontent)
                }
                opeation.appendChild(del);
                tr.appendChild(opeation);
                ContainerBackup.appendChild(tr)
              }
          })
        }else{
             //when not backup  to show
              var ContainerBackup = document.getElementById('ContainerBackup')
              var dev = document.createElement("dev");
              dev.style.position = "relative";
              dev.style.left = "160%";
              var h4 = document.createElement("h4");
              h4.textContent = "No images Found"
              dev.appendChild(h4)
              ContainerBackup.appendChild(dev)
        }
    })
}

//remove backup
function Image_remove(name){
  $('.loader').show()
  postJSON(Remove_container_backup,name).then(function (data){
    console.log(data)
    $('.loader').hide()
    if(!data.status){
      //remove line
      $('#'+name.backupname).parent().remove()
       showSuccessNotic();
    }else{
      showErrorInfo(data.result)
    }
  })
}

//get container  processes
//{"Processes": [["2614", "root", "0:00", "/sbin/init"], ["2696", "root", "0:00", "/usr/sbin/sshd -D"]], "Titles": ["PID", "USER", "TIME", "COMMAND"]}
function Container_process(){
   var container_id = document.getElementById("myTab").getElementsByClassName("active")[0].textContent
   $('#progress-titile').children().remove()
   $('#showprogress').children().remove()
   postJSON(Get_container_process, container_id).then(function (data){
    //  console.log(data.Processes)
     //title
     if(data.Titles != null){
         for(a=0;a<data.Titles.length;a++){
            var title = document.getElementById('progress-titile')
            var td = document.createElement("td");
            td.textContent = data.Titles[a]
            title.appendChild(td)
         }
         //ioop progress content
          $.map(data.Processes,function (i,n){
                for(c=0;c<data.Processes.length;c++){
                    var tr = document.createElement("tr");
                    // console.log(x)
                    for(x=0;x<i.length;x++){
                      // there has two array ,  there has  four value inside it ,so get it length to create  td
                        var td = document.createElement("td");
                        td.textContent = i[x]
                        tr.appendChild(td)
                    }
              }
              var showprogress = document.getElementById('showprogress')
              showprogress.appendChild(tr)
          })
       }
   })
}
//get the container image diff
//{"deleted": [], "added": ["/root/.bash_history", "/root/.ssh", "/root/.ssh/authorized_keys", "/run/sshd", "/run/sshd.pid", "/var/log/dmesg.0", "/var/log/dmesg.1.gz", "/var/log/dmesg.2.gz", "/var/log/dmesg.3.gz", "/var/log/dmesg.4.gz"], "modified": ["/etc", "/etc/.pwd.lock", "/etc/shadow", "/root", "/run", "/var/log", "/var/log/dmesg", "/var/log/upstart"]}
function  container_get_filediff(){
  var container_id = document.getElementById("myTab").getElementsByClassName("active")[0].textContent
  postJSON(Get_container_filediff,container_id).then(function(data){
      var modified_str = ''
      var added_str = ''
      var deleted_str = ''
      for(i=0; i<data.modified.length; i++){
          modified_str += '<li>'+data.modified[i]+'</li>'
      }
      for(i=0; i<data.added.length; i++){
          added_str += '<li>'+data.added[i]+'</li>'
      }
      for(i=0; i<data.deleted.length; i++){
          deleted_str += '<li>'+data.deleted[i]+'</li>'
      }
      $('.modified_class').html(modified_str)
      $('.added_class').html(added_str)
      $('.deleted_class').html(deleted_str)
  })
}
function  terminal_func(){
  var container_id = document.getElementById("myTab").getElementsByClassName("active")[0].textContent
  $('#shell').css('display', 'block');
  postJSON(Container_terminal,container_id).then(function(data){
      console.log(data)
      container_id = data.container_id
      port = data.port
      var ps1 = 'druuu # '
      var url = "ws://"+location.hostname+":"+port+"/exec/"+container_id;
      socket = new WebSocket(url);
      term = new Terminal({
        cols: 80,
        rows: 24,
        useStyle: true,
        screenKeys: true,
        cursorBlink: true
      });
      term.on('data', function(data) {
        socket.send(data);
      })
      term.on('title', function(title) {
        // document.title = title;
      })
      $('#shell').html('')
      term.open(document.getElementById('shell'));
      socket.onmessage = function(message){
        term.write(message.data);
        if(message.data.match("exit\r\n$")){
          socket.send('\r\n');
          socket.send('\r\n');
        }
      }
  })
}
