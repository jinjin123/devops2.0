#-*- coding=utf8 -*-
#/usr/bin/python env
import os,sys,logging
reload(sys)
sys.setdefaultencoding("utf-8")
logger = logging.getLogger('django')
from django.http import HttpResponseRedirect,HttpResponse,request,JsonResponse,StreamingHttpResponse
from django.core.urlresolvers import reverse
from django.shortcuts import render,render_to_response
from django.contrib.auth.decorators import  login_required
from django.contrib.auth import authenticate,logout,login
from django.contrib.auth.models import User,Group
from django.core.cache import cache
from django.core import serializers
from .. import ssh_settings
# from .. import  models
from ops.models import Ansible_Playbook,Ansible_Playbook_Number,UserLock,TopContServer,PushCodeEvent,HostInfo,WebHook,History,UserInfo,Global_Config,Assets
from ssh_file_transfer import  SSHFileTransfer
from ssh_thread_queue import  SSHThreadAdmin
from return_http import  ajax_http
from ssh_error import  SSHError
from client_info import  resolv_client
from ssh_file import File
from ssh_script import SSHScript
from crontab_controler import  SSHCrontabControler
from remote_file import  RemoteFile
from requests.auth import HTTPBasicAuth
from docker_img_show import Docker_registry
from devops.settings  import DOCKER_API_PORT,HOST_IP_ADDR,BASE_DIR,MEDIA_ROOT
from utils import  ImageMixin,ContainerMixin,EmailMinxin
from django.views.decorators.http import condition
from socket import socket
from ssh_check import SSHCheck
from tasks import tasks
from wechat_notify import WeiXin
from  dwebsocket.decorators import accept_websocket,require_websocket
import ssh_module_controller,threading,cpu,mem,hashlib,datetime,redis,random,commands,time,requests,subprocess
import simplejson as json
import re,uuid,StringUtil
from django.views.decorators.csrf import csrf_exempt
from excel import handle_excel_file
from  ops.views.zabbix import zabbix
# import xlrd,xlwt

r = redis.StrictRedis(host=ssh_settings.redisip, port=ssh_settings.redisport, db=0)
# img = '../static/img/cd-avatar.png'
# global  img

def Login(request):
     #TODO: 默认头像路径，然后如果用户自己上传了头像 则 user : headimgpath ,发布任务次数，已连接服务器建表,reverse 传值到index视图，login
    #TODO :login只做登录授权认证 以及头像
    if request.method == 'POST':
        # img = '../static/img/cd-avatar.png'
        ip = request.META['REMOTE_ADDR']
        username  = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(username=username, password=password)
        # print user,'48'
        # if user is not None and user.is_active and models.UserLock.objects.filter(ip=ip,status=0):
        if user is not None and user.is_active :
             login(request,user)
             request.session['user'] = username
             # return HttpResponseRedirect("/ops/index")
            #  return HttpResponseRedirect("http://localhost:8080/index")
             return  HttpResponseRedirect(reverse('ops_index'))

        else:
            #block the error ip
            r.lpush("lock",ip)
            UserLock.objects.create(user=username, ip=ip, uptime=time.strftime('%Y-%m-%d %H:%M:%S'), status=0)
            if r.lrange("lock",0,-1).count(ip) >5:
                UserLock.objects.update(user=username, ip=ip, uptime=time.strftime('%Y-%m-%d %H:%M:%S'), status=1)
                response = HttpResponseRedirect('/')
                response.delete_cookie('sessionid')
                return response
            response = HttpResponseRedirect('/')
            response.delete_cookie('sessionid')
            return response
    else:
        return render(request,"login.html",{"user":request.user})
    # return HttpResponseRedirect("/")


@login_required(login_url='/')
def index(request):
    img =  'media/' + str(request.user.head_img)
    # username = list(models.UserInfo.objects.order_by('-uptime'))[0]
    username = request.user
    usall, hsall, usave, mcont, pub = UserInfo.objects.count(), HostInfo.objects.count(), UserInfo.objects.filter(
        is_active=1).count(), 0, PushCodeEvent.objects.count()
    Topten = []
    Eventen = []
    for Top in TopContServer.objects.order_by('-acount')[:10]:
        Topall = Top.ip, Top.uptime, Top.acount, list(Top.user_id.all())[0]
        Topten.append(Topall)

    for Event in PushCodeEvent.objects.order_by('-ctime')[:10]:
        Eventall = Event.event, Event.ctime, Event.user_id
        Eventen.append(Eventall)

    return render(request, "index.html", {"user": username, "head": img, "usall": usall, "hsall": hsall,
                                              "usave": usave, "mcont": mcont, "pub": pub, "Top": Topten, "Event": Eventen})



def Logout(request):
    logout(request)
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

@login_required(login_url='/')
# @ajax_http
def host_input(request):
    img =  'media/' + str(request.user.head_img)
    Format = []
    if request.method == 'POST':
        for t in  HostInfo.objects.all():
            ### 资产添加那边有点冲突 需要判断
            if t.alive is not None:
                data = json.dumps({"Ip":t.ip,"Port":t.port,"Group":t.group,"User":t.user,"Pwd":t.pwd,"Key":str(t.key),
                                "lg_type":t.login_type,"US_SUDO":t.us_sudo,"US_SU":t.us_su,"SUDO":t.sudo,"SU":t.su,
                                "Status":t.alive,"bz":t.bz,"id":t.id})
            else:
                continue
            dict = json.loads(data)
            Format.append(dict)
        DRreturn = json.dumps({"totals":HostInfo.objects.count(),"data":Format})
        # print DRreturn
        return HttpResponse(DRreturn)

    return render(request,'host_input.html',{"user":request.user,"head":img})


"""
    push cache db first and start ssh check with login status then  del  old one line and update status into the server config to new one,
    为了加入status 检测状态 不得不加TAG 判断表单提交的TAG  是添加 还是更新 ，如果不加TAG 将重复添加数据到cache db里面
"""
@login_required(login_url='/')
# @ajax_http
def add_server_list(request):
    if request.method=='POST':
        try:
            StringBody = request.body
            dict = json.loads(StringBody)
            if dict["opt_tag"] == "ADD":
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
                bz = dict['BZ']
                Id = dict['id']
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
                    "status": '',
                    "bz": bz,
                    "id": Id
                }
                print  data
                r.lpush("server",json.dumps(data))
                server_line = r.lrange("server",0,-1)
                server_status = ssh_check(ip)
                for _server in server_line:
                    server = json.loads(_server)
                    if ip == server["ip"]:
                        try:
                            r.lrem("server",0,_server)
                            server["status"]=server_status
                            r.lpush("server",json.dumps(server))
                        except Exception as e:
                            logging.error(e)

                assets = {
                    "assets_type": 'server',
                    "name":'N',
                    "sn": 'N',
                    "buy_time": time.strftime("%Y-%m-%d",time.localtime()),
                    "expire_date": time.strftime("%Y-%m-%d",time.localtime()),
                    "buy_user": 'N',
                    "management_ip": 'N',
                    "manufacturer": 'N',
                    "model": 'N',
                    "provider": 'N',
                    "status": 0,
                    "put_zone": 0,
                    "group": 0,
                    "business":0
                }

                assets_obj = Assets.objects.create(**assets)
                # data['assets'] = assets_obj
                HostInfo.objects.create(ip=ip,port=port,group=group,
                                               user=user,pwd=pwd,login_type=login_type,
                                               key=key,us_sudo=us_sudo,us_su=us_su,sudo=sudo,
                                               su=su,alive=server_status,bz=bz,assets=assets_obj)
            else:
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
                bz = dict['BZ']
                Id = dict['id']
                server_status = ssh_check(ip)
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
                    "status": server_status,
                    "bz": bz,
                    "id": Id
                }
                server_line = r.lrange("server",0,-1)
                for _server in server_line:
                    server = json.loads(_server)
                    if ip == server["ip"]:
                        try:
                            r.lrem("server",0,_server)
                            r.lpush("server",json.dumps(data))
                        except Exception as e:
                            print str(e)

                ####can not use  object.all ,because the primary key limit
                HostInfo.objects.filter(ip=ip).update(ip=ip,port=port,group=group,
                                               user=user,pwd=pwd,login_type=login_type,
                                               key=key,us_sudo=us_sudo,us_su=us_su,sudo=sudo,
                                               su=su,alive=server_status,bz=bz)
        except Exception,e:
            logging.error(e)
        return  HttpResponse(status=200)

def ssh_check(ip):
    ssh=SSHCheck(ip)
    ssh.run()
    status=r.get("server.status.%s"%ip)
    if status is None:
        status = {
            "ip":ip,
            "status":"checking",
            "content":"检查中",
            "time":time.strftime("%Y-%m-%d %H:%M:%S",time.localtime()),
        }
        status = json.dumps(status)
    else:
        status = json.dumps(status)
    return status

