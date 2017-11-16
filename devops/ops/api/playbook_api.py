#!/usr/bin/env python
# _#_ coding:utf-8 _*_
from rest_framework import viewsets, permissions
from rest_framework import status
from ops.serializers import *
from rest_framework.response import Response
from rest_framework.decorators import api_view
from ops.views.tasks.tasks import recordAssets
from ops.models import UserInfo as User
from ops.models import RoleList,PermissonList
from ops.views.tasks.tasks import recordAnsiblePlaybook

@api_view(['GET', 'POST','DELETE'])
def  playbook_del(request,id,format=None):
    """
    Retrieve, update or delete a playbook instance.
    """
    try:
        snippet = Ansible_Playbook.objects.get(id=id)
        map_server = Ansible_Playbook_Number.objects.filter(playbook_id=id)
    except Ansible_Playbook.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = PlaybookSerializer(snippet)
        return Response(serializer.data)

    if request.method == 'DELETE':
        snippet.delete()
        map_server.delete()
        recordAnsiblePlaybook.delay(user=str(request.user), ans_content="删除剧本：{playbook_name}".format(playbook_name=snippet.playbook_name),
                           ans_id=id,)
        return Response(status=status.HTTP_204_NO_CONTENT)
