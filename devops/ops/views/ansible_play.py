#!/usr/bin/env python
# _#_ coding:utf-8 _*_
#/usr/bin/python env
import os,sys
reload(sys)
sys.setdefaultencoding("utf-8")
import uuid, json,redis,uuid
from django.http import HttpResponseRedirect, JsonResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from ssh_settings import redisip,redisport,upload_dir
from ops.models import HostInfo,Ansible_Model_Log,Ansible_Playbook_Number,Ansible_Playbook
from django.contrib.auth.models import User, Group
from asb_model.ansibleApi import  ANSRunner
from ops.views.return_http import ajax_http
from ops.views.data.DsRedisOps import DsRedis
from tasks import tasks

r = redis.StrictRedis(host=redisip, port=redisport, db=0)


@login_required()
def ansible_run(request):
    if request.method == "POST":
        redisKey = json.loads(request.body)['ans_uuid']
        msg = r.rpop(redisKey)
        if msg:return JsonResponse({'msg':str(msg),"code":200,'data':[]})
        else:return JsonResponse({'msg':None,"code":200,'data':[]})

@login_required()
def ansible_model(request):
    if request.method == "GET":
        return render(request,'easy_module.html',{"user":request.user,"ans_uuid":uuid.uuid4()})
    elif  request.method == "POST" :
        resource = []
        sList = []
        data = json.loads(request.body)
        serverList =  data['host']
        for server in serverList:
            server_assets = HostInfo.objects.get(ip=server)
            sList.append(server_assets.ip)
            if server_assets.login_type == "秘钥方式":resource.append({"hostname": server_assets.ip, "port": int(server_assets.port)})
            else:resource.append({"hostname": server_assets.ip, "port": int(server_assets.port),"username": server_assets.user,"password": server_assets.pwd})

        if data['custom_model'] != '':model_name = data['custom_model']
        else:model_name = data['module']
        redisKey = data['ans_uuid']
        logId = Ansible_Model_Log.objects.create(ans_user=str(request.user),ans_model=model_name,ans_server=','.join(sList),ans_args=request.POST.get('args',None))
        r.delete(redisKey)
        r.lpush(redisKey, "[Start] Ansible Model: {model}  ARGS:{args}".format(model=model_name,args=data['args']))
        ANS = ANSRunner(resource,redisKey,logId)
        aa = ANS.run_model(host_list=sList,module_name=model_name,module_args=data['args'])
        r.lpush(redisKey, "[Done] Ansible Done.")
        return JsonResponse({'msg':"操作成功","code":200,'data':[]})


@login_required()
@ajax_http
def ansible_playbook_add(request):
    if request.method == "POST":
        status = {"status": 'success'}
        data = json.loads(request.POST.get('post_data'))
        if not data.has_key('update_tag'):
            try:
                playbook = Ansible_Playbook.objects.create(
                    playbook_name=data['playbook_name'],
                    playbook_desc=data['playbook_desc'],
                    playbook_vars=data['playbook_vars'],
                    playbook_uuid=uuid.uuid4(),
                    playbook_file=request.FILES.get('playbook_file'),
                    playbook_auth_group=data['playbook_auth_group'],
                    playbook_auth_user=data['playbook_auth_user'],
                )
            except Exception as e:
                status['status'] = str(e)
                return  status
            sList = []
            try:
                for server in data['host']:
                    server = HostInfo.objects.get(ip=server)
                    sList.append(server.ip)
                    Ansible_Playbook_Number.objects.create(playbook=playbook, playbook_server=server.ip)
            except Exception as e:
                playbook.delete()
                status['status'] = str(e)
                return  status
            tasks.recordAnsiblePlaybook.delay(user=str(request.user), ans_id=playbook.id, ans_name=playbook.playbook_name,
                                        ans_content="添加Ansible剧本", ans_server=','.join(sList))
            return status
        else:
            tag = data['update_tag']
            try:
                playbook = Ansible_Playbook.objects.get(id=tag)
                numberList = Ansible_Playbook_Number.objects.filter(playbook_id=playbook)
            except:
                status['status'] = '剧本不存在，可能已经被删除'
                return status
            try:
                Data = {
                    'playbook_name':data['playbook_name'],
                    'playbook_desc':data['playbook_desc'],
                    'playbook_vars':data['playbook_vars'],
                    # 'playbook_file': request.FILES.get('playbook_file'),
                    'playbook_auth_group':data['playbook_auth_group'],
                    'playbook_auth_user':data['playbook_auth_user']
                }
                Ansible_Playbook.objects.filter(id=tag).update(**Data)
            except Exception as e:
                status['status'] = "剧本修改错误"
                return  status
            tagret_server_list = [s.playbook_server for s in numberList]
            postServerList = []
            if data['host'] != "" or not None:
                for sid in data['host']:
                    try:
                        server = HostInfo.objects.get(ip=sid)
                        postServerList.append(server.ip)
                        if server.ip not in tagret_server_list:
                            Ansible_Playbook_Number.objects.create(playbook=playbook, playbook_server=server.ip)
                    except Exception as e:
                        status['status'] = '目标服务器信息修改错误：'
                        return status
                            # 清除目标主机 -
                delList = list(set(tagret_server_list).difference(set(postServerList)))
                for ip in delList:
                    Ansible_Playbook_Number.objects.filter(playbook=playbook, playbook_server=ip).delete()
            # else:
                ##前端已限制必填server
                # for server in numberList:
                #     Ansible_Playbook_Number.objects.filter(playbook=playbook,
                #                                            playbook_server=server.playbook_server).delete()
                    # 操作日志异步记录
            tasks.recordAnsiblePlaybook.delay(user=str(request.user), ans_id=tag, ans_name=data['playbook_name'],
                                        ans_content="修改Ansible剧本", ans_server=None)
            return status