def interval_check_ssh():
    for t in  HostInfo.objects.all():
        if t.user is not None:
            server_status = ssh_check(t.ip)
            t.alive = server_status
            t.save()


# matching id  to delete server
@login_required(login_url='/')
@ajax_http
def del_server_list(request):
    if request.method=='POST':
        try:
            content = json.loads(request.body)
            print content
            print content['ip']
            IP =  content['ip']
            try:
                HostInfo.objects.filter(ip=content['ip']).delete()
                server_list = r.lrange("server",0,-1)
                for _line in server_list:
                    print _line
                    lines = json.loads(_line)
                    if IP == lines['ip']:
                        r.lrem("server",0,_line)
            except Exception,e:
                print e
        except Exception,e:
            print e

@csrf_exempt
@login_required()
@ajax_http
def handle_excel(request):
    ssh_info = {"status": True, "content": ""}
    if request.method == "POST":
        filename = str(request.FILES.get("file"))
        file_content = request.FILES.get('file').read()
        _dir = os.path.join(ssh_settings.upload_dir + '/server_excel/')
        if not os.path.isdir(_dir):
            os.mkdir(_dir)
        dfile = os.path.join(_dir, filename)
        with open(dfile.encode('utf8'), "wb") as f:
            f.write(file_content)
        handle_excel_file(dfile)



###load all server config
@login_required(login_url='/')
def load_server_list(request):
    content = {"content":[]}
    try:
        server_list = r.lrange("server",0,-1)
        if server_list is None:
            content['content']=[]
        else:
            for _line in server_list:
                lines = json.loads(_line)
                content['content'].append(lines)
    except Exception,e:
        print e
    Content = json.dumps(content)
    return  HttpResponse(Content)

##receive  upload file to save upload dir
@login_required(login_url='/')
@ajax_http
def upload_file_test(request):
    ssh_info = {"status": True, "content": ""}
    fid = str(random.randint(90000000000000000000, 99999999999999999999))
    if request.method == "POST":
        filename = str(request.FILES.get("file"))
        file_content = request.FILES.get('file').read()
        _dir = os.path.join(ssh_settings.upload_dir)
        if not os.path.isdir(_dir):
            os.mkdir(_dir)
        dfile = os.path.join(_dir, filename)
        with open(dfile.encode('utf8'), "wb") as f:
            f.write(file_content)
    return  ssh_info

#transfer file to remote server and return progress_id
@login_required(login_url='/')
@ajax_http
def filetrans_upload(request):
    tid = str(random.randint(90000000000000000000, 99999999999999999999))
    ssh_info = {"status": False, "content": ""}
    data = {"tid": tid, "progress": 0, "content": "", "status": True}
    try:
        parameters = request.GET.get('parameters')
        try:
            parameters = json.loads(parameters)
            print type(parameters["ip"])
        except Exception, e:
            raise Exception(e)

        r.set("progress.%s" % tid, json.dumps(data, encoding="utf8", ensure_ascii=False))
        if not parameters.has_key("sfile") or not parameters.has_key("dfile"): raise  ('aaaa not keys')
        sfile = os.path.join(ssh_settings.upload_dir, os.path.basename(parameters["sfile"]))
        dfile = parameters["dfile"]
        if not type(parameters) == type({}): raise Exception ('type error')
        host = ssh_module_controller.SSHControler().convert_id_to_ip(parameters["ip"])
        if  host["status"] == 'False': raise Exception( host["content"])
        host = host['content']
        print host
        sftp = SSHFileTransfer()
        login = sftp.login(**host)
        if not login["status"] : raise Exception(login["content"])
        t = threading.Thread(target=sftp.upload, args=(sfile,dfile, tid))
        t.start()
        ssh_info["status"] = True
        ssh_info["content"] = tid
        ###different system  paramiko module   return different  infomation about  event

    except Exception, e:
        ssh_info["status"] = False
        ssh_info['content'] = str(e)
    return ssh_info

###return  progress_Id
@login_required(login_url='/')
@ajax_http
def get_filetrans_progress(request):
    tid = request.GET.get("tid")
    ssh_info = SSHFileTransfer().get_progress(tid)
    return ssh_info

###remote download file
@login_required(login_url='/')
@ajax_http
def remote_download(request):
    tid = str(random.randint(90000000000000000000, 99999999999999999999))
    ssh_info = {"status": False, "content": ""}
    try:
        parameters = request.GET.get('parameters')

        try:
            parameters = json.loads(parameters)
        except Exception, e:
            raise Exception(e)
        if not type(parameters) == type({}): raise Exception("not parameter args")

        data = {"tid": tid, "progress": 0, "content": "", "status": True}
        r.set("progress.%s" % tid, json.dumps(data, encoding="utf8", ensure_ascii=False))

        if not parameters.has_key("sfile"): raise Exception("no such sfile")
        sfile = parameters["sfile"]
        host = ssh_module_controller.SSHControler().convert_id_to_ip(parameters["ip"])
        if not host["status"]: raise Exception(host['content'])
        host = host['content']
        ip = host["ip"]
        dfile_name = "{ip}.{tid}.{filename}".format(ip=ip, tid=tid,
                                                       filename=os.path.basename(parameters["sfile"]))
        dfile_full_path = os.path.join(ssh_settings.download_dir, dfile_name)
        sftp = SSHFileTransfer()
        login = sftp.login(**host)
        if not login["status"]: raise Exception(login["content"])
        t = threading.Thread(target=sftp.download, args=(sfile, dfile_full_path, tid))
        t.start()

        ssh_info["status"] = True
        ssh_info["tid"] = tid
        ssh_info["filename"] = dfile_name
    except Exception, e:
        ssh_info["status"] = False
        ssh_info["content"] = str(e)
    print type(ssh_info)
    return ssh_info

##zip download file to pc
@login_required(login_url='/')
@ajax_http
def create_tgz_pack(request):
    tid = str(random.randint(90000000000000000000, 99999999999999999999))
    ssh_info = {"status": False, "content": ""}
    try:
        files = request.GET.get("files")
        try:
            files = json.loads(files)
        except Exception, e:
            raise Exception(e)
        if not type(files) == type([]): raise Exception("not file")

        os.chdir(ssh_settings.download_dir)
        filename = "%s.tgz" % tid
        cmd = "tar zcvf {filename} {files}".format(filename=filename, files=" ".join(files))
        data = commands.getstatusoutput(cmd)
        if data[0]:
            raise Exception("打包失败", data[1])
        else:
            server_head = request.META['HTTP_HOST']
            url = os.path.join(ssh_settings.download_file_url, filename)
            full_url = "http://{server_head}{url}".format(server_head=server_head, url=url)
            ssh_info["content"] = full_url
        ssh_info["status"] = True
    except Exception, e:
        ssh_info["status"] = False
        ssh_info["content"] = str(e)
    return ssh_info

### run commands
@login_required(login_url='/')
@ajax_http
def execute_command(request):
        ssh_info = {"status": False, 'content': ""}
        try:
            id = str(random.randint(90000000000000000000, 99999999999999999999))
            parameter = request.POST.get("parameters") or request.GET.get("parameters")
            if not parameter:
                raise Exception("not parameter")
            try:
                parameter = json.loads(parameter)
            except:
                raise Exception("json parameter error")
            try:
                servers = parameter["servers"]
                cmd = parameter["cmd"]
            except:
                raise Exception("not servers and cmd args")
            parameter["tid"] = id
            SSHThread = SSHThreadAdmin()
            SSHThread.run(parameter)
            client_info = resolv_client(request)
            client_info["cmd"] = cmd
            client_info = dict(client_info, **parameter)
            init_status = {"content": "", "status": False, "stage": "running"}  # stage为running或者done,
            client_info = dict(client_info, **init_status)
            servers = client_info["servers"]
            _ip = []
            for ip in servers:
                try:
                    host_list = ssh_module_controller.SSHControler().convert_id_to_ip(ip)
                    _ip.append(host_list)
                except Exception, e:
                    pass
            client_info["ip"] = _ip
            client_info = json.dumps(client_info, encoding="utf8", ensure_ascii=False)

            r.rpush('command.history', client_info)
            ssh_info["content"] = id
            ssh_info["status"] = True
        except Exception, e:
            ssh_info["status"] = False
            ssh_info["content"] = str(e)
        return ssh_info

