#!/usr/bin/env python
# coding:utf-8
import os, sys, json, time, paramiko, random, functools, socket,redis
from ssh_error import SSHError
from .. import ssh_settings

r = redis.StrictRedis(host=ssh_settings.redisip, port=ssh_settings.redisport, db=0)
class SSHFileTransfer(object):
    def __init__(self):
        pass

    def login(self, ip='', user='', password='', port=22, lg_type='', keyfile='', **kws):
        self.username = user
        self.password = password
        self.port = port
        self.lg_type = lg_type
        self.ip = ip
        self.keyfile = os.path.join(ssh_settings.keyfile_dir,  keyfile)
        self.port = port

        ssh_info = {"status": False, "content": ""}
        try:
            ssh = paramiko.Transport((self.ip, int(self.port)))
            if lg_type == "password":
                ssh.connect(username=self.user, password=self.password)
            else:
                if self.keyfile :
                    key = paramiko.RSAKey.from_private_key_file(self.keyfile)
                else:
                    key = paramiko.RSAKey.from_private_key_file(self.keyfile)
                ssh.connect(username=self.username, pkey=key)
            sftp = paramiko.SFTPClient.from_transport(ssh)
            self.ssh = ssh
            self.sftp = sftp
            self.get_username_to_uid()
            self.get_groupname_to_gid()
            ssh_info["status"] = True
        except socket.error:
            ssh_info["content"] = "连接错误"
        except socket.timeout:
            ssh_info["content"] = "连接端口超时"
        except socket.gaierror:
            ssh_info["content"] = "无法联系上这个主机"
        except paramiko.ssh_exception.AuthenticationException:
            ssh_info["content"] = "账号或者密码错误"
        except paramiko.ssh_exception.BadAuthenticationType:
            if  lg_type == 'key':
                ssh_info["content"] = "认证类型应该是密码"
            else:
                ssh_info["content"] = "认证类型应该是秘钥"
        except Exception, e:
            print (e)
            print "报错信息", str(e)
            ssh_info["status"] = False
            print ssh_info
        return ssh_info

    def upload(self, local_file='', remote_file='', tid=""):
        local_file = local_file.encode('utf-8')
        transfer_type = "upload"
        self.transfer_type = "upload"
        ssh_info = {"status": False, "content": ""}
        try:
            if os.path.isdir(local_file):
                raise SSHError("dir not exits")
            else:
                if remote_file.endswith('/'):
                    try:
                        self.sftp.listdir(remote_file)
                        remote_file = os.path.join(remote_file, os.path.basename(local_file))
                    except Exception, e:
                        raise SSHError(e)
                else:
                    try:
                        self.sftp.listdir(remote_file)

                        remote_file = os.path.join(remote_file, os.path.basename(local_file))
                    except Exception, e:
                        pass
                data = {"tid": tid, "content": "", "status": True}
                callback = functools.partial(self.set_progress, data)
                print "本地文件路径:", local_file
                self.sftp.put(local_file, remote_file, callback=callback)
                self.sftp.chmod(remote_file, 0755)
                ssh_info["remote_file"] = remote_file
                ssh_info["local_file"] = local_file
                ssh_info["transfer_type"] = transfer_type
                ssh_info["tid"] = tid
                ssh_info["progress"] = 0
                ssh_info["status"] = True

        except Exception, e:
            if hasattr(e, "errno"):
                if e.errno == 2:
                    ssh_info["content"] = "指定的源文件路径不存在"
            else:
                ssh_info["content"] = str(e)
            ssh_info["status"] = False
            ssh_info["tid"] = tid
            # r.set("progress.%s" % tid, json.dumps(ssh_info, encoding="utf8", ensure_ascii=False))
        return ssh_info

    def download(self, remote_file='', local_file='', tid=""):
        transfer_type = "download"
        self.transfer_type = "download"
        ssh_info = {"status": False, "content": ""}
        try:
            _local_file = os.path.basename(local_file)
            local_file = os.path.join(ssh_settings.download_dir, _local_file)
            if os.path.isfile(local_file): local_file = "%s_%s" % (local_file, self.ip)
            try:
                self.sftp.listdir(remote_file)
            except Exception, e:

                try:
                    data = {"tid": tid, "content": "", "status": True}
                    callback = functools.partial(self.set_progress, data)
                    self.sftp.get(remote_file, local_file, callback=callback)
                    ssh_info["remote_file"] = remote_file
                    ssh_info["local_file"] = local_file
                    ssh_info["transfer_type"] = transfer_type
                    ssh_info["tid"] = tid
                    ssh_info["progress"] = 0
                    ssh_info["status"] = True
                except Exception, e:
                    if e == 2:
                        raise SSHError("源文件[%s]不存在" % remote_file)
                    else:
                        raise IOError(str(e))

        except Exception, e:
            if hasattr(e, "errno"):
                if e.errno is None:
                    ssh_info["content"] = "指定的源文件路径不存在"
            else:
                ssh_info["content"] = str(e)
            ssh_info["status"] = False
            ssh_info["tid"] = tid
            r.set("progress.%s" % tid, json.dumps(ssh_info, encoding="utf8", ensure_ascii=False))

        return ssh_info

    def get_username_to_uid(self):
        passwd_file = self.sftp.open("/etc/passwd")
        user_info = passwd_file.readlines()
        passwd_file.close()
        self.username_to_uid = {}
        for _line in user_info:
            line = _line.strip().split(":")
            username = line[0]
            uid = line[2]
            self.username_to_uid[username] = uid

    def get_groupname_to_gid(self):
        group_file = self.sftp.open("/etc/group")
        group_info = group_file.readlines()
        group_file.close()
        self.groupname_to_gid = {}
        for _line in group_info:
            line = _line.strip().split(":")
            groupname = line[0]
            gid = line[2]
            self.groupname_to_gid[groupname] = gid

    def chmod(self, file, permission_code):

        ssh_info = {"status": False, "content": ""}
        try:
            self.sftp.chmod(file, permission_code)
            ssh_info["status"] = True
        except Exception, e:
            ssh_info["content"] = str(e)
        return ssh_info

    def chown(self, file, owner='', group=''):
        ssh_info = {"status": False, "content": ""}
        uid = self.username_to_uid[owner]
        if len(group) == 0: group = owner
        gid = self.groupname_to_gid[group]
        try:
            self.sftp.chown(file, uid, gid)
            ssh_info["status"] = True
        except Exception, e:
            ssh_info["status"] = False
            if e.errno == 13:
                ssh_info["content"] = "权限拒绝"
            else:
                ssh_info["content"] = str(e)
        return ssh_info

    def set_progress(self, data, current_size, all_size):

        tid = data["tid"]
        progress = "%0.2f" % (float(current_size) / float(all_size) * 100)
        data["progress"] = progress
        self.write_progress(data)
        print '当前进度', progress, tid

    def write_progress(self, data):
        tid = data["tid"]
        data = json.dumps(data, encoding="utf8", ensure_ascii=False)
        r.set("progress.%s" % tid, data)

    def get_progress(self,tid):
        ssh_info = r.get("progress.%s" % tid)
        if ssh_info is None:
            ssh_info = {}
            ssh_info["status"] = False
            ssh_info["content"] = "err"
        else:
            ssh_info = json.loads(ssh_info)
        print ssh_info,'214'
        return ssh_info

    def logout(self):
        try:
            self.ssh.close()
            print "已经注销"
        except:
            pass

    def get_filecontent(self, filename):
        ssh_info = {"content": "", "status": False}
        try:
            a = self.sftp.open(filename)
            content = "".join(a.readlines())
            ssh_info["content"] = content
            a.close()
            ssh_info["status"] = True
        except Exception, e:
            ssh_info["status"] = False
            ssh_info["content"] = str(e)
        return ssh_info

    def write_filecontent(self, filename, content):
        ssh_info = {"content": "", "status": False}
        try:
            print 111111, filename, content
            a = self.sftp.open(filename, "w")
            print 22222222222
            a.write(content)
            print 3333333333
            a.close()
            print 4444444444
            ssh_info["status"] = True
        except Exception, e:
            ssh_info["status"] = False
            ssh_info["content"] = str(e)
        return ssh_info

    def __del__(self):
        self.logout()