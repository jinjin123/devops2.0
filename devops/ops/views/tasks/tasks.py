from __future__ import absolute_import
from celery import shared_task
from ops.views.ssh_settings import redisip,redisport
from ops.views.ssh import SSH_SSH
import redis,os,sys,json
from ops.models import WebHook,History
# r = redis.StrictRedis(host=redisip, port=redisport, db=0)
r = redis.StrictRedis(host=redisip, port=redisport, db=0)
@shared_task
def add(x, y):
    return x + y



# @shared_task
# def get_hook_info_execute(callback_token,server,shell):
#     server_data =
@shared_task
def get_hook_info_execute(callback_token,server,shell,webhook_id):
# def get_hook_info_execute(server):
    server_data = r.lrange("server",0,-1)
    for  _server in server_data:
        server_info  = json.loads(_server)
        if server_info['ip'] == str(server):
                ssh = SSH_SSH()
                ssh.login(**server_info)
                stdout = ssh.execute(shell,'')
                return stdout

# @shared_task
# def get_hook_info_execute(callback_token,server,shell,webhook_id):
#     server_data = r.lrange("server",0,-1)
#     for  _server in server_data:
#         server_info  = json.loads(_server)
#         if server_info['ip'] == str(server):
#                 ssh = SSH_SSH()
#                 ssh.login(**server_info)
#                 stdout = ssh.execute(shell,'')
#                 return stdout
