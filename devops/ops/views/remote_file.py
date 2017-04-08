#!/usr/bin/env python
# coding:utf8
import sys, json, os, re,redis
from .. import ssh_settings
from ssh_error import SSHError
from  ssh_file_transfer import SSHFileTransfer
from ssh_modol_controler import SSHControler
r = redis.StrictRedis(host=ssh_settings.redisip, port=ssh_settings.redisport, db=0)
class RemoteFile(object):
    def __init__(self):
        pass

    def add_remote_file(self,path='', description='', server='', id='', ip=''):
        ssh_info = {"status": False, "content": ""}
        try:
            data = {"path": path, "description": description, "server": server, "id": id,
                    "ip": ip}
            data = json.dumps(data, encoding="utf8", ensure_ascii=False)
            r.hset("remotefilelist", id, data)
            ssh_info["tid"] = id
            ssh_info["status"] = True
        except Exception, e:
            ssh_info["status"] = False
            ssh_info["content"] = str(e)

        return ssh_info

    def get_remote_file_list(self):
        ssh_info = {"status": False, "content": ""}
        try:
            data = r.hgetall("remotefilelist")
            print data
            info = {}
            for id in data.keys():
                tmp = json.loads(data[id])
                info[id] = tmp

            ssh_info["content"] = info
            ssh_info["status"] = True
        except Exception, e:
            ssh_info["status"] = False
            ssh_info["content"] = str(e)
        return ssh_info

    def delete_remote_file_list(self, id):

        ssh_info = {"status": False, "content": ""}
        try:
            data = r.hdel("remotefilelist", id)
            ssh_info["status"] = True
        except Exception, e:
            ssh_info["status"] = False
            ssh_info["content"] = str(e)
        return ssh_info

    def remote_file_content(self, id, action, file_content=""):

        ssh_info = {"status": False, "content": ""}
        try:
            data = RemoteFile().get_remote_file_list()
            if not data["status"]: raise SSHError(data["content"])
            content = data["content"]
            path = content[id]["path"]
            path = re.sub(" ", "", path)
            ip = content[id]["ip"]
            host_info = SSHControler().convert_id_to_ip(ip)
            if not host_info["status"]: raise SSHError(host_info["content"])
            host = host_info["content"]
            sftp = SSHFileTransfer()
            login = sftp.login(**host)
            if not login["status"]: raise SSHError(login["content"])
            if action == "GET":
                ssh_info = sftp.get_filecontent(path)
            elif action == "WRITE":
                ssh_info = sftp.write_filecontent(path, file_content)
            else:
                raise SSHError("remotefilelist")
        except Exception, e:
            ssh_info["status"] = False
            ssh_info["content"] = str(e)
        return ssh_info