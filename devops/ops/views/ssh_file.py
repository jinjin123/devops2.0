#!/usr/bin/env python
#coding:utf8
import os
from ssh_error import SSHError
class File(object):
	def __init__(self):
		pass
	def get_content(self,file):
		ssh_info={"content":"","status":False}
		try:
			with open(file.encode("utf8")) as f:
				content=f.readlines()
			content="".join(content)
			ssh_info["status"]=True
			ssh_info["content"]=content
		except IOError:
			ssh_info["congtent"]="指定的文件不存在！"
		except Exception,e:
			ssh_info["status"]=False
			ssh_info["content"]=str(e)
		return ssh_info