#-*- coding=utf8 -*-
#/usr/bin/python env
import os,sys
from django.http import HttpResponseRedirect,HttpResponse
from django.core.urlresolvers import reverse
from django.shortcuts import render
from django.contrib.auth.decorators import  login_required
from django.contrib.auth import logout
from django.core.cache import cache
from .. import  models
import simplejson as json
import hashlib
import datetime
import redis
import cpu,mem

r = redis.StrictRedis(host='192.168.1.101', port='6379', db=0)


# Create your views here.
def Login(request):
     #TODO: 默认头像路径，然后如果用户自己上传了头像 则 user : headimgpath ,发布任务次数，已连接服务器建表,reverse 传值到index视图，login
    #TODO :login只做登录授权认证 以及头像
    if request.method == 'POST':
        img = '../static/img/cd-avatar.png'
        ip = request.META['REMOTE_ADDR']
        username  = request.POST.get('username')
        password = request.POST.get('password')
        # print ip,username,password
        if  models.UserInfo.objects.filter(user=username) and  models.UserInfo.objects.filter(pwd=password) and models.UserLock.objects.filter(ip=ip,status=1) :
            models.UserInfo.objects.filter(user=username).update(uptime=datetime.datetime.now(),alive=1)
            return  HttpResponseRedirect(reverse('ops_index'))

        else:
            #block the error ip
            r.lpush("lock",ip)
            models.UserLock.objects.create(user=username, ip=ip, uptime=datetime.datetime.now())
            if r.lrange("lock",0,1000).count(ip) >5:
                models.UserLock.objects.update(user=username, ip=ip, uptime=datetime.datetime.now(), status=0)
                return HttpResponseRedirect("/")
            return HttpResponseRedirect("/")
    return HttpResponseRedirect("/")


def index(request):
    img = '../static/img/cd-avatar.png'
    usall, hsall, usave, mcont, pub = models.UserInfo.objects.count(), models.HostInfo.objects.count(), models.UserInfo.objects.filter(alive=1).count(), 0, models.PushCodeEvent.objects.count()
    Topten = []
    Eventen = []
    for Top in models.TopContServer.objects.order_by('-acount')[:10]:
          Topall = Top.ip,Top.uptime,Top.acount, list(Top.user_id.all())[0]
          Topten.append(Topall)

    for Event in models.PushCodeEvent.objects.order_by('-ctime')[:10]:
            Eventall = Event.event,Event.ctime,Event.user_id
            Eventen.append(Eventall)
    return render(request, "index.html", {"user": username, "head": img, "usall": usall, "hsall": hsall,
                                            "usave":usave,"mcont":mcont,"pub":pub,"Top":Topten,"Event":Eventen})

def getmem(request):
    memdata = mem.MemData()
    result = json.dumps(memdata.get_data())
    return HttpResponse(result)

def getcpu(request):
    cpudata = cpu.CpuData()
    result = json.dumps(cpudata.compute_data())
    return HttpResponse(result)

def logout(request):
    logout(request)

def hello(request):
    return render(request,'service.html')

@login_required(login_url='/')
def host_input(request):
    Format = []
    if request.method == 'POST':
        for test in  models.HostInfo.objects.all():
            data = json.dumps({"Ip":test.ip,"Port":test.port,"Group":test.group,"User":test.user,"Pwd":test.pwd,"Key":str(test.key),
                               "lg_type":test.login_type,"US_SUDO":test.us_sudo,"US_SU":test.us_su,"SUDO":test.sudo,"SU":test.su,
                               "Status":test.alive,"bz":test.bz})
            dict = json.loads(data)
            Format.append(dict)
            # DRreturn = json.dumps({"data":Format},{"totals":models.HostInfo.objects.count()})
            DRreturn = json.dumps({"totals":models.HostInfo.objects.count(),"data":Format})
            print DRreturn
        return HttpResponse(DRreturn)

    #return render(request,'host_input.html',{"key":11})
    return render(request,'host_input.html')

