#!/usr/bin/env python
# _*_ coding:utf-8 _*_
from __future__ import division
from rest_framework import viewsets, mixins
from rest_framework.viewsets import ViewSet
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from ops.views.zabbix import zabbix
import time
from datetime import datetime

"""
主机列表，根据组来查询
"""
@api_view(['GET'])
def HostView(request):
    group = request.GET.get('group', None)
    if group:
        return Response(zabbix.host_list(group))
    else:
        return Response(zabbix.host_list())


"""
主机组列表
"""
@api_view(['GET'])
def GroupView(request):
    return Response(zabbix.group_list())


"""
获取主机cpu监控数据
"""
@api_view(['GET'])
def CpuView(request,hostid):
    List =  zabbix.cpu_list(hostid)
    arr1 = []
    arr2 = []
    for i in List:
        # print i
        arr1.append(int(i[u'clock']) * 1000)
        # 需要考虑整数   浮点数
        arr1.append(float(i[u'value']))
        arr2.append(arr1)
        arr1=[]
    return Response(arr2)
    # return Response(zabbix.cpu_list(hostid))


"""
获取主机memory监控数据
"""
@api_view(['GET'])
def MemoryView(request,hostid):
    List =  zabbix.memory_list(hostid)
    arr1 = []
    arr2 = []
    for i in List:
        # print i
        arr1.append(int(i[u'clock']) * 1000)
        #  毫秒时间戳 一天需要  24 * 3600 * 1000
        arr1.append(float(round(int(i[u'value']) / 1024 / 1024 /1024,2)))
        arr2.append(arr1)
        arr1=[]
    return Response(arr2)
    # return Response(zabbix.memory_list(hostid))


"""
获取主机disk监控数据
"""
@api_view(['GET'])
def DiskView(request,hostid):
    List =  zabbix.disk_list(hostid)
    arr1 = []
    arr2 = []
    for i in List:
        # print i
        arr1.append(int(i[u'clock']) * 1000)
        #  毫秒时间戳 一天需要  24 * 3600 * 1000
        arr1.append(float(round(int(i[u'value']) / 1024 / 1024 /1024,2)))
        arr2.append(arr1)
        arr1=[]
    return Response(arr2)
    # return Response(zabbix.disk_list(hostid))


"""
获取CPU,内存,磁盘使用占比
"""
@api_view(['GET'])
def UsageView(request, hostid):
    if hostid:
        return Response(zabbix.usage(hostid))
    else:
        return Response()


"""
获取事件列表
"""
@api_view(['GET'])
def EventView(request):
    return Response(zabbix.event_list())


"""
获取服务类型（如 Httpd/FTP）获取监控历史数据
"""
@api_view(['GET'])
def ServiceItemsView(request, *args, **kwargs):
    service = request.query_params.get('service', None)
    history_list = zabbix.service_item_list(service)
    return Response(history_list)


"""
   根据 itemid 获取历史数据
"""
@api_view(['GET'])
def HistoryView(request,itemid):
    history_list = zabbix.history_list(itemid)
    return Response(history_list)
