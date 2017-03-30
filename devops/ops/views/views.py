#-*- coding=utf8 -*-
#/usr/bin/python env
import os,sys
reload(sys)
sys.setdefaultencoding("utf-8")
from django.http import HttpResponseRedirect,HttpResponse,request
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
img = '../static/img/cd-avatar.png'
global  img

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
            models.UserInfo.objects.filter(user=username).update(uptime=datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),alive=1)
            request.session['username'] = username
            return  HttpResponseRedirect(reverse('ops_index'))

        else:
            #block the error ip
            r.lpush("lock",ip)
            models.UserLock.objects.create(user=username, ip=ip, uptime=datetime.datetime.now())
            if r.lrange("lock",0,1000).count(ip) >5:
                models.UserLock.objects.update(user=username, ip=ip, uptime=datetime.datetime.now(), status=0)
                response = HttpResponseRedirect('/')
                response.delete_cookie('sessionid')
                return response
            response = HttpResponseRedirect('/')
            response.delete_cookie('sessionid')
            return response
    return HttpResponseRedirect("/")

def index(request):
    img = '../static/img/cd-avatar.png'
    username = list(models.UserInfo.objects.order_by('-uptime'))[0]
    usall, hsall, usave, mcont, pub = models.UserInfo.objects.count(), models.HostInfo.objects.count(), models.UserInfo.objects.filter(
        alive=1).count(), 0, models.PushCodeEvent.objects.count()
    Topten = []
    Eventen = []
    for Top in models.TopContServer.objects.order_by('-acount')[:10]:
        Topall = Top.ip, Top.uptime, Top.acount, list(Top.user_id.all())[0]
        Topten.append(Topall)

    for Event in models.PushCodeEvent.objects.order_by('-ctime')[:10]:
        Eventall = Event.event, Event.ctime, Event.user_id
        Eventen.append(Eventall)

    if request.session.get('username') == None:
        return HttpResponseRedirect('/')
    else:
         return render(request, "index.html", {"user": username, "head": img, "usall": usall, "hsall": hsall,
                                              "usave": usave, "mcont": mcont, "pub": pub, "Top": Topten, "Event": Eventen})



def Logout(request):
    response = HttpResponseRedirect('/')
    response.delete_cookie('sessionid')
    return response

def getmem(request):
    memdata = mem.MemData()
    result = json.dumps(memdata.get_data())
    return HttpResponse(result)

def getcpu(request):
    cpudata = cpu.CpuData()
    result = json.dumps(cpudata.compute_data())
    return HttpResponse(result)


def hello(request):
    return render(request,'service.html')

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
            # print DRreturn
        return HttpResponse(DRreturn)

    return render(request,'host_input.html',{"user":request.session.get('username'),"head":img})


#TODO: return server status   to upgrade  server status,  单个添加完成的时候 也需要传ID
def add_server_list(request):
    if request.method=='POST':
        try:
            StringBody = request.body
            dict = eval(StringBody)

            # print dict['ip']
            # print type(StringBody)
            ip = dict['ip']
            port = dict['port']
            group = dict['group']
            user = dict['user']
            pwd = dict['password']
            login_type = dict['lg_type']
            key = dict['key']
            us_sudo = dict['us_sudo']
            us_su = dict['us_su']
            sudo = dict['sudoPassword']
            su = dict['suPassword']
            alive = dict['status']
            bz = dict['BZ']
            id = dict['id']
            data = {
                "ip": ip,
                "port": port,
                "group": group,
                "user": user,
                "lg_type": login_type,
                "key": key,
                "pwd": pwd,
                "us_sudo": us_sudo,
                "us_su": us_su,
                "sudo": sudo,
                "su": su,
                "status": 0,
                "bz": bz,
                "id": id,
            }
            print data
            r.lpush("server",StringBody)
            r.hset(id,'server',data)

            models.HostInfo.objects.create(ip=dict['ip'],port=dict['port'],group=dict['group'],
                                           user=dict['user'],pwd=dict['password'],login_type=dict['lg_type'],
                                           key=dict['key'],us_sudo=dict['us_sudo'],us_su=dict['us_su'],sudo=dict['sudoPassword'],
                                           su=dict['suPassword'],alive=dict['status'],bz=dict['BZ'])
        except Exception,e:
            print e
        return  HttpResponse(status=200)


# matching id  to delete server
def del_server_list(request):
    if request.method=='POST':
        try:
            content = json.loads(request.body)
            print content
            print content['ip']
            id =  content['id']
            # print content['id']
            try:
                r.hdel(id)
                models.HostInfo.objects.filter(ip=content['ip']).delete()
            except Exception,e:
                print e

            return  HttpResponse(satus=200)
        except:
            return  HttpResponse('error')


def load_server_list(request):
    content = {"content":[]}
    try:
        # for ServerInfo in models.HostInfo.objects.all():
        server_list = r.lrange("server",0,-1)
        if server_list is None:
            content['content']=[]
        else:
            # print server_list  # dict
            for _line in server_list:
                # print _line
                lines = json.loads(_line)
                content['content'].append(lines)
                # print server  # obj
    except Exception,e:
        print e
    Content = json.dumps(content)
    print Content
    # print type(Content)
    return  HttpResponse(Content)



def fileup(request):
    return  render(request,'fileup.html',{"user":request.session.get('username'),"head":img})

