#!/usr/bin/env python
#coding:utf-8
import os,sys,json,redis
from ssh import SSH_SSH
from ssh_error import  SSHError
import threading
import ssh_settings
r = redis.StrictRedis(host=ssh_settings.redisip, port=ssh_settings.redisport, db=0)
class SSHControler(object):
    def __init__(self):
        self.SSH = SSH_SSH()


    def controler_center(self, parameter={}):
        cmd = parameter.get("cmd", False)
        tid = parameter["tid"]
        pass


    def connect(self, ip=""):
        ssh_info = {"content": "", "status": False}
        try:
            server_config = self.convert_id_to_ip(ip)
            # print server_config
            if not server_config["status"]: raise SSHError(server_config["content"])
            if server_config["status"]:
                ssh_info = self.SSH.login(**server_config["content"])
            else:
                ssh_info["content"] = server_config["content"]
        except Exception, e:
            print "ssh错误", str(e)
            ssh_info["content"] = str(e)
            ssh_info["status"] = False
        return ssh_info


    def command_controler(self, tid='', cmd='', ip=""):
        log_name = "log.%s.%s" % (tid, ip)
        log_content = {
            "content": "",
            "stage": "done",
            "status": False,
         }
        ssh_info = {"content": "", "status": False}
        try:
            current = "current.%s" % tid
            data = self.connect(ip=ip)
            if data["status"]:
                ssh = data["content"] ###登录界面
                self.SSH.execute(cmd=cmd, ip=ip, tid=tid)
                ssh_info["status"] = True
            else:
                raise SSHError(data["content"])
        except Exception, e:
            print "程序错误", e,'controller'
            log_content["content"] = str(e)
            log_content = json.dumps(log_content, encoding="utf8", ensure_ascii=False)
            r.rpush(log_name, log_content)
            ssh_info["content"] = str(e)
            ssh_info["status"] = False
            print ssh_info,'60'

        r.incr(current)
        return ssh_info

    # @staticmethod
    def convert_id_to_ip(self,ip=""):
        ssh_info = {"status": False, "content": "指定的ID不存在"}
        try:
            servers_list = r.lrange("server", 0, -1)
            if servers_list is None:
                pass
            else:
                for _line in servers_list:
                    line = json.loads(_line)
                    if str(ip) ==  line["ip"]:
                        ssh_info["content"] = line
                        ssh_info["status"] = True
                        break
        except Exception, e:
            ssh_info["status"] = False
            ssh_info["content"] = str(e)
        return ssh_info
