#!/usr/bin/env python
#coding:utf8
import os,sys,json,time,redis
reload(sys)
sys.setdefaultencoding("utf-8")
from ssh_error import SSHError
from ssh_thread_queue import SSHPool
from ssh import SSH_SSH
import ssh_settings
r = redis.StrictRedis(host=ssh_settings.redisip, port=ssh_settings.redisport, db=0)
class SSHCheck(object):
	def __init__(self,sid=""):
		self.sid = sid
		pass

	def run(self):
		servers_config_list=r.lrange("server",0,-1)
		if servers_config_list is None:
			return False
		_servers_list=[]
		for _server in servers_config_list:
			server=json.loads(_server)
			if len(self.sid)>0:
				if str(self.sid)==str(server["id"]):
					_servers_list.append(server)
			else:
				_servers_list.append(server)
		servers_config_list=_servers_list
		pool=SSHPool()
		### get the ssh result with server info put into queue
		for _server_line in servers_config_list:
			pool.add_task(self.ssh_check,_server_line)
		pool.all_complete()

	def ssh_check(self,**kws):
		ssh=SSH_SSH()
		data=ssh.login(**kws)
		data["time"]=time.strftime("%Y-%m-%d %H:%M:%S",time.localtime())
		if data["status"]:
			data["status"]="success"
			data["ip"] = kws["id"]
		else:
			data["status"]="failed"
			data["ip"] = kws["id"]
		self.save(kws["id"],data)

	def save(self,sid,data):
		try:
			data=json.dumps(data,encoding="utf8",ensure_ascii=False)
		except Exception,e:
			print sid
		#### save the server status id
		r.set("server.status.{sid}".format(sid=sid),data)
		print "已经存储"


if __name__=='__main__':
	g=SSHCheck()
	g.run()