## get the command results
@login_required(login_url='/')
@ajax_http
def get_command_result(request):
        ssh_info = {"content": {"content": "", "stage": "running", "status": None}, "status": True, "progress": 0}
        tid = request.GET.get("tid")
        ip = request.GET.get("ip")
        content = ""
        try:
            total = r.get("total.%s" % tid)
            current = r.get("current.%s" % tid)
            try:
                if total is None or current is None:
                    progress = 0
                else:
                    progress = "%0.2f" % (float(current) / float(total) * 100)
            except Exception, e:
                raise Exception("progress get bad")

            ssh_info["progress"] = progress
            log_name = "log.%s.%s" % (tid, ip)
            LLEN = r.llen(log_name)
            if not LLEN == 0:
                for i in range(LLEN):
                    _content = r.lpop(log_name)
                    _content = json.loads(_content)
                    # print _content,'51111'
                    content += _content["content"]
                    ssh_info["content"] = {"content": content, "stage": _content["stage"],
                                                 "status": _content["status"]}
            ssh_info["content"]['status'] = True
        except Exception, e:
            ssh_info["content"]['status'] = False
            ssh_info["content"]['content'] = str(e)

        return  ssh_info

###get the command history
@login_required(login_url='/')
@ajax_http
def my_command_history(request):
    ssh_info={"content":[],"status":True}
    history=r.lrange("command.history",-5,-1)
    for line in history:
        line=json.loads(line)
        cmd=line["cmd"]
        ssh_info["content"].append(cmd)
    print  ssh_info
    return ssh_info

###upload script file
@login_required(login_url='/')
@ajax_http
def upload_script(request):
    ssh_info = {"status": False, "content": ""}
    if request.method == "POST":
        try:
            if len(r.hgetall("scripts")) >= 9: raise Exception("scripts")
            filename = str(request.FILES.get("file"))
            _data = r.hget("scripts", filename)
            if _data is None:
                pass
            else:
                data = json.loads(_data)
                if filename == data["script"]:
                    raise Exception("您的操作不被允许!存在同名脚本!")
            file_content = request.FILES.get('file').read()
            script = os.path.join(ssh_settings.script_dir, filename)
            with open(script.encode('utf8'), "wb") as f:
                f.write(file_content)
            ssh_info["content"] = {
                "script": filename,
                "time": time.strftime('%Y-%m-%d %H:%M:%S'),
            }

            r.hset("scripts", filename, json.dumps(ssh_info["content"], encoding="utf8", ensure_ascii=False))
            ssh_info["status"] = True
        except Exception, e:
            ssh_info["content"] = str(e)
            ssh_info["status"] = False
    return ssh_info

###get script  file Content
@login_required(login_url='/')
@ajax_http
def get_script_content(request):
	filename=request.GET.get("filename")
	full_path=os.path.join(ssh_settings.script_dir,filename)
	return File().get_content(full_path)

###load script file list
@login_required(login_url='/')
@ajax_http
def scripts_list(request):
    ssh_info = {"status": False, "content": ""}
    try:
        data = r.hgetall("scripts")
        ssh_info["content"] = data
        ssh_info["status"] = True
    except Exception, e:
        ssh_info["content"] = str(e)
        ssh_info["status"] = False

    return json.dumps(ssh_info)

### edit script file content
@login_required(login_url='/')
@ajax_http
def write_script_content(request):
	ssh_info={"status":False,"content":""}
	_filename=request.POST.get('filename')
	filename=os.path.basename(_filename)
	filecontent=request.POST.get("content")
	try:
		if len(r.hgetall("scripts"))>=9:raise Exception("scripts")
		full_path=os.path.join(ssh_settings.script_dir,filename)
		if not filecontent.endswith("\n"):
			filecontent="%s\n" %filecontent
		with open(full_path.encode('utf8'),"wb") as f:
			f.write(filecontent)
		filename=str(request.FILES.get("file"))
		_data=r.hget("scripts",filename)
		if _data is None:
			pass
		else:
			data=json.loads(_data)
			if filename==data["script"]:
				raise Exception("您的操作不被允许!存在同名脚本!")
		ssh_info["content"]={
			"script":_filename,
			"time":time.strftime('%Y-%m-%d %H:%M:%S',time.localtime()),
		}
		r.hset("scripts",_filename,json.dumps(ssh_info["content"],encoding="utf8",ensure_ascii=False))
		ssh_info["status"]=True
	except Exception,e:
		ssh_info["status"]=False
		ssh_info["content"]=str(e)

	return ssh_info

### del script
@login_required(login_url='/')
@ajax_http
def delete_script(request):
	username=request.user.username
	filename=request.GET.get("filename")
	ssh_info={"status":False,"content":""}
	full_path=os.path.join(ssh_settings.script_dir,filename)
	try:
		data=r.hget("scripts",filename)
		if data is None:
			pass
		else:
			data=json.loads(data)
			if filename==data["script"]:
				r.hdel("scripts",filename)
				try:
					os.remove(full_path)
					print "delte.."
				except Exception,e:
					pass
		ssh_info["status"]=True
	except Exception,e:
		ssh_info["content"]=str(e)
		ssh_info["status"]=False
	return ssh_info

###run script file
@login_required(login_url='/')
@ajax_http
def script_init(request):
    ip=request.GET.get("ip")
    sfile=request.GET.get("sfile")
    return SSHScript().script_init(ip,sfile)

###creaet conjob to any server
@login_required(login_url='/')
@ajax_http
def save_crontab_to_server(request):
    action=request.POST.get("action")
    data=request.POST.get("data")
    data=json.loads(data)
    return SSHCrontabControler().save_crontab_to_server(action,data)

##get conjob list
@login_required(login_url='/')
@ajax_http
def get_crontab_list(request):
	return SSHCrontabControler().get_crontab_list_to_web()

### del conjob
@login_required(login_url='/')
@ajax_http
def delete_crontab_list(request):
	sid=request.GET.get("sid")
	tid=request.GET.get("tid")
	return SSHCrontabControler().delete_crontab(sid,tid)

## get remote file list
@login_required(login_url='/')
@ajax_http
def get_remote_file_list(request):
	return RemoteFile().get_remote_file_list()

### transfer file to any server
@login_required(login_url='/')
@ajax_http
def add_remote_file(request):
    ssh_info = {"status": False, "content": ""}
    try:
        _id = str(random.randint(90000000000000000000, 99999999999999999999))
        id = request.GET.get("id", _id)
        ip = request.GET.get('ip')
        sid = request.GET.get("server")
        path = request.GET.get("path")
        description = request.GET.get("description")
        ssh_info = RemoteFile().add_remote_file( path=path, description=description, id=id,
                                                             server=sid, ip=ip)
    except Exception, e:
        ssh_info["status"] = False
        ssh_info["content"] = str(e)
    return ssh_info

### get remote file content
@login_required(login_url='/')
@ajax_http
def get_remote_file_opt(request):
    id=request.GET.get("tid")
    action=request.GET.get('action')
    action="GET"
    return RemoteFile().remote_file_content(id,action)


### write remote file content
@login_required(login_url='/')
@ajax_http
def write_remote_file_opt(request):
    action = "WRITE"
    id = request.POST.get("tid")
    file_content = request.POST.get("content")
    if not file_content.endswith('\n'):
        file_content = "%s\n" % file_content
    return RemoteFile().remote_file_content(id, action, file_content)

### del remote file
@login_required(login_url='/')
@ajax_http
def delete_remote_file_list(request):
	id=request.GET.get("id")
	return RemoteFile().delete_remote_file_list(id)

### load  ssh key  list
@login_required(login_url='/')
@ajax_http
def show_keyfile_list(request):
    ssh_info = {"status": False, "content": []}
    try:
        data = r.lrange("keyfile.list", 0, -1)
        for _line in data:
            line = json.loads(_line)
            ssh_info["content"].append(line)
        ssh_info["status"] = True
    except Exception, e:
        ssh_info["status"] = False
        ssh_info["content"] = str(e)
    return ssh_info

@login_required(login_url='/')
@ajax_http
def delete_keyfile(request):
    ssh_info = {"status": False, "content": ""}
    try:
        parameters = request.GET.get("parameters")
        try:
            parameters = json.loads(parameters)
        except Exception, e:
            raise Exception("json parameters error")
        if not type({}) == type(parameters): raise Exception("not parameters")
        filename = parameters["filename"]
        full_path = os.path.join(ssh_settings.keyfile_dir, filename)
        if not os.path.isfile(full_path):
            pass
        else:
            os.remove(full_path)
        line = {"keyfile": filename}
        # line = json.dumps(line, encoding="utf8", ensure_ascii=False)
        # print line
        keyfilecontent = r.lrange("keyfile.list",0,-1)
        for _keyfile in keyfilecontent:
            if line['keyfile'] == json.loads(_keyfile)['keyfile']:
                r.lrem("keyfile.list", 0, _keyfile)

        ssh_info["status"] = True
    except Exception, e:
        ssh_info["status"] = False
        ssh_info["content"] = str(e)
    return ssh_info

