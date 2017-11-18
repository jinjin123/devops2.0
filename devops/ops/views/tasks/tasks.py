from __future__ import absolute_import
from celery import shared_task
from ops.views.ssh_settings import redisip,redisport
from ops.views.ssh import SSH_SSH
import redis,os,sys,json
from ops.models import WebHook,History, Global_Config,Ansible_Playbook_Log,Log_Assets
r = redis.StrictRedis(host=redisip, port=redisport, db=0)

@shared_task
def get_hook_info_execute(callback_token,server,shell,webhook_id):
    server_data = r.lrange("server",0,-1)
    for  _server in server_data:
        server_info  = json.loads(_server)
        if server_info['ip'] == str(server):
                ssh = SSH_SSH()
                ssh.login(**server_info)
                stdout = ssh.execute(shell,'')
                return stdout

@shared_task
def recordAssets(user, content, type, id=None):
    try:
        config = Global_Config.objects.get(id=1)
        if config.assets == 1:
            Log_Assets.objects.create(
                assets_id=id,
                assets_user=user,
                assets_content=content,
                assets_type=type
            )
        return True
    except Exception as e:
        print(e)
        return False

@shared_task
def recordAnsiblePlaybook(user, ans_id, ans_name, ans_content, ans_server=None):
    try:
        config = Global_Config.objects.get(id=1)
        if config.ansible_playbook == 1:
            Ansible_Playbook_Log.objects.create(
                ans_user=user,
                ans_server=ans_server,
                ans_name=ans_name,
                ans_id=ans_id,
                ans_content=ans_content,
            )
        return True
    except Exception as e:
        print(e)
        return False
