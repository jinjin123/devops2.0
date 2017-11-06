#!/usr/bin/env python
# coding:utf-8
import IP,time
import os,sys,json
reload(sys)
sys.setdefaultencoding("utf-8")
def resolv_client(request):
	ip=request.META['REMOTE_ADDR']
	now_time=time.strftime("%Y-%m-%d %H:%M:%S",time.localtime(time.time()))
	info={
		"ip":ip,
		"ip_locate":IP.find(ip),
		"time":now_time,
	}
	return info