@login_required()
def ansible_playbook_file(request, pid):
    try:
        playbook = Ansible_Playbook.objects.get(id=pid)
    except:
        return JsonResponse({'msg': "剧本不存在，可能已经被删除.", "code": 200, 'data': []})
    if request.method == "POST":
        playbook_file = upload_dir + '/' + str(playbook.playbook_file)
        if os.path.exists(playbook_file):
            content = ''
            with open(playbook_file, "r") as f:
                for line in f.readlines():
                    content = content + line
            return JsonResponse({'msg': "剧本获取成功", "code": 200, 'data': content})
        else:
            return JsonResponse({'msg': "剧本不存在，可能已经被删除.", "code": 500, 'data': []})

@login_required()
# @ajax_http
def ansible_playbook_run(request, pid):
    # status = {"status": "success","content":""}
    try:
        playbook = Ansible_Playbook.objects.get(id=pid)
        numberList = Ansible_Playbook_Number.objects.filter(playbook_id=playbook)
        if numberList:
            serverList = []
        else:
            serverList = HostInfo.objects.all()
    except:
        return JsonResponse({'msg':'faild'})
        # status['status'] = "faild"
        # status['content'] = "剧本不存在，可能已经被删除."
    if request.method == "POST":
        data = json.loads(request.body)
        if not DsRedis.OpsAnsiblePlayBookLock.get(redisKey=playbook.playbook_uuid + '-locked') :  # 判断剧本是否有人在执行
            # 加上剧本执行锁
            DsRedis.OpsAnsiblePlayBookLock.set(redisKey=playbook.playbook_uuid + '-locked', value=request.user)
            # 删除旧的执行消息
            DsRedis.OpsAnsiblePlayBook.delete(playbook.playbook_uuid)
            playbook_file = upload_dir + '/' + str(playbook.playbook_file)
            sList = []
            resource = []
            if numberList:
                serverList = [s.playbook_server for s in numberList]
            else:
                serverList = data['host']
            for server in serverList:
                server_assets = HostInfo.objects.get(ip=server)
                sList.append(server_assets.ip)
                if server_assets.login_type == "秘钥方式":
                    resource.append({"hostname": server_assets.ip, "port": int(server_assets.port)})
                else:
                    resource.append({"hostname": server_assets.ip, "port": int(server_assets.port),
                                     "username": server_assets.user, "password": server_assets.pwd})
            ###用已有的,没有就用后面提交的
            if playbook.playbook_vars:
                playbook_vars = playbook.playbook_vars
            else:
                playbook_vars = data['vars']
            try:
                if len(playbook_vars) == 0:
                    playbook_vars = dict()
                else:
                    playbook_vars = json.loads(data['vars'])
                playbook_vars['host'] = sList
            except Exception as e:
                DsRedis.OpsAnsiblePlayBookLock.delete(redisKey=playbook.playbook_uuid + '-locked')
                return JsonResponse({'msg': "剧本外部变量不是Json格式", "code": 500, 'data': []})
            # 执行ansible playbook
            ANS = ANSRunner(resource, redisKey=playbook.playbook_uuid)
            ANS.run_playbook(host_list=sList, playbook_path=playbook_file, extra_vars=playbook_vars)
            # 获取结果
            result = ANS.get_playbook_result()
            dataList = []
            statPer = {
                "unreachable": 0,
                "skipped": 0,
                "changed": 0,
                "ok": 0,
                "failed": 0
            }
            for k, v in result.get('status').items():
                v['host'] = k
                if v.get('failed') > 0 or v.get('unreachable') > 0:
                    v['result'] = 'Failed'
                else:
                    v['result'] = 'Succeed'
                dataList.append(v)
                statPer['unreachable'] = v['unreachable'] + statPer['unreachable']
                statPer['skipped'] = v['skipped'] + statPer['skipped']
                statPer['changed'] = v['changed'] + statPer['changed']
                statPer['failed'] = v['failed'] + statPer['failed']
                statPer['ok'] = v['ok'] + statPer['ok']
            DsRedis.OpsAnsiblePlayBook.lpush(playbook.playbook_uuid, "[Done] Ansible Done.")
            # 切换版本之后取消项目部署锁
            DsRedis.OpsAnsiblePlayBookLock.delete(redisKey=playbook.playbook_uuid + '-locked')
            # 操作日志异步记录
            tasks.recordAnsiblePlaybook.delay(user=str(request.user), ans_id=playbook.id, ans_name=playbook.playbook_name,
                                        ans_content="执行Ansible剧本", ans_server=','.join(sList))
            return JsonResponse({'msg': "操作成功", "code": 200, 'data': dataList, "statPer": statPer})
        else:
            return JsonResponse({'msg': "剧本执行失败，{user}正在执行该剧本".format(
                user=DsRedis.OpsAnsiblePlayBookLock.get(playbook.playbook_uuid + '-locked')), "code": 500, 'data': []})