###upload  ssh key
@login_required(login_url='/')
@ajax_http
def upload_keyfile(request):
    fid = str(random.randint(90000000000000000000, 99999999999999999999))
    info = {"status": False, "content": "", "path": ""}
    if request.method == "POST":
        filename = str(request.FILES.get("file"))
        print filename
        file_content = request.FILES.get('file').read()
        os.chdir(ssh_settings.keyfile_dir)

        full_dir = os.path.join(ssh_settings.keyfile_dir)
        if not os.path.isdir(full_dir):
            os.mkdir(full_dir)
        os.chdir(full_dir)
        with open(filename.encode('utf8'), "wb") as f:
            f.write(file_content)
        # print file_content
        line = {"keyfile": filename}
        line.update({"keycontent": file_content,"user": str(request.user)})
        # print line
        line = json.dumps(line, encoding="utf8", ensure_ascii=False)
        r.rpush("keyfile.list", line)
    return info

###add docker repo
@login_required(login_url='/')
@ajax_http
def docker_repo(request):
    info = {"status": True, "content": ""}
    if request.method == "POST":
        print request.body
        try:

            parameters = request.POST.get("parameters")
        except Exception,e:
            print e
        try:
            parameters = json.loads(parameters)
            parameters.update({"time":time.strftime('%Y-%m-%d %H:%M:%S')})
            # parameters = json.dumps(parameters)
            # r.lpush("docker_repo",parameters)
            r.hset("docker_repo",parameters["address"],json.dumps(parameters))
            info["status"]  = True
            info["content"] = ''
        except Exception,e:
             info["status"]  = False
             info["content"] = str(e)
        print info
        return info

##load  docke repo list
@login_required(login_url='/')
@ajax_http
def docker_repo_list(request):
    info = {"status": True, "content": ""}
    Repo_list = []
    try:
        repo_list = r.hvals("docker_repo") ###array
        if repo_list == []:
            # print repo_list
            raise Exception("仓库是空的...")
        else:
            for h in repo_list:
                print h
                Repo_list.append(h)
        # print Repo_list
        info["content"] = Repo_list
        info["status"]  = True

    except Exception,e:
        info["status"] = False
        info["content"] = str(e)

    print info
    return info

##del docker repo
@login_required(login_url='/')
@ajax_http
def docker_repo_del(request):
    info = {"status": True, "content": ""}
    reponame = request.GET.get("addname")
    try:
        data = r.hget("docker_repo",reponame) ###array
        if data is None:
            raise Exception("请设置仓库!")
        else:
            data=json.loads(data)
            if reponame==data["address"]:
                r.hdel("docker_repo",reponame)

        info["status"]  = True
    except Exception,e:
        info["status"] = False
        info["content"] = str(e)
    return info

##load docker  repo images
# @login_required(login_url='/')
@ajax_http
def docker_img(request):
    try:
        repoconf_list = r.hvals("docker_repo")
        if repoconf_list is None:
            raise Exception("请先设置仓库!")
        else:
            for h in repoconf_list:
                _repoconf = h
            repoconf = json.loads(_repoconf)
            registry = Docker_registry(**repoconf)
            info = registry.docker_img_content()

    except Exception, e:
        print e
    return json.dumps(info)

##load docker repo images tag list
# @ajax_http
@login_required(login_url='/')
def docker_imagestags(request):
    img = 'media/' + str(request.user.head_img)
    url = request.get_full_path()
    image = re.split('[\?=]',url)[2]
    # print url,'810'
    tags = {
        "image_name":image,
        "tag_list":[]
    }
    try:
        repoconf_list = r.hvals("docker_repo")
        if repoconf_list is None:
            raise Exception("请先设置仓库!")
        else:
            for h in repoconf_list:
                _repoconf = h

            repoconf = json.loads(_repoconf)
            url = repoconf["address"]
            user = repoconf["repo_user"]
            pwd = repoconf["repo_pass"]
            if url and user and pwd:
                rr = requests.get(url=url + "/v2/" + image + "/tags/list", auth=HTTPBasicAuth(user,pwd) ,timeout=5)
            if rr.status_code == 200:
                ###images tag list
                t_list = json.loads(rr.text).get('tags',[])
                for t in t_list:
                    images = {}
                    tr = requests.get(url=url + "/v2/" + image + "/manifests/" + t,
                        auth=HTTPBasicAuth(user,pwd),
                        timeout=5,
                        headers={'Accept':'application/vnd.docker.distribution.manifest.v2+json'}
                    )
                    t_info = json.loads(tr.text)
                    ####append those  images layer into html
                    if not t_info.has_key('errors'):
                        ####last_modified must the same with header inside of Date column
                        last_modified = time.strftime("%Y-%m-%d %H:%M:%S",time.strptime(tr.headers.get('Date',''), "%a, %d %b %Y %H:%M:%S GMT"))
                        images["layer_count"] = len(t_info.get('layers'))
                        images["layer_detail"] = t_info.get('layers')
                        images["url"] = url + "/" + image + ":" + t
                        images["tag"] = t
                        images["digest"] = tr.headers.get('Docker-Content-Digest','')
                        images["last_modified"] = last_modified
                        tags["tag_list"].append(images)
                        # print json.dumps(tags )
        # print json.dumps(tags)
    except Exception,e:
        print e

    return  render(request,"repo_tag.html",{"tags":json.dumps(tags),"image":tags["image_name"],"head":img})

###load  docker repo images tag with history
# @login_required(login_url='/')
@ajax_http
def docker_tagshistory(request):
    url = request.get_full_path()
    image = re.split('[\?&=]',url)[2]
    tag = re.split('[&=]',url)[3]
    print image,tag
    history = {
        "image":image,
        "tag":tag,
        "history":[]
    }
    try:
        repoconf_list = r.hvals("docker_repo")
        if repoconf_list is None:
            raise Exception("请先设置仓库!")
        else:
            for h in repoconf_list:
                _repoconf = h

            repoconf = json.loads(_repoconf)
            url = repoconf["address"]
            user = repoconf["repo_user"]
            pwd = repoconf["repo_pass"]
            if url and user and pwd and image and tag:
                rr = requests.get(url=url + "/v2/" + image + "/manifests/" + tag,
                    auth=HTTPBasicAuth(user,pwd),
                    timeout=5
                )
                if rr.status_code == 200:
                    t_info = json.loads(rr.text)
                    for h in t_info.get('history'):
                        v = h.get('v1Compatibility',{})
                        if v:
                            history['history'].append(json.loads(v))

    except Exception,e:
        print "get history error: " + str(e)
    # print history
    return json.dumps(history)

##del docker  repo  images
@ajax_http
def docker_delimg(request):
    if request.method == "DELETE":
            result = {}
            try:
                repoconf_list = r.hvals("docker_repo")
                if repoconf_list is None:
                    raise Exception("请先设置仓库!")
                else:
                    for h in repoconf_list:
                        _repoconf = h

                    repoconf = json.loads(_repoconf)
                    registry = Docker_registry(**repoconf)
                    url = request.get_full_path()
                    content =  json.loads(request.body)
                    image = content['image']
                    tag = content['tag']
                    # image = re.split('[\?&=]',url)[2]
                    # tag = re.split('[&=]',url)[3]
                    print image,tag
                    if image and tag:
                        status = registry.del_manifests(image,tag)
                        # print status,'928'
                    result["result"] = status
            except Exception,e:
                print "del image error: " + str(e)
                # result["result"] = str(e)
            return json.dumps(result)

####Create Container_Node  tag
@login_required(login_url='/')
@ajax_http
def  Container_Node(request):
    if request.method == "POST":
        result = {}
        try:
            # print request.POST.get("")
            parameters = json.loads(request.body)
            parameters.update({"time":time.strftime('%Y-%m-%d %H:%M:%S')})
            print parameters
            try:
                #"{'parameters': {'NodeIp': 'fdsf', 'NodeName': 'fdsf', 'NodeId': 'e1iv944r95'}, 'time': '2017-07-31 14:52:26'}"
                # r.lpush("Container_Node",parameters["NodeName"],parameters)
                ##use list
                Node = r.exists('Container_Node')
                if Node is False:
                    default = {"NodeIp": "127.0.0.1", "time": "2017-08-14 13:19:15", "NodeName": "default", "NodeId": "xxxxxx"}
                    r.hset("Container_Node",default["NodeName"],json.dumps(default))

                r.hset("Container_Node",parameters["NodeName"],json.dumps(parameters))
                result["status"] = 200
            except Exception,e:
                print e
        except Exception,e:
            result["status"]  = 401
            print e
        return json.dumps(result)

