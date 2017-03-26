#-*- coding=utf8 -*-
#/usr/bin/python env
import os,sys
from .. import models
from django.http import HttpResponseRedirect,HttpResponse
from django.core.urlresolvers import reverse
from django.shortcuts import render
import simplejson as json
import hashlib
import datetime
import cpu
import mem




# Create your views here.
def Login(request):
     #TODO: 默认头像路径，然后如果用户自己上传了头像 则 user : headimgpath ,发布任务次数，已连接服务器建表,reverse 传值到index视图，login
    #TODO :login只做登录授权认证 以及头像
    if request.method == 'POST':
        global  img,username,usall,hsall,usave,mcont,pub,Topten,Eventen
        img = '../static/img/cd-avatar.png'
        print request.body
        ip = request.META['REMOTE_ADDR']
        username  = request.POST.get('username')
        password = request.POST.get('password')
        print ip,username,password
        #body = json.loads(request.body)
        #username ,password =  body['username'],body['password']
        #if  models.UserInfo.objects.filter(user=username) and  models.UserInfo.objects.filter(pwd=hashlib.md5(password)):
        if  username != None and password != None and  models.UserInfo.objects.filter(user=username) and  models.UserInfo.objects.filter(pwd=password) :
            models.UserInfo.objects.filter(user=username).update(uptime=datetime.datetime.now(),alive=1)
            usall,hsall,usave,mcont,pub = models.UserInfo.objects.count(),models.HostInfo.objects.count(), models.UserInfo.objects.filter(alive=1).count(),0,models.PushCodeEvent.objects.count()
            Topten = []
            Eventen = []
            for Top in models.TopContServer.objects.order_by('-acount')[:10]:
                  Topall = Top.ip,Top.uptime,Top.acount, list(Top.user_id.all())[0]
                  Topten.append(Topall)

            for Event in models.PushCodeEvent.objects.order_by('-ctime')[:10]:
                    Eventall = Event.event,Event.ctime,Event.user_id
                    print Eventall
                    Eventen.append(Eventall)

            #print models.UserLock.objects.filter(ip=ip).count()
            #这里取redis的值，现在的登录的时间 - 锁定的时间  = 0 则解锁 登录 否则继续锁定
            #return HttpResponseRedirect(reverse('index'))
            #还需要更新登录的时间
            #return HttpResponse(json.dumps({"username":username})) #并且返回用户名给ajax 然后get过来的时候带着用户名 渲染用户名变量到模版里
            # return render(request,"index.html",{"user":username,"head":img,"usall":usall,"hsall":hsall,
            #                                     "usave":usave,"mcont":mcont,"pub":pub,"ip":cip,
            #                                     "time":ctime,"num":cacount,"cuser":cuser })
            return render(request,"index.html",{"user":username,"head":img,"usall":usall,"hsall":hsall,
                                                "usave":usave,"mcont":mcont,"pub":pub,"Top":Topten,"Event":Eventen})
        else:
             lock = models.UserLock.objects.create(user=username,ip=ip,uptime=datetime.datetime.now())
             lock.save()
             #记录事件累计错误登录次数然后超过5次之后锁住并且跳转黑屏页面
             print username,password
             result = 'pwd_err'
             return HttpResponseRedirect("/",content='no-user')
    #return HttpResponseRedirect("/",content='no-user')
            #return render(request,'index.html',{'user':request.GET.get('name')})
    return render(request,"index.html",{"user":username,"head":img,"usall":usall,"hsall":hsall,
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
    return HttpResponseRedirect("/")

def hello(request):
    return render(request,'service.html')

def host_input(request):
    Format = []
    if request.method == 'POST':
        for test in  models.HostInfo.objects.all():
            # print test.ip,test.port,test.group,test.user,test.pwd,test.key,test.login_type,test.us_sudo,test.sudo,test.alive
            data = json.dumps({"Ip":test.ip,"Port":test.port,"Group":test.group,"User":test.user,"Pwd":test.pwd,"Key":str(test.key),
                               "lg_type":test.login_type,"US_SUDO":test.us_sudo,"US_SU":test.us_su,"SUDO":test.sudo,"SU":test.su,
                               "Status":test.alive,"bz":test.bz})
            dict = json.loads(data)
            Format.append(dict)
            # DRreturn = json.dumps({"data":Format},{"totals":models.HostInfo.objects.count()})
            DRreturn = json.dumps({"totals":models.HostInfo.objects.count(),"data":Format})
            print DRreturn
        return HttpResponse(DRreturn)

    return render(request,'host_input.html')


