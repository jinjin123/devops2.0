from django.conf.urls import url
from views import views


urlpatterns = [
    url(r'^login',views.Login,name="login"),
    url(r'^logout',views.Logout,name="logout"),
    url(r'^index',views.index,name="ops_index"),
    url(r'^service',views.hello,name="hello"),
    url(r'^host_input',views.host_input,name="host_input"),
    url(r'^add_server_list',views.add_server_list,name="add_server_list"),
    url(r'^del_server_list',views.del_server_list,name="del_server_list"),
    url(r'^load_server_list',views.load_server_list,name="load_server_list"),
    url(r'^get_filetrans_progress',views.get_filetrans_progress,name="get_filetrans_progress"),
    url(r'^upload/test',views.upload_file_test,name="upload_file_test"),
    url(r'^filetrans/upload/',views.filetrans_upload,name="filetrans_upload"),
    url(r'^fileup',views.fileup,name="fileup"),
    url(r'^cpu/$', views.getcpu ),
    url(r'^mem/$', views.getmem ),
    # url(r'^ex_template/aa.xlsx$', views.template ),
]