##load Container Machine  list
@login_required(login_url='/')
@ajax_http
def  ContainerNodeList(request):
     result = {}
     try:
         Node = r.exists('Container_Node')
         print Node
         temp = {"NodeIp": "127.0.0.1", "time": "2017-08-14 13:19:15", "NodeName": "default", "NodeId": "xxxxxx"}
         if Node is False:
             r.hset("Container_Node",temp["NodeName"],json.dumps(temp))
         NodeList = r.hvals("Container_Node")
         result["data"] =  NodeList
         print result
     except Exception, e:
         print str(e)
     return json.dumps(result)

####when it remove ContainerNode but these Container Service not to be remove
@login_required(login_url='/')
@ajax_http
def  ContainerDelNode(request):
        if request.method == "POST":
            result =  {"status": 200 }
            try:
                # data = {"data": 'fdsff'}
                ###多个引号
                print request.body
                data = re.split("\"",request.body)[1]
                NodeList = r.hdel("Container_Node", data)
                result =  {"status": 200 }
            except Exception ,e :
                result =  {"status": "can not  connect redis" }
            return  json.dumps(result)

###load  pulled  docker images
@login_required(login_url='/')
@ajax_http
def  docker_images(request):
    result = {"status": True, "content": []}
    uuid_token = str(uuid.uuid4())
    try:
        image_list = r.hvals("docker_img")
        for  _image in image_list:
            #  image = json.loads(_image)
            #  detail = ImageMixin().details(image['fromImage'],image['tag'])
             result["content"].append(_image)
        result["status"] = True
        print result
    except Exception,e:
        print str(e)
        result["status"] =  False
        result["content"] =  str(e)
    return json.dumps(result)

###search docker images
@login_required(login_url='/')
# @ajax_http
def search_images(request):
    term = request.POST['term']
    print term
    images = requests.get('http://localhost:' + DOCKER_API_PORT + '/images/search?term=' + term)
    print images
    return HttpResponse(json.dumps(images.json()),
                        content_type='application/json')

###pull docker image and saving  pull image info
@login_required(login_url='/')
def docker_pull_image(request, uuid_token):
    # TODO userdefined tag
    #TODO  everyuser hasown image
    print request.user
    params = {'tag': 'latest', 'fromImage': request.POST['imageName']}
    print uuid_token
    response = requests.post('http://localhost:' + DOCKER_API_PORT + '/images/create', params=params, stream=True)
    if response:
        for line in response.iter_lines():
            print line,'1014'
            file = open('/tmp/' + uuid_token, 'w')
            if line:
                output = json.loads(str(line.decode(encoding='UTF-8')))
                try:
                    ####already downloaded  shld be  save  image  info
                    if output['progressDetail']:
                        progress = (output['progressDetail']['current'] * 100) / output['progressDetail']['total']
                        file.write('{"status": "ok","image-status":"' + output['status'] + '","progress":' + str(
                            int(progress)) + ',"id":"' + output['id'] + '"}')
                except KeyError:
                    try:
                        if 'Digest:' in output['status']:
                            print 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
                            ### need to wait the api response the info
                            detail = ImageMixin().details(name=request.POST['imageName'],tag='latest')
                            params.update({"id":detail["id"],"size":detail["size"],"created":time.strftime('%Y-%m-%d %H:%M:%S')})
                            print params
                            r.hset("docker_img",request.POST['imageName'],json.dumps(params))
                    except KeyError:
                        pass
                    file.close()
                    file = open('/tmp/progress', 'w')
                    file.write(str({"status": output['status']}))
        file.close()
        return JsonResponse({'status': 'ok'})
    else:
        return JsonResponse({'status': 'error'})

###del  docker image
@login_required(login_url='/')
@ajax_http
def docker_remove_image(request):
    #TODO  everyuser  only del own image
    info  = {"result": ''}
    image = r.hget('docker_img',request.GET.get('name'))
    if image:
        status_code = ImageMixin().remove(request.GET.get('name'))
        if status_code == 200:
            r.hdel('docker_img',request.GET.get('name'))
            info['result'] = 'Deleted'
            return info
        elif status_code == 404:
            info['result'] = 'NO SUCH IMAGE'
            return info
        elif status_code == 409:
            info['result'] = 'Image Conflict'
            return info
    info['result'] = 'Unable to remove image'
    return info

##load  all  Container  network range
@login_required(login_url='/')
@ajax_http
def Container_Ava_Ip(request):
    info  = {"result": '',"status": ''}
    try:
        iplist = r.hgetall("docker_network")
        if iplist:
            print iplist
            print type(iplist)
            info['result'] = iplist
            info['status'] = 200
        else:
            info['result'] = "empty"
            info['status'] = 400
    except Exception,e:
        info['result'] = str(e)
        info['status'] = 400
        print str(e)
    return  info

###Create  Container  network range
@login_required(login_url='/')
@ajax_http
def Create_Container_Net(request):
    ###TODO  create docker network to any server
    info  = {"result": '',"status": ''}
    if request.method == 'POST':
        data = json.loads(request.body)
        try:
            data.update({"available":int(253)})
            r.hset("docker_network",data['Nodename'],json.dumps(data))
            info['status'] = True
        except Exception,e:
            print str(e)
            info['status'] = False
            info['result'] = "无法连接数据库"
    return info

###del Container  Network   range
@login_required(login_url='/')
@ajax_http
def Del_Container_Net(request):
    info  = {"result": ''}
    try:
        response = r.hdel('docker_network',request.GET.get('name'))
        if response > 0:
            info["result"] = 'Deleted'
        else:
            info["result"] = '请先创建一个子网'
    except  Exception, e:
        info["result"] = str(e)
    return info

###create container service
@login_required(login_url='/')
@ajax_http
def  Create_container_service(request):
     ####TODO save the  other  db to select
     ###TODO  with ssh key   put down into  docker
     info  = {"result": '',"status": True}
     if request.method == "POST":
        print request.body
        data = json.loads(request.body)
        try:
            container_id = ImageMixin().run_bridge(data['cpu'],data['memory'],data['serviceAddress'],data['servicename'],data['image'])
            data.update({"container_id":container_id,"user": str(request.user),"created":time.strftime('%Y-%m-%d %H:%M:%S')})
            r.lpush("Unavailable_Container_IP",data['serviceAddress'])
            pubkey = {"user": str(request.user), "sshpubkey": "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCuLVDCriLoKZeEmThg5zCAq9+QoQJIIyxE4iJ6nSa9OJZMqDr8ZJmh1uRiPTCjmmC4KmP0q99Yfcvu0rc8UCKcJQE6yB9vpxR+kOyEtfAqsQVYMRd0Y+IN98GiG+z8nps7ra2k5etGN+NmBiLoiT86xHrvwvrePbf8i96ZkNeb+TpCPzx6KJqKdQfFZKG+0yt2WhNd3b3YKveQaKax70gbpay9Qy1BjpMvItWErtOymv+SNQPBHddRQs3PEEcVTR2u0QpEUoHyb3nIZNIY7Ykgq3Q8FbykYrFHnhF4eSyw70JGtuDs1JS53TZzv3bP9ia08GOHaVc2z/EpOpNFp93f skey_160973"}
            try:
                # pubkey = json.loads(r.hset("ssh_pub_key",str(request.user)))
                # print pubkey
                # print type(pubkey)
                copy_ssh_pub_key = ContainerMixin().copy_ssh_pub_key(str(request.user),container_id,pubkey['sshpubkey'])
                passphrase = ContainerMixin().set_passphrase(container_id)
                print  passphrase
                data.update({"password": passphrase})
                r.lpush(str(request.user)+'_container',json.dumps(data))
                datalist = r.lrange(str(request.user)+'_container',0,-1)
                print datalist

                info["status"] = True
                info["result"] = datalist
            except Exception, e:
                info["status"] = False
                info["result"] = str(e)
                print e,'1328'

        except Exception ,e :
            info["status"] = False
            info["result"] = str(e)
            print e,'1332'
     return json.dumps(info)

### load owner Container service
@login_required(login_url='/')
@ajax_http
def Load_Container_Service(request):
    info  = {"result": '',"status": True}
    datalist = r.lrange(str(request.user)+'_container',0,-1)
    if len(datalist) > 0:
        info["status"] = True
        info["result"] = datalist
    else:
        info["status"] = False
        info["result"] = "empty"

    return json.dumps(info)

