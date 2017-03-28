from django.conf.urls import url
from views import views


urlpatterns = [
    url(r'^login',views.Login,name="login"),
    url(r'^logout',views.Logout,name="logout"),
    url(r'^index',views.index,name="ops_index"),
    url(r'^service',views.hello,name="hello"),
    url(r'^host_input',views.host_input,name="host_input"),
    url(r'^cpu/$', views.getcpu ),
    url(r'^mem/$', views.getmem ),
    # url(r'^ex_template/aa.xlsx$', views.template ),
]
