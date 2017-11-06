#!/usr/bin/env python
# coding:utf8
import os, sys, threading
from .. import ssh_settings
from ssh_error import SSHError
from ssh_file_transfer import SSHFileTransfer
import ssh_module_controller, random
from ssh import SSH_SSH


class SSHScript(object):
    def __init__(self):
        pass
    def script_init(self,ip, sfile):
        sfile = sfile.encode("utf-8")
        ssh_info = {"content": "", "status": False}
        tid = str(random.randint(90000000000000000000, 99999999999999999999))
        try:
            sfile = os.path.join(ssh_settings.script_dir,  os.path.basename(sfile))
            dfile = os.path.join('/tmp/', tid)
            host = ssh_module_controller.SSHControler().convert_id_to_ip(ip)
            if not host["status"]: raise SSHError(host['content'])
            _host_info = host['content']
            sftp = SSHFileTransfer()
            login = sftp.login(**_host_info)
            if not login["status"]: raise SSHError(login["content"])

            _tmp_data = {"status": True, "content": "", "progress": "0", "tid": tid}
            sftp.write_progress(_tmp_data)
            t = threading.Thread(target=sftp.upload, args=(sfile, dfile, tid))
            t.start()
            ssh_info["status"] = True
            ssh_info["tid"] = tid
            ssh_info["dfile"] = dfile
        except Exception, e:
            ssh_info["status"] = False
            ssh_info["content"] = str(e)

        return ssh_info

    def deployment_script_init_and_execute(self,ip, sfile):
        ssh_info = {"content": "", "status": False}
        tid = str(random.randint(90000000000000000000, 99999999999999999999))
        try:
            sfile = os.path.join(ssh_settings.script_dir,  os.path.basename(sfile))
            dfile = os.path.join('/tmp/', tid)
            host = ssh_module_controller.SSHControler().convert_id_to_ip(ip)
            if not host["status"]: raise SSHError(host['content'])
            _host_info = host['content']
            sftp = SSHFileTransfer()
            login = sftp.login(**_host_info)
            if not login["status"]:
                print login["content"], "登录失败"
                raise SSHError(login["content"])
            ssh_info = sftp.upload(sfile, dfile, "")
            sftp.logout()
            if not ssh_info["status"]: raise SSHError(ssh_info["content"])
            ssh_info["dfile"] = dfile
            ssh = SSH_SSH()
            login = ssh.login(**_host_info)
            if not login["status"]: raise SSHError(login["content"])
            ssh_info = ssh.execute(dfile, ignore=True)
            ssh.logout()
        except Exception, e:
            ssh_info["status"] = False
            ssh_info["content"] = str(e)
        return ssh_info