@login_required(login_url='/')
@ajax_http
def container_check(request):
    sid = request.GET.get('sid')
    sip = request.GET.get('sip')
    try:
        status = {
        	"status":"checking",
			"content":"检查中",
            "button": "start",
			"time":time.strftime("%Y-%m-%d %H:%M:%S",time.localtime()),
        }
        health = ContainerMixin().checkcontainer(sid)
        print str(health)
        if health  == "alive":
            status["status"] = "success"
            status["ip"] = sip
            status["button"] = "start"
            status["content"] = "连接正常"
            print status
            r.set("container_status.%s"%sip,json.dumps(status))
        else:
            status["status"] = "failed"
            status["ip"] = sip
            status["button"] = "stop"
            status["content"] = "连接失败"
            r.set("container_status.%s"%sip,json.dumps(status))
    except Exception , e:
        pass
    return json.dumps(status)

#### Container stop
@login_required(login_url='/')
@ajax_http
def Container_Stop(request):
    ###postjson  post the "value"  need to  json.loads
    Container_id = json.loads(request.body)
    # print Container_id
    response = ContainerMixin().stop(Container_id)
    print response.status_code
    info = {"status": True, "result": ""}
    if response.status_code  == 204 or response.status_code == 304:
        r.set("container_status.%s"%Container_id,json.dumps({"status": "stop"}))
        info["status"] = True
        info["result"] = "停止成功"
    else:
        info["status"] = False
        info["result"] = "未知错误"
    # print response.status_code,response.json()
    return json.dumps(info)

#### Container start
@login_required(login_url='/')
@ajax_http
def Container_Start(request):
    ###postjson  post the "value"  need to  json.loads
    Container_id = json.loads(request.body)
    # print Container_id
    response = ContainerMixin().stop(Container_id)
    # print response.status_code
    info = {"status": True, "result": ""}
    if response.status_code  == 204 or response.status_code == 304:
        r.set("container_status.%s"%Container_id,json.dumps({"status": "start"}))
        info["status"] = True
        info["result"] = "启动成功"
    else:
        info["status"] = False
        info["result"] = "未知错误"
        r.set("container_status.%s"%Container_id,json.dumps({"status": "stop"}))
    # print response.status_code,response.json()
    return json.dumps(info)

#### Container restart
@login_required(login_url='/')
@ajax_http
def Container_ReStart(request):
    ###postjson  post the "value"  need to  json.loads
    Container_id = json.loads(request.body)
    # print Container_id
    response = ContainerMixin().restart(Container_id)
    print response.status_code
    info = {"status": True, "result": ""}
    if response.status_code  == 204 or response.status_code == 304:
        r.set("container_status.%s"%Container_id,json.dumps({"status": "start"}))
        info["status"] = True
        info["result"] = "重启成功"
    else:
        info["status"] = False
        info["result"] = "未知错误"
        r.set("container_status.%s"%Container_id,json.dumps({"status": "stop"}))
    # print response.status_code,response.json()
    return json.dumps(info)

#### Container  remove
@login_required(login_url='/')
@ajax_http
def Container_Remove(request):
    ###postjson  post the "value"  need to  json.loads
    Container_id = json.loads(request.body)
    # print Container_id
    response = ContainerMixin().remove(Container_id)
    # print response.status_code
    info = {"status": True, "result": ""}
    if response.status_code  == 204 or response.status_code == 304:
        try:
            datalist = r.lrange(str(request.user)+'_container',0,-1)
            ###there is a remove  list method
            for _list in datalist:
                 if Container_id == json.loads(_list)['container_id']:
                     r.lrem(str(request.user)+'_container',0,_list)

            r.delete("container_status.%s"%Container_id)
            info["status"] = True
            info["result"] = "删除成功"
        except Exception,e:
            print str(e)
    else:
        info["status"] = False
        info["result"] = "未知错误"
    return json.dumps(info)

####backup container as new on##
@login_required(login_url='/')
@ajax_http
def Container_Backup(request):
    ###postjson  post the "value"  need to  json.loads
    content = json.loads(request.body)
    ###commit backup
    response,image_id = ContainerMixin().commit(content['container_id'],content['backupname'])
    ###get the backup info
    details = ImageMixin().details(name=content['backupname'],tag='latest')
    info = {"status": True, "result": ""}
    if response.status_code  == 201:
        data = {}
        data.update({"image_id":details['id'],"tag":'latest',"created":time.strftime('%Y-%m-%d %H:%M:%S'),"size":details["size"],"backupname":content['backupname']})
        #### push redis  backup info
        r.lpush(str(request.user)+"_container_backup.%s"%content['container_id'],json.dumps(data))
        info["status"] = True
        info["result"] = "备份成功"
    else:
        info["status"] = False
        info["result"] = "未知错误"

    return json.dumps(info)


###load container  backup image
@login_required(login_url='/')
@ajax_http
def get_container_backup(request):
    info  = {"result": '',"status": True}
    if request.method == 'POST':
        content = json.loads(request.body)
        print content
        try:
            backup = r.lrange(str(request.user)+"_container_backup.%s"%content['container_id'],0,-1)
            if len(backup) > 0:
                info["status"] = True
                info["result"] = backup
        except Exception,e:
            info["status"] = False
            info["result"] = "empty"
            print str(e)
        return json.dumps(info)

###remove container backup
@login_required(login_url='/')
@ajax_http
def Remove_container_backup(request):
    info  = {"result": '',"status": True}
    if request.method == 'POST':
        rmname = json.loads(request.body)
        print rmname['rmname'],rmname['container_id']
        try:
            backup = r.lrange(str(request.user)+"_container_backup.%s"%rmname['container_id'],0,-1)
            for _list in backup:
                if rmname['rmname'] == json.loads(_list)['image_id']:
                    r.lrem(str(request.user)+"_container_backup.%s"%rmname['container_id'],0,_list)
                    response = ImageMixin().remove(rmname['rmname'])
                info["status"] = True
                info["result"] = "删除成功"
        except Exception,e:
            info["status"] = False
            info["result"] = str(e)
            print str(e)
        return json.dumps(info)

####get container  process
##{"Processes": [["2614", "root", "0:00", "/sbin/init"], ["2696", "root", "0:00", "/usr/sbin/sshd -D"]], "Titles": ["PID", "USER", "TIME", "COMMAND"]}
@login_required(login_url='/')
def container_top(request):
        container_id = json.loads(request.body)
        # print container_id
        top = ContainerMixin().top(container_id)
        if top:
            return JsonResponse(top)
        return JsonResponse({'Titles': None, 'Processes': None,'status': False})

###get the container file change info
## {"deleted": [], "added": ["/root/.bash_history", "/root/.ssh", "/root/.ssh/authorized_keys", "/run/sshd", "/run/sshd.pid", "/var/log/dmesg.0", "/var/log/dmesg.1.gz", "/var/log/dmesg.2.gz", "/var/log/dmesg.3.gz", "/var/log/dmesg.4.gz"], "modified": ["/etc", "/etc/.pwd.lock", "/etc/shadow", "/root", "/run", "/var/log", "/var/log/dmesg", "/var/log/upstart"]}
@login_required(login_url='/')
def container_filediff(request):
    container_id = json.loads(request.body)
    diff = ContainerMixin().diff(container_id)
    modified = []
    added = []
    deleted = []
    for file_info in diff:
        if file_info['Kind'] == 0:
            modified.append(file_info['Path'])
        elif file_info['Kind'] == 1:
            added.append(file_info['Path'])
        elif file_info['Kind'] == 2:
            deleted.append(file_info['Path'])
    return JsonResponse({'modified': modified[:10], 'added': added[:10], 'deleted': deleted[:10]})

###random socket port
def find_free_port():
    s = socket()
    s.bind(('', 0))
    return s.getsockname()[1]

####connect container terminal
@login_required(login_url='/')
def container_terminal(request):
    container_id = json.loads(request.body)
    port = find_free_port()
    uuid_token = str(uuid.uuid4())
    go_cmd = '%s/ops/views/terminal %s %s %s %s ' % (BASE_DIR,port, HOST_IP_ADDR, DOCKER_API_PORT, container_id)
    ncp_proc = subprocess.Popen(go_cmd, shell=True, executable='/bin/bash')
    return JsonResponse({'container_id': container_id, 'port': port})

###TODO when the container  create ,will create a process collcet  container status, and  not real time return status
###get container cpu usage
@login_required(login_url='/')
@ajax_http
def get_container_cpu(request):
    if request.method == "POST":
            container_id = request.body
            time = ContainerMixin().time()
            stats = ContainerMixin().cpu(container_id)
            result = [time, stats]
            # print result
            return json.dumps(result)

###get container mem usage
@login_required(login_url='/')
@ajax_http
def get_container_memusage(request):
    if request.method == "POST":
        container_id = request.body
        time = ContainerMixin().time()
        usage,limit = ContainerMixin().memusage(container_id)
        result = [time, usage],[time,limit]
        # print result
        return json.dumps(result)

###get container mem_percentage
@login_required(login_url='/')
@ajax_http
def get_container_mem_percentage(request):
    if request.method == "POST":
        container_id = request.body
        time = ContainerMixin().time()
        stats = ContainerMixin().mem_percentage(container_id)
        result = [time, stats]
        return json.dumps(result)

