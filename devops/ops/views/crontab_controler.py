#!/usr/bin/env python
# coding:utf-8
import paramiko, re, socket, os, sys, json, time,redis
from ssh_error import SSHError
from .. import ssh_settings
from ssh_thread_queue import SSHPool
from ssh import SSH_SSH
from crontab import SSHCrontab
from ssh_modol_controler import SSHControler

r = redis.StrictRedis(host=ssh_settings.redisip, port=ssh_settings.redisport, db=0)

class SSHCrontabControler(object):
    def __init__(self):
        pass

    def get_all_server_data(self):
        # server_config.objects.all()
        servers_list = r.lrange("server", 0, -1)
        tmp = []
        for line in servers_list:
            line = json.loads(line)
            tmp.append(line)

        return tmp

    def run(self):
        data = self.get_all_server_data()
        pool = SSHPool()
        for server_conf in data:
            pool.add_task(self.start_collect, server_conf)
        pool.all_complete()
    def start_collect(self, **server_conf):
        self.all_crontab_data = {}
        a = SSHCrontab()
        data = a.get_crontab_list(server_conf)
        print data["content"], server_conf["ip"]
        if data["status"]:
            self.save_crontab_list(data["content"], server_conf["ip"])

    def save_crontab_list(self, crontab, ip):

        crontab = json.dumps(crontab, encoding="utf8", ensure_ascii=False)
        r.hset('cronjob', ip, crontab)

    def get_crontab_list_to_web(self):
        ssh_info = {"content": {}, "status": True}
        data = r.hgetall("cronjob")
        for key in data.keys():
            ssh_info["content"][key] = json.loads(data[key])
        return ssh_info

    def save_crontab_to_server(self,action="create/modify", data={}):
        ssh_info = {"status": False, "content": ""}
        crontab_format = "{runtime} {cmd} #{dest}".format(runtime=data["runtime"], cmd=data["cmd"], dest=data["dest"])
        now_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        try:
            ssh = SSH_SSH()
            conf = SSHControler().convert_id_to_ip(data["ip"])
            if not conf["status"]:
                raise SSHError(conf["content"])
            a = ssh.login(**conf["content"])
            if a["status"]:
                username = conf["content"]["user"]
                path = os.path.join("/var/spool/cron/", username)
                if action == "modify":
                    info = ssh.execute("sed -i '{id}s/.*/{crontab_format}/' {path}".format(id=data["sid"], path=path,
                                                                                           crontab_format=crontab_format))
                    if not info["status"]:
                        raise SSHError(info["content"])
                    old_data = r.hget("cronjob", data["ip"])
                    if old_data is None:
                        old_data = {}
                    else:
                        old_data = json.loads(old_data)

                    data_line = {"time": data["runtime"], "dest": data["dest"], "cmd": data["cmd"], "sid": data["sid"],
                                 "ip": data["ip"], "collect_time": now_time}
                    line_count = data["tid"]
                else:
                    info = ssh.execute(
                        """ echo  '{crontab_format}' >>{path} """.format(crontab_format=crontab_format,path=path))
                    if not info["status"]:
                        raise SSHError(info["content"])
                    info = ssh.execute(""" cat {path}|wc -l  """.format(path=path))
                    if not info["status"]:
                        raise SSHError(info["content"])
                    line_count = info["content"].split("\r\n")[1]
                    old_data = r.hget("cronjob", data["ip"])
                    if old_data is None:
                        old_data = {}
                    else:
                        old_data = json.loads(old_data)
                    data_line = {"time": data["runtime"], "dest": data["dest"], "cmd": data["cmd"], "sid": data["sid"],
                                 "ip": data["ip"], "collect_time": now_time}

                old_data[line_count] = data_line
                _old_data = json.dumps(old_data, encoding="utf8", ensure_ascii=False)
                r.hset("cronjob", data["ip"], _old_data)
                ssh_info = {"status": True, "content": old_data}
            else:
                ssh_info["content"] = a["content"]
                old_data = {}
        except Exception, e:
            ssh_info = {"content": str(e), "status": False}
        return ssh_info

    def delete_crontab(self,sid, tid):
        ssh_info = {"content": "", "status": False}
        ssh = SSH_SSH()
        conf = SSHControler().convert_id_to_ip(sid)
        try:
            if not conf["status"]:
                raise SSHError(conf["content"])
            a = ssh.login(**conf["content"])
            if a["status"]:
                info = ssh.execute("whoami")
                if info["status"]:
                    user = info["content"].split("\n")[1:][:-1][0]
                    path = os.path.join("/var/spool/cron/", user)
                    info = ssh.execute("sed -i '{id}s/.*/#/' {path}".format(id=tid, path=path))
                    if not info["status"]:
                        raise SSHError(info["content"])
                    else:
                        data = r.hget("cronjob", conf["content"]["ip"])
                        data = json.loads(data)
                        del data[tid]
                        data = json.dumps(data, encoding="utf8", ensure_ascii=False)
                        r.hset("cronjob", conf["content"]["ip"], data)
                        ssh_info["status"] = True
            else:
                ssh_info["content"] = a["content"]
        except Exception, e:
            ssh_info["status"] = False
            ssh_info["content"] = str(e)

        print ssh_info
        return ssh_info


if __name__ == '__main__':
    A = SSHCrontabControler()
    A.run()
