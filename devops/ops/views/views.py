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
from .. import ssh_settings
from .. import  models
from ssh_file_transfer import  SSHFileTransfer
from ssh_thread_queue import  SSHThreadAdmin
from return_http import  ajax_http
from ssh_error import  SSHError
from client_info import  resolv_client
from ssh_file import File
from ssh_script import SSHScript
from crontab_controler import  SSHCrontabControler
from remote_file import  RemoteFile
import ssh_modol_controler,threading,cpu,mem,hashlib,datetime,redis,random,commands,time
import simplejson as json
import demjson

r = redis.StrictRedis(host=ssh_settings.redisip, port=ssh_settings.redisport, db=0)
img = '../static/img/cd-avatar.png'
global  img

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
            models.UserInfo.objects.filter(user=username).update(uptime=time.strftime('%Y-%m-%d %H:%M:%S'),alive=1)
            request.session['username'] = username
            return  HttpResponseRedirect(reverse('ops_index'))

        else:
            #block the error ip
            r.lpush("lock",ip)
            models.UserLock.objects.create(user=username, ip=ip, uptime=datetime.datetime.now())
            if r.lrange("lock",0,-1).count(ip) >5:
                models.UserLock.objects.update(user=username, ip=ip, uptime=time.strftime('%Y-%m-%d %H:%M:%S'), status=0)
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
            try:
                models.HostInfo.objects.filter(ip=content['ip']).delete()
                r.hdel(id)
            except Exception,e:
                print e
        except Exception,e:
            print e

        return  HttpResponse(status=200)

###load all server config
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
            raise SSHError(e)

        r.set("progress.%s" % tid, json.dumps(data, encoding="utf8", ensure_ascii=False))
        if not parameters.has_key("sfile") or not parameters.has_key("dfile"): raise  ('aaaa not keys')
        sfile = os.path.join(ssh_settings.upload_dir, os.path.basename(parameters["sfile"]))
        dfile = parameters["dfile"]
        if not type(parameters) == type({}): raise Exception ('type error')
        host = ssh_modol_controler.SSHControler().convert_id_to_ip(parameters["ip"])
        if  host["status"] == 'False': raise Exception( host["content"])
        host = host['content']
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
@ajax_http ##allow origin access
def get_filetrans_progress(request):
    tid = request.GET.get("tid")
    ssh_info = SSHFileTransfer().get_progress(tid)
    return ssh_info

###remote download file
@ajax_http
def remote_download(request):
    tid = str(random.randint(90000000000000000000, 99999999999999999999))
    ssh_info = {"status": False, "content": ""}
    try:
        parameters = request.GET.get('parameters')

        try:
            parameters = json.loads(parameters)
        except Exception, e:
            raise SSHError("CHB0000000008")
        if not type(parameters) == type({}): raise SSHError("not parameter args")

        data = {"tid": tid, "progress": 0, "content": "", "status": True}
        r.set("progress.%s" % tid, json.dumps(data, encoding="utf8", ensure_ascii=False))

        if not parameters.has_key("sfile"): raise SSHError("no such sfile")
        sfile = parameters["sfile"]
        host = ssh_modol_controler.SSHControler().convert_id_to_ip(parameters["ip"])
        if not host["status"]: raise SSHError(host['content'])
        host = host['content']
        ip = host["ip"]
        dfile_name = "{ip}.{tid}.{filename}".format(ip=ip, tid=tid,
                                                       filename=os.path.basename(parameters["sfile"]))
        dfile_full_path = os.path.join(ssh_settings.download_dir, dfile_name)
        sftp = SSHFileTransfer()
        login = sftp.login(**host)
        if not login["status"]: raise SSHError(login["content"])
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
@ajax_http
def create_tgz_pack(request):
    tid = str(random.randint(90000000000000000000, 99999999999999999999))
    ssh_info = {"status": False, "content": ""}
    try:
        files = request.GET.get("files")
        try:
            files = json.loads(files)
        except Exception, e:
            raise SSHError("CHB0000000020")
        if not type(files) == type([]): raise SSHError("not file")

        os.chdir(ssh_settings.download_dir)
        filename = "%s.tgz" % tid
        cmd = "tar zcvf {filename} {files}".format(filename=filename, files=" ".join(files))
        data = commands.getstatusoutput(cmd)
        if data[0]:
            raise SSHError("打包失败", data[1])
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

@ajax_http
def execute_command(request):
        ssh_info = {"status": False, 'content': ""}
        try:
            id = str(random.randint(90000000000000000000, 99999999999999999999))
            parameter = request.POST.get("parameters") or request.GET.get("parameters")
            if not parameter:
                raise SSHError("not parameter")
            try:
                parameter = json.loads(parameter)
            except:
                raise SSHError("json parameter error")
            try:
                servers = parameter["servers"]
                cmd = parameter["cmd"]
            except:
                raise SSHError("not servers and cmd args")

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
                    host_list = ssh_modol_controler.SSHControler().convert_id_to_ip(ip)
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
                raise SSHError("progress get bad")

            ssh_info["progress"] = progress
            log_name = "log.%s.%s" % (tid, ip)
            LLEN = r.llen(log_name)
            if not LLEN == 0:
                for i in range(LLEN):
                    _content = r.lpop(log_name)
                    _content = json.loads(_content)
                    content += _content["content"]
                    ssh_info["content"] = {"content": content, "stage": _content["stage"],
                                                 "status": _content["status"]}
            ssh_info["status"] = True
        except Exception, e:
            ssh_info["status"] = False
            ssh_info["content"] = str(e)

        return  ssh_info

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


