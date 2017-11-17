#-*- coding=utf8 -*-
#/usr/bin/python env
import paramiko,os,sys
reload(sys)
sys.setdefaultencoding("utf-8")
from paramiko.ssh_exception import AuthenticationException, SSHException
from tornado.websocket import WebSocketClosedError
from ioloop import IOLoop
sys.path.append('/Users/wupeijin/code3/django-tornado/devops/ops/views')
from ssh_settings import keyfile_dir



class Bridge(object):

    def __init__(self, websocket):
        self._websocket = websocket
        self._shell = None
        self._id = 0
        self.ssh = paramiko.SSHClient()
        self.key = None

    @property
    def id(self):
        return self._id

    @property
    def websocket(self):
        return self._websocket

    @property
    def shell(self):
        return self._shell

    def open(self, data={}):
        self.ssh.set_missing_host_key_policy(
            paramiko.AutoAddPolicy())
        try:
            print data
            if data['login_type'] == "密码方式":
                self.ssh.load_system_host_keys()
                self.ssh.connect(
                    hostname=data["hostname"],
                    port=int(data["port"]),
                    username=data["username"],
                    password=data["password"],
                    # pkey=self.key
                )
            else:
                keyfile = keyfile_dir + '/' + data['key']
                # self.key = paramiko.RSAKey.from_private_key_file('/Users/wupeijin/key/sparkpad_root')
                self.ssh.load_system_host_keys()
                self.ssh.connect(
                    hostname=data["hostname"],
                    port=int(data["port"]),
                    username=data["username"],
                    # password=data["password"],
                    pkey = paramiko.RSAKey.from_private_key_file(keyfile)
                )
        except AuthenticationException:
            raise Exception("auth failed user:%s ,passwd:%s" %
                            (data["username"], data["password"]))
        except SSHException:
            raise Exception("could not connect to host:%s:%s" %
                            (data["hostname"], data["port"]))

        self.establish()

    def establish(self, term="xterm"):
        self._shell = self.ssh.invoke_shell(term)
        self._shell.setblocking(0)

        self._id = self._shell.fileno()
        IOLoop.instance().register(self)
        IOLoop.instance().add_future(self.trans_back())

    def trans_forward(self, data=""):
        if self._shell:
            self._shell.send(data)

    def trans_back(self):
        yield self.id
        connected = True
        while connected:
            result = yield
            if self._websocket:
                try:
                    self._websocket.write_message(result)
                except WebSocketClosedError:
                    connected = False
                if result.strip() == 'logout':
                    connected = False
        self.destroy()

    def destroy(self):
        self._websocket.close()
        self.ssh.close()
