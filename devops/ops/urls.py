from django.conf.urls import url
from views import views

urlpatterns = [
    url(r'^$',views.Login,name="login"),
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
    url(r'^filetrans/upload',views.filetrans_upload,name="filetrans_upload"),
    url(r'^fileup',views.fileup,name="fileup"),
    url(r'^filedown',views.filedown,name="filedown"),
    url(r'^filetrans/download',views.remote_download,name="remote_download"),
    url(r'^create_tgz_pack/',views.create_tgz_pack,name="create_tgz_pack"),
    url(r'^my_command_history/',views.my_command_history,name="my_command_history"),
    url(r'^execute_command/',views.execute_command,name="execute_command"),
    url(r'^get_command_result/',views.get_command_result,name="get_command_result"),
    url(r'^cmd',views.command,name="command"),
    url(r'^upload_script',views.upload_script,name="upload_script"),
    url(r'^get_script_content',views.get_script_content,name="get_script_content"),
    url(r'^scripts_list',views.scripts_list,name="scripts_list"),
    url(r'^write_script_content',views.write_script_content,name="write_script_content"),
    url(r'^delete_script',views.delete_script,name="delete_script"),
    url(r'^execute_command',views.execute_command,name="execute_command"),
    url(r'^get_command_result',views.get_command_result,name="get_command_result"),
    url(r'^script_init',views.script_init,name="script_init"),
    url(r'^save_crontab_to_server',views.save_crontab_to_server,name="save_crontab_to_server"),
    url(r'^get_crontab_list',views.get_crontab_list,name="get_crontab_list"),
    url(r'^delete_crontab_list',views.delete_crontab_list,name="delete_crontab_list"),
    url(r'^get_remote_file_list',views.get_remote_file_list,name="get_remote_file_list"),
    url(r'^add_remote_file',views.add_remote_file,name="add_remote_file"),
    url(r'^get_remote_file_opt',views.get_remote_file_opt,name="get_remote_file_opt"),
    url(r'^delete_remote_file_list',views.delete_remote_file_list,name="delete_remote_file_list"),
    url(r'^write_remote_file_opt',views.write_remote_file_opt,name="write_remote_file_opt"),
    url(r'^upload_keyfile/',views.upload_keyfile,name="upload_keyfile"),
    url(r'^delete_keyfile',views.delete_keyfile,name="delete_keyfile"),
    url(r'^show_keyfile_list',views.show_keyfile_list,name="show_keyfile_list"),

    url(r'^docker_repo_list',views.docker_repo,name="docker_repo"),
    url(r'^docker_repo_content',views.docker_repo_list,name="docker_repo_list"),
    url(r'^docker_repo_del',views.docker_repo_del,name="docker_repo_del"),
    url(r'^docker_repo',views.docker,name="docker"),
    url(r'^docker_img',views.docker_img,name="docker_img"),
    url(r'^docker_imagestags',views.docker_imagestags,name="docker_imgtags"),
    url(r'^docker_tagshistory',views.docker_tagshistory),
    url(r'^docker_delimg',views.docker_delimg),
    url(r'^docker_container',views.docker_container),
    url(r'^Container_Node',views.Container_Node),
    url(r'^ContainerNodeList',views.ContainerNodeList),
    url(r'^ContainerDelNode',views.ContainerDelNode),
    url(r'^Container_Ava_Ip',views.Container_Ava_Ip),
    url(r'^Create_Container_Net',views.Create_Container_Net),
    url(r'^Container_Net_range/remove/$',views.Del_Container_Net),

    url(r'^images/$', views.docker_images, name='docker-images-list'),
    url(r'^images/search$', views.search_images, name='search-images'),
    url(r'^images/pull/(?P<uuid_token>[-\w]+)/$', views.docker_pull_image, name='pull-image'),
    url(r'^images/remove/$', views.docker_remove_image, name='removeimage'),

    url(r'^images/launch/(?P<name>.+)/$', views.Create_container_service, name='launch-image'),


    url(r'^checkcontainer',views.container_check,name="container_check"),
    url(r'^Container_Service',views.Load_Container_Service),
    url(r'^Container_Stop',views.Container_Stop),
    url(r'^Container_Start',views.Container_Start),
    url(r'^Container_ReStart',views.Container_ReStart),
    url(r'^Container_Remove',views.Container_Remove),
    url(r'^Container_backup',views.Container_Backup),
    url(r'^Container_play',views.Container_Play),
    # url(r'^Container_status/(?P<container_id>.+)/$', views.Container_status),
    url(r'^Get_Container_backup/$', views.get_container_backup),
    url(r'^Remove_container_backup/$', views.Remove_container_backup),
    url(r'^Get_container_process/$', views.container_top),
    url(r'^Get_container_filediff/$', views.container_filediff),
    url(r'^Container_terminal/$', views.container_terminal),
    url(r'^Container_cpuusage/$', views.get_container_cpu),
    url(r'^Container_mem/$', views.get_container_memusage),
    url(r'^Container_mem_percentage/$', views.get_container_mem_percentage),
    url(r'^Container_net/$', views.get_container_net),
    url(r'^script',views.script,name="script"),
    url(r'^PushCode',views.PushCode,name="PushCode"),
    url(r'^UploadKey',views.UploadKey,name="UploadKey"),
    url(r'^remotefile',views.remotefile,name="remotefile"),
    url(r'^email',views.receive_email),
    url(r'^notify',views.wechat_notify),
    url(r'^new_work_order',views.work_order),
    url(r'^work_order_list',views.work_order_list),
    url(r'^work_Calendar',views.Calendar),
    url(r'^work_Plan',views.Work_plan),
    url(r'^work_plan_list',views.Work_plan_list),
    url(r'^update_work_order_status',views.update_work_order_status),
    url(r'^get_work_plan_list',views.get_work_plan_list),
    url(r'^del_work_plan_ops',views.Del_work_plan_ops),
    url(r'^del_work_order',views.Del_work_order),
    url(r'^save_hook_info',views.Save_hook_info),
    url(r'^get_hook_info',views.Get_hook_info),
    url(r'^del_hook_info',views.Del_hook_info),
    url(r'^work_order_finish_notify',views.work_order_finish_notify),
    url(r'^webhook_callback/(?P<callback_token>[-\w]+)',views.webhook_callback),
    url(r'^get_hook_history',views.hook_history),
    url(r'^crond',views.crond,name="crond"),
    url(r'^easy_module',views.Ansible_easy_module),
    url(r'^cpu/$', views.getcpu ),
    url(r'^mem/$', views.getmem ),
    # url(r'^ex_template/aa.xlsx$', views.template ),
]
