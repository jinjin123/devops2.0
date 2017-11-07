#!/usr/bin/env python
# _#_ coding:utf-8 _*_
import uuid, os, json,redis
from django.http import HttpResponseRedirect, JsonResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from ssh_settings import redisip,redisport
from ops.models import HostInfo,Ansible_Model_Log
from asb_model.ansibleApi import  ANSRunner

r = redis.StrictRedis(host=redisip, port=redisport, db=0)


@login_required()
def ansible_run(request):
    if request.method == "POST":
        redisKey = json.loads(request.body)['ans_uuid']
        print redisKey
        msg = r.rpop(redisKey)
        print msg
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
        print redisKey
        #操作日志异步记录
#         redisKey = base.makeToken(strs=str(request.user)+"ansible_model")
        logId = Ansible_Model_Log.objects.create(ans_user=str(request.user),ans_model=model_name,ans_server=','.join(sList),ans_args=request.POST.get('args',None))
        r.delete(redisKey)
        r.lpush(redisKey, "[Start] Ansible Model: {model}  ARGS:{args}".format(model=model_name,args=data['args']))
        ANS = ANSRunner(resource,redisKey,logId)
        aa = ANS.run_model(host_list=sList,module_name=model_name,module_args=data['args'])
        print aa
        r.lpush(redisKey, "[Done] Ansible Done.")
        return JsonResponse({'msg':"操作成功","code":200,'data':[]})