##network IO
@login_required(login_url='/')
@ajax_http
def get_container_net(request):
        container_id = request.body
        time = ContainerMixin().time()
        upload,download = ContainerMixin().network(container_id)
        result = [time, upload],[time,download]
        # print result
        return json.dumps(result)

@login_required()
@ajax_http
def get_docker_host_info(request):
    if request.method == "POST":
        ip = json.loads(request.body)['ip']
        allcontainer_list = ContainerMixin().json(ip)
        container = []
        for  x in allcontainer_list:
            container_details = ContainerMixin().details(ip,x[u'Id'][:10])
            container.append(json.dumps(container_details))
        return json.dumps({"result": container,"status": True })


@login_required()
@ajax_http
def receive_email(request):
    if request.method == "POST":
        user =  str(request.user)
        email = request.user.email
        e_pwd = request.body.replace('"','')
        r.set("{email}".format(email=email),e_pwd)
        # print email,e_pwd
        result =  EmailMinxin().email(email,e_pwd)
        return result
    else:
        user =  str(request.user)
        email =  request.user.email
        e_pwd = r.get("{email}".format(email=email))
        print e_pwd
        result =  EmailMinxin().email(email,e_pwd)
        # result =  EmailMinxin().email()
        # r.lpush('%s',result)% email
        r.lpush("{user}.{email}".format(user=user,email=email),result)
        return  result



@ajax_http
def wechat_notify(request):
    if request.method == "POST":
        agentid=1000002
        server_status  =  requests.body
        print server_status
        wx = WeiXin(ssh_settings.Pushid, ssh_settings.Pushsecure)
        message = {"content": server_status}
        data = wx.send_message(userid='@all',agentid=agentid,toparty=4,totag=4,messages=message)
        print wx

"""
  push a work order will  click wechat notify
"""

@login_required(login_url='/')
@ajax_http
def work_order(request):
    info = {"status": 'false'}
    if request.method == "POST":
        agentid=ssh_settings.agentid
        data = json.loads(request.body)
        data['time'] = time.strftime('%Y-%m-%d %H:%M:%S')
        data['status'] =  '未确认'
        print data
        try:
            wx = WeiXin(ssh_settings.Pushid, ssh_settings.Pushsecure)
            r.lpush("work_order",json.dumps(data))
            messages={"content": data['title'] + "\n" + "发起更新时间: " + data["time"]}
            data = wx.send_message(userid='@all',agentid=agentid,toparty=4,totag=4,messages=messages)
        except  Exception as e:
            pass
        return data


@login_required(login_url='/')
@ajax_http
def work_order_finish_notify(request):
    if request.method == "POST":
        agentid=ssh_settings.agentid
        data = json.loads(request.body)
        data['time'] = time.strftime('%Y-%m-%d %H:%M:%S')
        try:
            wx = WeiXin(ssh_settings.Pushid, ssh_settings.Pushsecure)
            r.lpush("work_order_finish_log",json.dumps(data))
            messages={"content": data['title'] + "\n" + "完成时间 :" + ' ' + data["time"] + "\n" +  "状态 :" + ' ' + data["status"] + "\n" + "处理人 :" + ' ' + str(request.user)}
            data = wx.send_message(userid='@all',agentid=agentid,toparty=4,totag=4,messages=messages)
        except  Exception as e:
            pass


@login_required(login_url='/')
@ajax_http
def work_order_list(request):
    work_order = r.lrange("work_order",0,-1)
    totals = r.llen("work_order")
    content = {"totals":totals,"data":work_order}
    # print content
    return json.dumps(content)

"""
add log
"""
@login_required(login_url='/')
@ajax_http
def update_work_order_status(request):
    status = {"status": 'success'}
    if request.method == "POST":
        time = json.loads(request.body)
        # print time['time']
        try:
             data = r.lrange("work_order",0,-1)
             for _data in data:
                 List = json.loads(_data)
                 if List['time'] == time['time']:
                     List['status'] = '已确认'
                     r.lrem('work_order',0,_data)
                     r.lpush('work_order',json.dumps(List))

             status['status'] = 'success'
        except Exception as e:
             status['status'] = 'failed'

        return  status

@login_required(login_url='/')
@ajax_http
def  Work_plan_list(request):
    status = {"status": 'success'}
    if request.method == "POST":
        ### 前端传字典过来实际上是字符串需要 loads 变成字典在塞到redis里 返回前端才是对象
         data = json.loads(request.body)
         try:
             r.lpush("work_plan",json.dumps(data))
             status['status'] = 'success'
         except Exception as e:
             status['status'] = 'failed'

         return  status

@login_required(login_url='/')
@ajax_http
def get_work_plan_list(request):
    try:
        data = r.lrange("work_plan",0,-1)
    except Exception as e:
        pass
    return json.dumps(data)

@login_required(login_url='/')
@ajax_http
def Del_work_plan_ops(request):
    if request.method == "POST":
        try:
            ops = request.body
            print ops
            data = r.lrange("work_plan",0,-1)
            for  _data in data:
                 List = json.loads(_data)
                 if List['title'] == ops:
                    r.lrem("work_plan",0,_data)
        except Exception as e:
            print e

@login_required(login_url='/')
@ajax_http
def Del_work_order(request):
    if request.method == "POST":
        try:
            order_time = request.body
            print order_time
            work_time = r.lrange("work_order",0,-1)
            for  _data in work_time:
                 List = json.loads(_data)
                 if List['time'] == order_time:
                    r.lrem("work_order",0,_data)
        except Exception as e:
            print e

## TODO   webhook
@login_required(login_url='/')
@ajax_http
def Save_hook_info(request):
    if request.method == "POST":
        try:
            key = StringUtil.md5_token()
            data = json.loads(request.body)
            data['key'] = key
            # r.lpush("hook_list",json.dumps(data))
            if data['opt'] == 'add':
                WebHook.objects.create(repo=data['repo'],branch=data['branch'],shell=data['shell'],server=data['server'],
                                           add_time=time.strftime('%Y-%m-%d %H:%M:%S'),key=key,status=data['status'],
                                           lastUpdate=time.strftime('%Y-%m-%d %H:%M:%S'))
            else:
                hook_index = data['hook_index']
                data = {'repo':data['repo'],'branch':data['branch'],'shell':data['shell'],'server':data['server']}
                WebHook.objects.filter(id=hook_index).update(**data)
        except Exception as e:
            return json.dumps(e)

## TODO:  get webhook and  hisotry  分开 渲染， 这里主要返回webhook id 去获得history
@login_required(login_url='/')
@ajax_http
def Get_hook_info(request):
    arr = []
    # data = r.lrange("hook_list",0,-1)
    # print json.dumps(data)
    hook_info = WebHook.objects.all()
    for t in hook_info:
        data = json.dumps({"id": t.id,"repo":t.repo,"branch": t.branch,"shell": t.shell,"server":t.server,"key":t.key,"status": t.status,"lastUpdate": str(t.lastUpdate)})
        arr.append(data)

    return arr

@login_required(login_url='/')
@ajax_http
def Del_hook_info(request):
    status = {"status": "sccuess"}
    if request.method == "POST":
        data = json.loads(request.body)
        try:
            List = r.lrange("hook_list",0,-1)
            for _list in List:
                h_list = json.loads(_list)
                if h_list['key'] == data['key']:
                    r.lrem("hook_list",0,_list)
                    WebHook.objects.filter(key=data['key']).delete()
            status['status'] = "sccuess"
        except Exception as e:
            status['status'] = "faild"

        return status