@ajax_http
def upload_script(request):
    ssh_info = {"status": False, "content": ""}
    if request.method == "POST":
        try:
            if len(r.hgetall("scripts")) >= 9: raise SSHError("scripts")
            filename = str(request.FILES.get("file"))
            _data = r.hget("scripts", filename)
            if _data is None:
                pass
            else:
                data = json.loads(_data)
                if filename == data["script"]:
                    raise SSHError("您的操作不被允许!存在同名脚本!")
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

@ajax_http
def get_script_content(request):
	filename=request.GET.get("filename")
	full_path=os.path.join(ssh_settings.script_dir,filename)
	return File().get_content(full_path)


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


    return demjson.encode(ssh_info)

@ajax_http
def write_script_content(request):
	ssh_info={"status":False,"content":""}
	_filename=request.POST.get('filename')
	filename=os.path.basename(_filename)
	filecontent=request.POST.get("content")
	try:
		if len(r.hgetall("scripts"))>=9:raise SSHError("scripts")
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
				raise SSHError("您的操作不被允许!存在同名脚本!")
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
			if filename==data["script"] :
				r.hdel("scripts",filename)
				try:
					os.remove(full_path)
					print "delte.."
				except:
					pass
		ssh_info["status"]=True
	except Exception,e:
		ssh_info["content"]=str(e)
		ssh_info["status"]=False
	return ssh_info


@ajax_http
def execute_command(request):
    ssh_info = {"status": False, 'content': ""}
    try:
        id = str(random.randint(90000000000000000000, 99999999999999999999))
        parameter = request.POST.get("parameters") or request.GET.get("parameters")
        if not parameter:
            raise SSHError("not parameter")
        try:
            parameter = json.loads(parameter)
        except:
            raise SSHError("json parameter error")
        try:
            servers = parameter["servers"]
            cmd = parameter["cmd"]
        except:
            raise SSHError("not server and cmd args")
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
                host_list = ssh_modol_controler.SSHControler().convert_id_to_ip(ip)
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

@ajax_http
def get_command_result(request):
	ssh_info={"content":{"content":"","stage":"running","status":None}, "status":True,"progress":0}
	tid=request.GET.get("tid")
	ip=request.GET.get("ip")
	content=""
	try:
		total=r.get("total.%s" % tid)
		current=r.get("current.%s" % tid)
		try:
			if total is None or current is None: progress=0
			else:progress= "%0.2f"  % (float(current) / float(total) * 100)
		except Exception,e:
			raise SSHError("progress get bad")
		ssh_info["progress"]=progress
		log_name="log.%s.%s" % (tid,ip)
		LLEN=r.llen(log_name)
		if not LLEN==0:
			for i in range(LLEN):
				_content=r.lpop(log_name)
				_content=json.loads(_content)
				content+=_content["content"]
				ssh_info["content"]={"content":content,"stage":_content["stage"],"status":_content["status"]}
		ssh_info["status"]=True
	except Exception,e:
		ssh_info["status"]=False
		ssh_info["content"]=str(e)
	return ssh_info

@ajax_http
def script_init(request):
    ip=request.GET.get("ip")
    sfile=request.GET.get("sfile")
    return SSHScript().script_init(ip,sfile)

@ajax_http
def save_crontab_to_server(request):
    action=request.POST.get("action")
    data=request.POST.get("data")
    data=json.loads(data)
    return SSHCrontabControler().save_crontab_to_server(action,data)

@ajax_http
def get_crontab_list(request):
	return SSHCrontabControler().get_crontab_list_to_web()

@ajax_http
def delete_crontab_list(request):
	sid=request.GET.get("sid")
	tid=request.GET.get("tid")
	return SSHCrontabControler().delete_crontab(sid,tid)

@ajax_http
def get_remote_file_list(request):
	return RemoteFile().get_remote_file_list()


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

@ajax_http
def get_remote_file_opt(request):
    id=request.GET.get("tid")
    action=request.GET.get('action')
    action="GET"
    return RemoteFile().remote_file_content(id,action)


@ajax_http
def write_remote_file_opt(request):
    action = "WRITE"
    id = request.POST.get("tid")
    file_content = request.POST.get("content")
    if not file_content.endswith('\n'):
        file_content = "%s\n" % file_content
    return RemoteFile().remote_file_content(id, action, file_content)

@ajax_http
def delete_remote_file_list(request):
	id=request.GET.get("id")
	return RemoteFile().delete_remote_file_list(id)

def remotefile(request):
    return  render(request,'remotefile.html',{"user":request.session.get('username'),"head":img})

def crond(request):
    return  render(request,'crond.html',{"user":request.session.get('username'),"head":img})

def script(request):
    return  render(request,'script.html',{"user":request.session.get('username'),"head":img})

def command(request):
    return  render(request,'command.html',{"user":request.session.get('username'),"head":img})

def fileup(request):
    return  render(request,'fileup.html',{"user":request.session.get('username'),"head":img})

def filedown(request):
    return  render(request,'filedown.html',{"user":request.session.get('username'),"head":img})
