#!/usr/bin/env python
# coding:utf-8
import paramiko, re, socket, os, sys, json, time
from ssh_error import SSHError
from .. import ssh_settings
from ssh import SSH_SSH
import redis
r = redis.StrictRedis(host=ssh_settings.redisip, port=ssh_settings.redisport, db=0)


class SSHCrontab(object):
    def __init__(self):
        pass

    def get_crontab_list(self, server_info):
        collect_time = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())
        ssh_info = {"content": "", "status": False}
        cmd = "/usr/bin/crontab -l"
        # crontab_data={server_info["alias"]:{}}
        crontab_data = {}
        try:
            ssh = SSH_SSH()
            status = ssh.login(**server_info)
            if not status["status"]:

                raise SSHError(status["content"])
            else:

                data = ssh.execute(cmd, ignore=True)
                if not data["status"]:
                    raise SSHError(data["content"])
                else:
                    # print "结果:",data["content"]
                    crontab_list = data["content"]
                    id = 0
                    # crontab_list="\n".join(crontab_list.split('\n')[1:][:-1])
                    crontab_list = "\n".join(crontab_list.split('\n')[1:][:-1])
                    # print crontab_list,555555555555555555555555555555555555555
                    # print crontab_list.split('abcded'),555555555555555555555555555555555555555
                    for line in crontab_list.split('\n'):
                        id += 1
                        if re.search('^ *#', line):
                            continue
                        elif re.search('^ *$', line):
                            continue
                        try:
                            crontab_time = " ".join(line.split()[:5])
                            crontab_cmd = " ".join(line.split()[5:][:-1])
                            if len(crontab_cmd) == 0:
                                if not len(line.split()) == 6:
                                    continue
                                else:
                                    crontab_cmd = " ".join(line.split()[5:])

                            crontab_dest = line.split("#")[-1]
                            crontab_data[id] = {"time": crontab_time, "cmd": crontab_cmd, "dest": crontab_dest,
                                                "collect_time": collect_time, "sid": server_info["id"],
                                                "ip": server_info["ip"]}
                        except Exception, e:
                            print "报错了", str(e)
                            pass
            ssh_info["content"] = crontab_data
            ssh_info["status"] = True
        except Exception, e:
            ssh_info["content"] = str(e)
            ssh_info["status"] = False
        return ssh_info