##TODO  更新webhook 状态 和 插入history 日至  最后将状态返回 渲染 这里 只发送成功和失败,放到celery 队列去执行 ,或者是queue里面去跑完 拿结果集 返回给前段 前端处理
###w将更新的仓库  塞入redis里 ，前段手动触发去取 执行更新
# @login_required(login_url='/')
"""
0  unknow 1 no data 3 failed 4  sccuess
"""
@accept_websocket
def webhook_callback(request,callback_token):
    ###将更新的
    if request.method == "POST":
        Hook_post = json.loads(request.body)
        repo = Hook_post['repository']['name']
        if Hook_post.has_key('pusher'):
            pusher = Hook_post['pusher']['name'] + ' ' + '<'+ Hook_post['pusher']['email'] + '>'
        else:
            pusher = 'nobody'
        # branch = 'master'  ###  coding not  attribute
        push_user = Hook_post['commits']
        ## which repo need to update how  much number
        obj = WebHook.objects.get(key=callback_token)
        server = obj.server
        shell = obj.shell
        #### history bind the access_token  match  index id
        webhook_id = obj.id
        stdout = tasks.get_hook_info_execute.delay(callback_token,server,shell,webhook_id)
        if not stdout.get()['status']:
            data = {"status":'3',"lastUpdate":time.strftime('%Y-%m-%d %H:%M:%S')}
            WebHook.objects.filter(key=callback_token).update(**data)
            History.objects.create(status=3,shell_log=stdout.get()[u'content'],data=Hook_post,push_user=pusher,
                add_time=time.strftime('%Y-%m-%d %H:%M:%S'),update_time=time.strftime('%Y-%m-%d %H:%M:%S'),webhook_id_id=obj.id)
            r.lpush("hook_update_status", json.dumps({'key':callback_token,'status':'3',"time":time.strftime('%Y-%m-%d %H:%M:%S')}))
        else:
            ###update more  only put one arguments -> dict
            data = {"status":'4',"lastUpdate":time.strftime('%Y-%m-%d %H:%M:%S')}
            WebHook.objects.filter(key=callback_token).update(**data)
            History.objects.create(status=4,shell_log=stdout.get()[u'content'],data=Hook_post,push_user=pusher,
                add_time=time.strftime('%Y-%m-%d %H:%M:%S'),update_time=time.strftime('%Y-%m-%d %H:%M:%S'),webhook_id_id=obj.id)

            r.lpush("hook_update_status", json.dumps({'key':callback_token,'status':'4',"time":time.strftime('%Y-%m-%d %H:%M:%S')}))

        return HttpResponse('updating')
    else:
        """
             just  send status of socket
        """
        if  request.is_websocket():
                status = r.lpop("hook_update_status")
                if status is not None:
                    request.websocket.send(status)
                else:
                    request.websocket.send('1')


### [{xxx},{xxxxx}]
@login_required(login_url='/')
@ajax_http
def hook_history(request):
    if request.method == "POST":
        num = request.body
        history = []
        for i in  History.objects.filter(webhook_id_id=num).order_by('-update_time')[:15]:
            data = json.dumps({"id":i.id,"status":i.status,"shell_log":i.shell_log,"push_user":i.push_user,"update_time": str(i.update_time)})
            dict = json.loads(data)
            history.append(dict)
        return history

@login_required(login_url='/')
def Ansible_playbook_list(request):
    img = 'media/' +  str(request.user.head_img)
    # 获取剧本数据列表
    playbookList = Ansible_Playbook.objects.all()
    for ds in playbookList:
        ds.ansible_playbook_number = Ansible_Playbook_Number.objects.filter(playbook_id=ds.id)
        # 如果用户在授权组或者是授权用户，设置runid等于项目id
        if request.user.has_perm('Ansible_Playbook.can_do_all_ansible_playbook') or request.user.groups.has_perm('Ansible_Playbook.can_do_all_ansible_playbook'):
            ds.runid = ds.id
        # # 如果剧本没有授权默认所有用户都可以使用
        else:
            ds.runid = ds.id
    return render(request,"playbook_list.html",{"user":request.user,"head":img,"playbookList": playbookList})

@login_required()
def config(request):
    img = 'media/' +  str(request.user.head_img)
    if request.method == "GET":
        try:
            config = Global_Config.objects.get(id=1)
        except:
            config = None
        try:
            email = Email_Config.objects.get(id=1)
        except:
            email = None
        return render(request,'config.html', {"user": request.user, "config": config,"email": email,"head":img})
    elif request.method == "POST":
        if request.POST.get('op') == "log":
            try:
                count = Global_Config.objects.filter(id=1).count()
            except:
                count = 0
            if count > 0:
                Global_Config.objects.filter(id=1).update(
                    ansible_model=request.POST.get('ansible_model'),
                    ansible_playbook=request.POST.get('ansible_playbook'),
                    cron=request.POST.get('cron'),
                    project=request.POST.get('project'),
                    assets=request.POST.get('assets', 0),
                    server=request.POST.get('server', 0),
                    email=request.POST.get('email', 0),
                )
            else:
                config = Global_Config.objects.create(
                    ansible_model=request.POST.get('ansible_model'),
                    ansible_playbook=request.POST.get('ansible_playbook'),
                    cron=request.POST.get('cron'),
                    project=request.POST.get('project'),
                    assets=request.POST.get('assets'),
                    server=request.POST.get('server'),
                    email=request.POST.get('email')
                )
            return JsonResponse({'msg': '配置修改成功', "code": 200, 'data': []})
        elif request.POST.get('op') == "email":
            try:
                count = Email_Config.objects.filter(id=1).count()
            except:
                count = 0
            if count > 0:
                Email_Config.objects.filter(id=1).update(
                    site=request.POST.get('site'),
                    host=request.POST.get('host', None),
                    port=request.POST.get('port', None),
                    user=request.POST.get('user', None),
                    passwd=request.POST.get('passwd', None),
                    subject=request.POST.get('subject', None),
                    cc_user=request.POST.get('cc_user', None),
                )
            else:
                Email_Config.objects.create(
                    site=request.POST.get('site'),
                    host=request.POST.get('host', None),
                    port=request.POST.get('port', None),
                    user=request.POST.get('user', None),
                    passwd=request.POST.get('passwd', None),
                    subject=request.POST.get('subject', None),
                    cc_user=request.POST.get('cc_user', None),
                )
            return JsonResponse({'msg': '配置修改成功', "code": 200, 'data': []})

@login_required(login_url='/')
def Ansible_playbook_config(request):
    img = 'media/' +  str(request.user.head_img)
    return render(request,"playbook_config.html",{"user":request.user,"head":img,"ans_uuid": uuid.uuid4()})

@login_required(login_url='/')
def Ansible_easy_module(request):
    img = 'media/' +  str(request.user.head_img)
    return render(request,"easy_module.html",{"user":request.user,"head":img,"ans_uuid": uuid.uuid4()})

@login_required(login_url='/')
def Container_Play(request):
    img = 'media/' +  str(request.user.head_img)
    return render(request,"docker_container_play.html",{"user":request.user,"head":img})

@login_required(login_url='/')
def docker_container(request):
    img = 'media/' +  str(request.user.head_img)
    return render(request,"docker_container.html",{"user":request.user,"head": img})

@login_required(login_url='/')
def docker(request):
    img = 'media/' +  str(request.user.head_img)
    return render(request,"docker_repo.html",{"user":request.user,"head":img})

@login_required(login_url='/')
def PushCode(request):
    img = 'media/' +  str(request.user.head_img)
    return  render(request,'pushcode.html',{"user":request.user,"head":img})

@login_required(login_url='/')
def UploadKey(request):
    img = 'media/' +  str(request.user.head_img)
    # header = render(request,'uploadkey.html',{"user":request.user,"head":img})
    # header['Etag'] = '315c43a156661946d0490a53b49b2c32'
    # return  header
    return render(request,'uploadkey.html',{"user":request.user,"head":img})

@login_required(login_url='/')
def Calendar(request):
    img = 'media/' +  str(request.user.head_img)
    return render(request,'Calendar.html',{"user":request.user,"head":img})

@login_required(login_url='/')
def Work_plan(request):
    img = 'media/' +  str(request.user.head_img)
    return render(request,'work_plan.html',{"user":request.user,"head":img})

@login_required
def remotefile(request):
    img = 'media/' +  str(request.user.head_img)
    return  render(request,'remotefile.html',{"user":request.user,"head":img})

@login_required
def crond(request):
    img = 'media/' +  str(request.user.head_img)
    return  render(request,'crond.html',{"user":request.user,"head":img})

@login_required
def script(request):
    img = 'media/' +  str(request.user.head_img)
    return  render(request,'script.html',{"user":request.user,"head":img})

@login_required
def command(request):
    img = 'media/' +  str(request.user.head_img)
    return  render(request,'command.html',{"user":request.user,"head":img})

@login_required
def fileup(request):
    img = 'media/' +  str(request.user.head_img)
    return  render(request,'fileup.html',{"user":request.user,"head":img})

@login_required
def filedown(request):
    img = 'media/' +  str(request.user.head_img)
    return  render(request,'filedown.html',{"user":request.user,"head":img})

@login_required
def zabbix_host(request):
    img = 'media/' +  str(request.user.head_img)
    hosts =  zabbix.host_list()
    # print hosts
    return  render(request,'zabbix_host.html',{"user":request.user,"head":img,"hosts": hosts})

@login_required
def zabbix_host_monitor(request):
    img = 'media/' +  str(request.user.head_img)
    # hosts =  zabbix.host_list()
    # print hosts
    return  render(request,'zabbix_host_monitor.html',{"user":request.user,"head":img})

def test(request):

    return JsonResponse({"msg":"","code":"0","data":[{"inner_ip":request.GET.get("IP")}]})
