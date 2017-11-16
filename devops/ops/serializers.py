# -*-coding:UTF-8 -*-
import redis,json
from rest_framework import serializers
from ops.models import *
from ops.models import UserInfo  as User
from ops.models import RoleList, PermissonList
from ops.views.ssh_settings import redisip,redisport

r = redis.StrictRedis(host=redisip, port=redisport, db=0)

class UserSerializer(serializers.ModelSerializer):
   class Meta:
        model = User
        fields = ('id',
                  'last_login',
                  'is_superuser',
                  'username',
                  'first_name',
                  'last_name',
                  'email',
                  'is_staff',
                  'is_active',
                  'date_joined')

"""
TypeError: The `fields` option must be a list or tuple or "__all__". Got str. must list
"""
class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoleList
        fields = ('id', 'name')


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PermissonList
        fields = ('id', 'name', 'url')



class BusinessSerializer(serializers.ModelSerializer):
    class Meta:
        model = Business_Assets
        fields = ('id', 'business_name')


class ZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Zone_Assets
        fields = ('id', 'zone_name')


class IdcSerializer(serializers.ModelSerializer):
    class Meta:
        model = Idc_Assets
        fields = ('id', 'name','address','tel','contact','contact_phone','jigui','ip_range','bandwidth')


class LineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Line_Assets
        fields = ('id', 'line_name')


class RaidSerializer(serializers.ModelSerializer):
    class Meta:
        model = Raid_Assets
        fields = ('id', 'raid_name')


class AssetsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assets
        fields = ('id','assets_type', 'name', 'sn', 'buy_time', 'expire_date',
                  'buy_user', 'management_ip', 'manufacturer', 'model', 'provider',
                   'status', 'put_zone', 'group', 'business',)


class AssetsLogsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Log_Assets
        fields = ('id', 'assets_id', 'assets_user', 'assets_content', 'assets_type', 'create_time')


class ServerSerializer(serializers.ModelSerializer):
    assets = AssetsSerializer(required=False)
    class Meta:
        model = HostInfo
        fields = ('id','ip','user','pwd','port','group',
                  'login_type','sudo','su','us_sudo','us_su','key',
                  'alive','bz','line','cpu','cpu_number','vcpu_number','hostname',
                  'cpu_core','disk_total','ram_total','kernel',
                  'selinux','swap','raid','system','assets')


    def create(self, data):
        if(data.get('assets')):
            assets_data = data.pop('assets')
            assets = Assets.objects.create(**assets_data)
        else:
            assets = Assets()
        data['assets'] = assets
        server = HostInfo.objects.create(**data)
        ### put into redis for ssh check
        try:
            del data['assets']
            data['lg_type'] = data['login_type']
            del data['login_type']
            r.lpush('server',json.dumps(data))
        except Exception as e:
            print e,'111'
        return server

class PlaybookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ansible_Playbook
        fields = ('id','playbook_name','playbook_desc','playbook_vars','playbook_uuid',
                  'playbook_file','playbook_auth_group','playbook_auth_user')

class NetworkSerializer(serializers.ModelSerializer):
    assets = AssetsSerializer(required=False)

    class Meta:
        model = Network_Assets
        fields = ('id', 'ip', 'bandwidth', 'port_number', 'firmware',
                  'cpu', 'stone', 'configure_detail', 'assets')

    def create(self, data):
        if (data.get('assets')):
            assets_data = data.pop('assets')
            assets = Assets.objects.create(**assets_data)
        else:
            assets = Assets()
        data['assets'] = assets
        server = Network_Assets.objects.create(**data)
        return server

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service_Assets
        fields = ('id', 'service_name')


# class DeployOrderSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Project_Order
#         fields = ('id', 'order_project', 'order_subject', 'order_content',
#                   'order_branch', 'order_comid', 'order_tag', 'order_audit',
#                   'order_status', 'order_level', 'order_cancel', 'create_time',
#                   'order_user')
#
#
# class ProjectConfigSerializer(serializers.ModelSerializer):
#     project_number = serializers.StringRelatedField(many=True)  # ProjectNumberSerializer(required=False)
#
#     class Meta:
#         model = Project_Config
#         fields = ('id', 'project_env', 'project_name', 'project_local_command',
#                   'project_repo_dir', 'project_dir', 'project_exclude',
#                   'project_address', 'project_repertory', 'project_status',
#                   'project_remote_command', 'project_number')
