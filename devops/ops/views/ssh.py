#!/usr/bin/env python
# -*- coding: utf-8 -*-
import paramiko, re, socket,logging
import os,sys,json,time,redis
reload(sys)
sys.setdefaultencoding("utf-8")
logger = logging.getLogger('django')
from ssh_error import SSHError
import ssh_settings,re
r = redis.StrictRedis(host=ssh_settings.redisip, port=ssh_settings.redisport, db=0)

class SSH_SSH(object):
    def __init__(self):
        self.base_prompt = r'(>|#|\]|\$|\)) *$'
        self.active = False
        self.prompt = ""

    def login(self, **kws):
        ssh_info = {"status": False, "content": ""}
        try:
            self.username = kws["user"]
            self.password = kws["pwd"]
            self.port = kws["port"]
            self.lg_type = kws["lg_type"]
            self.ip = kws["ip"]
            self.keyfile = os.path.join(ssh_settings.keyfile_dir,  kws["key"])
            self.sudo = kws["us_sudo"]
            self.sudo_password = kws["sudo"]
            self.su = kws["us_su"]
            self.su_password = kws["su"]
            self.port = int(self.port)
            ssh = paramiko.SSHClient()
            if str(self.lg_type) == str("密码方式"):
                ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy()) ##allow  host not in  know_host
                ssh.connect(self.ip, self.port, self.username, self.password)
            else:
                key = paramiko.RSAKey.from_private_key_file(self.keyfile)
                ssh.load_system_host_keys()
                ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
                ssh.connect(self.ip, self.port, self.username, pkey=key)
            self.channel = ssh
            self.shell = ssh.invoke_shell(width=1000, height=1000)
            self.active = True
            data = self.clean_buffer()
            if not data["status"]: raise SSHError(data["content"])
            if self.sudo == "Y":
                _sudo = sudo_login()
                if _sudo["status"]:
                    pass
                else:
                    raise SSHError(_sudo["content"])
            elif self.su == "Y":
                _su = su_login()
                if _su["status"]:
                    # self.get_prompt()
                    pass
                else:
                    raise SSHError(_su["content"])
            data = self.get_prompt()  # 换成设置统一prompt
            if not data["status"]:
                raise SSHError(data["content"])
            else:
                ssh_info["content"] = data["content"]
            ssh_info["status"] = True
        except KeyError, e:
            ssh_info["content"] = "缺少字段 %s" % str(e)
        except socket.error:
            ssh_info["content"] = "无法连接端口"
        except socket.gaierror:
            ssh_info["content"] = "无法联系上这个主机"
        except paramiko.ssh_exception.AuthenticationException:
            ssh_info["content"] = "账号或者密码错误"
        except paramiko.ssh_exception.BadAuthenticationType:
            if lg_type == 'key':
                ssh_info["content"] = "认证类型应该是密码"
            else:
                ssh_info["content"] = "认证类型应该是秘钥"
        except Exception, e:
            print str(e)
            ssh_info['status'] = False
            ssh_info['content'] = str(e)
        if re.search("not a valid RSA private key file", ssh_info["content"]):
            ssh_info["content"] = "无效的秘钥文件"
        return ssh_info

    def get_prompt(self):
        buff = ''
        ssh_info = {"status": False, "content": ""}
        try:
            self.shell.send('\n')
            while not re.search(self.base_prompt, buff.split('\n')[-1]):
                buff += self.shell.recv(1024)
            ssh_info["content"] = buff
            self.prompt = re.escape(buff.split('\n')[-1])
            ssh_info["status"] = True
        except Exception, e:
            ssh_info["content"] = "获取主机提示符错误:[%s]" % str(e)
            ssh_info["status"] = False
        return ssh_info

    def recv(self, ip="", tid="", ignore=False):
        buff = ''
        while not re.search(self.prompt, buff.split('\n')[-1]):
            _buff = self.shell.recv(10240)
            buff += _buff
            if not ignore: self.log(ip=ip, tid=tid, content_segment=_buff)
            time.sleep(0.1)
        return buff

    def disk_log(self, sid, content=""):
        pass

    def log(self, ip='', tid='', content_segment=""):

        log_name = "log.%s.%s" % (tid, ip)
        log_content = {
            "content": content_segment,
            "stage": "running",
            "status": None,
        }
        log_content = json.dumps(log_content, encoding="utf-8", ensure_ascii=False)
        r.lpush(log_name, log_content)

    def clean_buffer(self):
        ssh_info = {"status": False, "content": ""}
        try:
            if not self.active: raise SSHError("已经与主机断开连接")
            self.shell.send('\n')
            time.sleep(0.5)
            buff = ""
            while not re.search(self.prompt.split('\r\n')[-1], buff):
                buff += self.shell.recv(512)
            ssh_info["status"] = True
        except Exception, e:
            print "清除缓存失败", str(e)
            ssh_info["status"] = False
            ssh_info["content"] = str(e)
        return ssh_info

    def execute(self, cmd='', ip="", tid="", ignore=False):
        # print cmd,ip ,tid,'136'
        ssh_info = {"status": False, "content": ""}
        log_content = {
            "content": "",
            "stage": "done",
            "status": False,
        }
        try:
            if not self.active: raise SSHError("未能与主机建立连接")
            data = self.clean_buffer()
            if not data["status"]: raise SSHError(data["content"])
            self.set_prompt()
            log_name = "log.%s.%s" % (tid, ip)
            ### will return  have text  color
            if cmd == "ls":
                self.shell.send("ls --color=never\n")
            self.shell.send("%s\n" % cmd)
            ssh_info['content'] = self.recv(ip=ip, tid=tid)
            ### get the command result was success or failed
            self.shell.send("echo $?\n")
            _status = self.recv(ip=ip, tid=tid, ignore=True)
            status = re.search('echo \$\?\\r\\n(.*)\\r\\n%s' % self.prompt, _status).group(1)
            status = int(status)
            if status == 0:
                ssh_info["status"] = True
                log_content["status"] = True
            else:
                ssh_info["status"] = False
                r.rpush("command.logs",ssh_info)
        except Exception, e:
            ssh_info["status"] = False
            ssh_info["content"] = str(e)
            print e,'170 error'

        _log_content = json.dumps(log_content, encoding="utf-8", ensure_ascii=False)
        r.lpush(log_name, _log_content)

        if not ignore:
            log_content["content"] = ssh_info["content"]
            self.write_command_log(tid, log_content)
        return ssh_info

    def write_command_log(self, tid, log_content):
        try:
            history = r.lrange("command.history", -5, -1)
            for _line in history:
                line = json.loads(_line)
                if str(line["tid"]) == str(tid):
                    content = """%s</br>%s<hr style="border-bottom:1px solid #b0b0b0"/>""" % (line["content"], log_content["content"])
                    # content = """%s""" % (log_content["content"])
                    log_content["content"] = content
                    line = dict(line, **log_content)
                    # print line
                    # r.lrem("command.history", _line,0)
                    _line = json.dumps(line, encoding="utf8", ensure_ascii=False)
                    r.lpush("command.history", _line)
                # break
        except Exception, e:
            print "写入日志报错", str(e),'19777777'
            # pass

    def sudo_login(self):
        ssh_info = {"status": False, "content": ""}
        try:
            if self.username == "root": raise SSHError("root不能sudo")
            self.shell.send('sudo su - root\n')
            buff = ''
            _buff = ""
            while True:
                buff += self.shell.recv(1024)
                if re.search('\[sudo\] password for %s' % self.username, buff.split('\n')[-1]):
                    self.shell.send('%s\n' % self.sudo_password)
                    while True:
                        _buff += self.shell.recv(1024)
                        if re.search('Sorry, try again', _buff):
                            raise SSHError("sudo密码错误")
                        elif re.search('%s.*sudoers' % self.username, _buff):
                            raise SSHError("您的账户没有配置sudo权限")
                        elif re.search(self.base_prompt, _buff.split('\n')[-1]):

                            ssh_info["status"] = True
                            ssh_info["content"] = ""
                            return ssh_info
                elif re.search(self.base_prompt, buff.split('\n')[-1]):

                    ssh_info["status"] = True
                    return ssh_info
        except Exception, e:
            ssh_info["status"] = False
            ssh_info["content"] = str(e)
        return ssh_info

    def su_login(self):
        ssh_info = {"status": False, "content": ""}
        try:
            if self.username == "root": raise SSHError("您当前已经是超级管理员!")
            self.shell.send("su  - root\n")
            buff = ''
            _buff = ""
            while True:
                buff += self.shell.recv(1024)
                if re.search("password|密码", buff.split("\n")[-1]):
                    self.shell.send("%s\n" % self.su_password)
                    while True:
                        _buff += self.shell.recv(1024)
                        if re.search("^su", _buff.split("\n")[-2]):
                            raise SSHError("su密码错误")
                        elif re.search(self.base_prompt, _buff.split("\n")[-1]):
                            ssh_info["status"] = True
                            return ssh_info

        except Exception, e:
            ssh_info["status"] = False
            ssh_info["content"] = str(e)
        return ssh_info

    def set_prompt(self):
        self.shell.send("export PS1='[\u@\h]\$'\n")
        buff = ''
        while not re.search(self.base_prompt, buff.split('\n')[-1]):
            _buff = self.shell.recv(1024)
            buff += _buff
        self.prompt = re.escape(buff.split('\n')[-1])
        return buff

    def logout(self):
        try:
            self.channel.close()
            self.active = False
        except Exception, e:
            pass
        logger.info("已经注销ssh")

    def __del__(self):
        self.logout()

if __name__ == '__main__':
    print 'a'
