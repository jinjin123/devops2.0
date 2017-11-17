#-*- coding=utf8 -*-
from __future__ import unicode_literals
from django.db import models
from django.contrib.auth.models import Group
from django.contrib.auth.models import AbstractBaseUser, AbstractUser
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.utils.encoding import python_2_unicode_compatible
import datetime

AUTH_USER_MODEL = getattr(settings, 'AUTH_USER_MODEL', 'auth.User')

SERVER_STATUS = (
    (0, u"Normal"),
    (1, u"Down"),
    (2, u"No Connect"),
    (3, u"Error"),
)
SERVICE_TYPES = (
    ('moniter', u"Moniter"),
    ('lvs', u"LVS"),
    ('db', u"Database"),
    ('analysis', u"Analysis"),
    ('admin', u"Admin"),
    ('storge', u"Storge"),
    ('web', u"WEB"),
    ('email', u"Email"),
    ('mix', u"Mix"),
)
USER_TYPE_LIST  = (
    ('user','user'),
    ('admin','admin'),
)
USER_ALIVE_STATUS = (
    (0,'dead'),
    (1,'alive'),
    (2,'check'),
)
GROUP_TYPE_LIST  = (
    ('user','user'),
    ('admin','admin'),
)
HOST_G = {
    ('生产','生产'),
    ('测试','测试'),

}

# 用户相关
class PermissonList(models.Model):
    name = models.CharField(max_length=64, verbose_name=u'权限名称')
    url = models.CharField(max_length=255, verbose_name=u'URL地址')

    def __str__(self):
        return '%s(%s)' % (self.name, self.url)


class RoleList(models.Model):
    name = models.CharField(max_length=64, verbose_name=u'部门名称')
    permission = models.ManyToManyField(PermissonList, blank=True, verbose_name=u'权限')

    def __str__(self):
        return self.name

class UserInfo(AbstractUser):
    fullname = models.CharField(max_length=64, null=True, unique=True, default=None, verbose_name=u'姓名')
    birthday = models.DateField(null=True, blank=True, default=None, verbose_name=u'生日')
    sex = models.CharField(max_length=2, null=True, verbose_name=u'性别')
    role = models.ForeignKey(RoleList, null=True, blank=True, verbose_name=u'部门')
    head_img = models.FileField(upload_to='user/img/', default="user/img/cd-avatar.png",verbose_name='用户头像')
    pub_key = models.TextField(max_length=500,verbose_name="公钥")
    permission = models.ManyToManyField(PermissonList, blank=True, verbose_name=u'权限')


class UserLock(models.Model):
    id = models.AutoField(primary_key=True,unique=True,blank=False,null=False)
    ip = models.CharField(max_length=15,null=True,blank=True)
    user = models.CharField(max_length=20,null=False,blank=False)
    status = models.IntegerField(null=False,blank=False,default=1)
    uptime = models.DateTimeField(auto_now=True)



class HostInfo(models.Model):
    USE_SUDO = (
        ('N','N'),
        ('Y','Y'),
    )
    LG_TP = (
        ('密码方式','密码方式'),
        ('秘钥方式','秘钥方式'),
    )
    assets = models.OneToOneField('Assets')
    hostname = models.CharField(max_length=100, blank=True, null=True)
    ip = models.CharField(max_length=15,null=True,blank=False,unique=True)
    port = models.IntegerField(null=True,blank=False,default=22)
    group = models.CharField(null=True,blank=False,max_length=15,default='default')
    user = models.CharField(max_length=10,null=True,blank=False)
    pwd = models.CharField(max_length=10,null=True,blank=False,default='N')
    login_type = models.CharField(choices=LG_TP,null=True,blank=False,max_length=10)
    sudo = models.CharField(max_length=10,null=True,blank=True,default='N')
    su = models.CharField(max_length=10,null=True,blank=True,default='N')
    us_sudo = models.CharField(choices=USE_SUDO,null=True,blank=False,max_length=10,default='N')
    us_su = models.CharField(choices=USE_SUDO,null=True,blank=False,max_length=10,default='N')
    # key = models.FileField(upload_to="keys",null=True,blank=True,default='N')
    key = models.CharField(max_length=100,null=True,blank=True,default='N')
    alive = models.CharField(max_length=256,null=True,blank=True)
    bz = models.CharField(max_length=128,null=True,blank=True)
    line = models.CharField(max_length=100, blank=True, null=True)
    cpu = models.CharField(max_length=100, blank=True, null=True)
    cpu_number = models.SmallIntegerField(blank=True, null=True)
    vcpu_number = models.SmallIntegerField(blank=True, null=True)
    cpu_core = models.SmallIntegerField(blank=True, null=True)
    disk_total = models.CharField(max_length=100, blank=True, null=True)
    ram_total = models.CharField(max_length=100, blank=True, null=True)
    kernel = models.CharField(max_length=100, blank=True, null=True)
    selinux = models.CharField(max_length=100, blank=True, null=True)
    swap = models.CharField(max_length=100, blank=True, null=True)
    raid = models.SmallIntegerField(blank=True, null=True)
    system = models.CharField(max_length=100, blank=True, null=True)
    create_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        # unique_together = (("ip","group"))
        permissions = (
            ("can_read_server_assets", "读取服务器资产权限"),
            ("can_change_server_assets", "更改服务器资产权限"),
            ("can_add_server_assets", "添加服务器资产权限"),
            ("can_delete_server_assets", "删除服务器资产权限"),
        )
        verbose_name = '服务器资产表'
        verbose_name_plural = '服务器资产表'



# class HostGroup(models.Model):
    # group_name = models.ForeignKey(HostInfo)

class HardWareInfo(models.Model):
    ip = models.CharField(max_length=15,null=False,blank=False,primary_key=True,unique=True)
    system = models.CharField(max_length=15,null=False,blank=False)
    memory = models.CharField(max_length=15,null=False,blank=False)
    disk = models.CharField(max_length=15,null=False,blank=False)
    cpu = models.IntegerField(null=False,blank=False)
    contractor = models.CharField(max_length=15,null=False,blank=False)
    price = models.IntegerField(null=False,blank=False)
    comments = models.CharField(max_length=30,null=False,blank=False)
    def __unicode__(self):
        return self.contractor

class PushCodeEvent(models.Model):
    user_id = models.ForeignKey(UserInfo,blank=False, null=False)
    event = models.CharField(max_length=30,null=False,blank=False)
    ctime =  models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-ctime']

class TopContServer(models.Model):
    user_id = models.ManyToManyField(UserInfo)
    ip = models.CharField(primary_key=True,unique=True,max_length=15,null=False,blank=False)
    uptime = models.DateTimeField(auto_now=True)
    acount = models.IntegerField(null=False,blank=False,default=1)

    class Meta:
        ordering = ['-acount']

@python_2_unicode_compatible
class IDC(models.Model):
    name = models.CharField(max_length=64)
    description = models.TextField()

    contact = models.CharField(max_length=32)
    telphone = models.CharField(max_length=32)
    address = models.CharField(max_length=128)
    customer_id = models.CharField(max_length=128)
    groups = models.ManyToManyField(Group)  # many

    create_time = models.DateField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = u"IDC"
        verbose_name_plural = verbose_name


@python_2_unicode_compatible
class Host(models.Model):
    idc = models.ForeignKey(IDC)
    name = models.CharField(max_length=64)
    nagios_name = models.CharField(u"Nagios Host ID", max_length=64, blank=True, null=True)
    ip = models.GenericIPAddressField(blank=True, null=True)
    internal_ip = models.GenericIPAddressField(blank=True, null=True)
    user = models.CharField(max_length=64)
    password = models.CharField(max_length=128)
    ssh_port = models.IntegerField(blank=True, null=True)
    status = models.SmallIntegerField(choices=SERVER_STATUS)

    brand = models.CharField(max_length=64, choices=[(i, i) for i in (u"DELL", u"HP", u"Other")])
    model = models.CharField(max_length=64)
    cpu = models.CharField(max_length=64)
    core_num = models.SmallIntegerField(choices=[(i * 2, "%s Cores" % (i * 2)) for i in range(1, 15)])
    hard_disk = models.IntegerField()
    memory = models.IntegerField()

    system = models.CharField(u"System OS", max_length=32, choices=[(i, i) for i in (u"CentOS", u"FreeBSD", u"Ubuntu")])
    system_version = models.CharField(max_length=32)
    system_arch = models.CharField(max_length=32, choices=[(i, i) for i in (u"x86_64", u"i386")])

    create_time = models.DateField()
    guarantee_date = models.DateField()
    service_type = models.CharField(max_length=32, choices=SERVICE_TYPES)
    description = models.TextField()

    administrator = models.ForeignKey(AUTH_USER_MODEL, verbose_name="Admin")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = u"Host"
        verbose_name_plural = verbose_name


@python_2_unicode_compatible
class MaintainLog(models.Model):
    host = models.ForeignKey(Host)
    maintain_type = models.CharField(max_length=32)
    hard_type = models.CharField(max_length=16)
    time = models.DateTimeField()
    operator = models.CharField(max_length=16)
    note = models.TextField()

    def __str__(self):
        return '%s maintain-log [%s] %s %s' % (self.host.name, self.time.strftime('%Y-%m-%d %H:%M:%S'),
                                               self.maintain_type, self.hard_type)

    class Meta:
        verbose_name = u"Maintain Log"
        verbose_name_plural = verbose_name


@python_2_unicode_compatible
class HostGroup(models.Model):

    name = models.CharField(max_length=32)
    description = models.TextField()
    hosts = models.ManyToManyField(
        Host, verbose_name=u'Hosts', blank=True, related_name='groups')

    class Meta:
        verbose_name = u"Host Group"
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.name


@python_2_unicode_compatible
class AccessRecord(models.Model):
    date = models.DateField()
    user_count = models.IntegerField()
    view_count = models.IntegerField()

    class Meta:
        verbose_name = u"Access Record"
        verbose_name_plural = verbose_name

    def __str__(self):
        return "%s Access Record" % self.date.strftime('%Y-%m-%d')

@python_2_unicode_compatible
class WebHook(models.Model):
    '''webhook'''
    id = models.AutoField(primary_key=True)
    repo = models.CharField(max_length=32)  # repo name
    branch = models.CharField(max_length=32)  # repo branch
    shell = models.TextField(max_length=500)  # do what
    server = models.CharField(max_length=32)  # repo branch
    add_time = models.DateTimeField(default=datetime.datetime.now)
    key = models.CharField(max_length=32, unique=True)

    # 1:waiting, 2:ing, 3:error, 4:success, 5:except, other
    status = models.CharField(max_length=1)
    lastUpdate = models.DateTimeField(default=datetime.datetime.now)

    # def dict(self, with_key=False):
    #     rst = {}
    #     rst['id'] = self.id
    #     rst['repo'] = self.repo
    #     rst['branch'] = self.branch
    #     rst['shell'] = self.shell
    #     rst['server'] = self.server
    #     rst['add_time'] = self.add_time
    #     rst['key'] = with_key and self.key or ''
    #     rst['status'] = self.status
    #     rst['lastUpdate'] = self.lastUpdate
    #     return rst

    # def updateStatus(self, status):
    #     self.status = status
    #     self.lastUpdate = datetime.datetime.now()
    #     self.save()


    ####  can not return int type
    def __str__(self):
        return self.repo

@python_2_unicode_compatible
class History(models.Model):
    '''push history'''
    # md5, notice, output, push_name, push_email, success, add_time
    id = models.AutoField(primary_key=True)
    # 1:waiting, 2:ing, 3:error, 4:success, 5:except, other
    status = models.CharField(max_length=1)
    shell_log = models.TextField(max_length=500)  # hook shell log

    data = models.TextField(max_length=500)  # git push data
    push_user = models.CharField(max_length=64)  # git push user(name<email>)
    add_time = models.DateTimeField(default=datetime.datetime.now)  # git push time
    update_time = models.DateTimeField(default=datetime.datetime.now)  # last update time
    webhook_id = models.ForeignKey(WebHook,related_name='webhook')

    def __str__(self):
        return self.status

    class Meta:
        ordering = ['-update_time']
    # def updateStatus(self, status):
    #     self.update_time = datetime.datetime.now()
    #     self.status = status
    #     self.save()

@python_2_unicode_compatible
class Ansible_Model_Log(models.Model):
    ans_user = models.CharField(max_length=50, verbose_name='使用用户', default=None)
    ans_model = models.CharField(max_length=100, verbose_name='模块名称', default=None)
    ans_args = models.CharField(max_length=500, blank=True, null=True, verbose_name='模块参数', default=None)
    ans_server = models.TextField(verbose_name='服务器', default=None)
    create_time = models.DateTimeField(auto_now_add=True, blank=True, null=True, verbose_name='执行时间')

    def __str__(self):
        return self.ans_model

    class Meta:
        # db_table = 'log_ansible_model'  for mysql
        permissions = (
            ("can_read_log_ansible_model", "读取Ansible模块执行记录权限"),
            ("can_change_log_ansible_model", "更改Ansible模块执行记录权限"),
            ("can_add_log_ansible_model", "添加Ansible模块执行记录权限"),
            ("can_delete_log_ansible_model", "删除Ansible模块执行记录权限"),
        )
        verbose_name = 'Ansible模块执行记录表'
        verbose_name_plural = 'Ansible模块执行记录表'



# @python_2_unicode_compatible
class Ansible_Playbook(models.Model):
        playbook_name = models.CharField(max_length=50, verbose_name='剧本名称', unique=True)
        playbook_desc = models.CharField(max_length=200, verbose_name='功能描述', blank=True, null=True)
        playbook_vars = models.TextField(verbose_name='模块参数', blank=True, null=True)
        playbook_uuid = models.CharField(max_length=50, verbose_name='唯一id')
        playbook_file = models.FileField(upload_to='playbook/', verbose_name='剧本路径')
        playbook_auth_group = models.CharField(verbose_name='授权组', blank=True, null=True,max_length=50)
        playbook_auth_user = models.CharField(verbose_name='授权用户', blank=True, null=True,max_length=50)

        def __int__(self):
            return self.id
        class Meta:
            # db_table = 'opman_ansible_playbook'
            permissions = (
                ("can_read_ansible_playbook", "读取Ansible剧本权限"),
                ("can_change_ansible_playbook", "更改Ansible剧本权限"),
                ("can_add_ansible_playbook", "添加Ansible剧本权限"),
                ("can_delete_ansible_playbook", "删除Ansible剧本权限"),
                ("can_do_all_ansible_playbook", "所有Ansible剧本权限"),
            )
            verbose_name = 'Ansible剧本配置表'
            verbose_name_plural = 'Ansible剧本配置表'

class Ansible_Playbook_Number(models.Model):
        playbook = models.ForeignKey('Ansible_Playbook', related_name='server_number', on_delete=models.CASCADE)
        playbook_server = models.CharField(max_length=100, verbose_name='目标服务器', blank=True, null=True)


        def __int__(self):
            return self.playbook

        class Meta:
            # db_table = 'opman_ansible_playbook_number'
            permissions = (
                ("can_read_ansible_playbook_number", "读取Ansible剧本成员权限"),
                ("can_change_ansible_playbook_number", "更改Ansible剧本成员权限"),
                ("can_add_ansible_playbook_number", "添加Ansible剧本成员权限"),
                ("can_delete_ansible_playbook_number", "删除Ansible剧本成员权限"),
                ("can_do_all_ansible_playbook_number", "所有Ansible剧本成员/权限"),
            )
            verbose_name = 'Ansible剧本成员表'
            verbose_name_plural = 'Ansible剧本成员表'


class Ansible_Playbook_Log(models.Model):
    ans_id = models.IntegerField(verbose_name='id', blank=True, null=True, default=None)
    ans_user = models.CharField(max_length=50, verbose_name='使用用户', default=None)
    ans_name = models.CharField(max_length=100, verbose_name='模块名称', default=None)
    ans_content = models.CharField(max_length=100, default=None)
    ans_server = models.TextField(verbose_name='服务器', default=None)
    create_time = models.DateTimeField(auto_now_add=True, blank=True, null=True, verbose_name='执行时间')

    class Meta:
        # db_table = 'opman_log_ansible_playbook'
        verbose_name = 'Ansible剧本操作记录表'
        verbose_name_plural = 'Ansible剧本操作记录表'

class Global_Config(models.Model):
    ansible_model = models.SmallIntegerField(verbose_name='是否开启ansible模块操作记录', blank=True, null=True)
    ansible_playbook = models.SmallIntegerField(verbose_name='是否开启ansible剧本操作记录', blank=True, null=True)
    cron = models.SmallIntegerField(verbose_name='是否开启计划任务操作记录', blank=True, null=True)
    project = models.SmallIntegerField(verbose_name='是否开启项目操作记录', blank=True, null=True)
    assets = models.SmallIntegerField(verbose_name='是否开启资产操作记录', blank=True, null=True)
    server = models.SmallIntegerField(verbose_name='是否开启服务器命令记录', blank=True, null=True)
    email = models.SmallIntegerField(verbose_name='是否开启邮件通知', blank=True, null=True)

class Assets(models.Model):
    assets_type_choices = (
                          ('server',u'服务器'),
                          ('switch',u'交换机'),
                          ('route',u'路由器'),
                          ('printer',u'打印机'),
                          ('scanner',u'扫描仪'),
                          ('firewall',u'防火墙'),
                          ('storage',u'存储设备'),
                          ('wifi',u'无线设备'),
                          )
    assets_type = models.CharField(choices=assets_type_choices, max_length=100, default='server', verbose_name='资产类型')
    name = models.CharField(max_length=100, verbose_name='资产编号', unique=True) ###  event number  that is  event  kvm define
    sn = models.CharField(max_length=100, verbose_name='设备序列号')
    buy_time = models.DateField(blank=True, null=True, verbose_name='购买时间')
    expire_date = models.DateField(u'过保修期', null=True, blank=True)
    buy_user = models.CharField(max_length=100, blank=True, null=True, verbose_name='购买人')
    management_ip = models.GenericIPAddressField(u'管理IP', blank=True, null=True)
    manufacturer = models.CharField(max_length=100, blank=True, null=True, verbose_name='制造商')
    provider = models.CharField(max_length=100, blank=True, null=True, verbose_name='供货商')
    model = models.CharField(max_length=100, blank=True, null=True, verbose_name='资产型号')
    status = models.SmallIntegerField(blank=True, null=True, verbose_name='状态')
    put_zone = models.SmallIntegerField(blank=True, null=True, verbose_name='放置区域')
    group = models.SmallIntegerField(blank=True, null=True, verbose_name='使用组')
    business = models.SmallIntegerField(blank=True, null=True, verbose_name='业务类型')
    create_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now_add=True)

class Business_Assets(models.Model):
    business_name = models.CharField(max_length=100, verbose_name=u'业务名称')

class Service_Assets(models.Model):
    '''业务分组表'''
    service_name = models.CharField(max_length=100, unique=True)

    class Meta:
        # db_table = 'ops_service_assets'
        permissions = (
            ("can_read_service_assets", "读取业务资产权限"),
            ("can_change_service_assets", "更改业务资产权限"),
            ("can_add_service_assets", "添加业务资产权限"),
            ("can_delete_service_assets", "删除业务资产权限"),
        )
        verbose_name = '业务分组表'
        verbose_name_plural = '业务分组表'

class Idc_Assets(models.Model):
    name = models.CharField(u"机房名称", max_length=30, null=True)
    address = models.CharField(u"机房地址", max_length=100, null=True)
    tel = models.CharField(u"机房电话", max_length=30, null=True)
    contact = models.CharField(u"客户经理", max_length=30, null=True)
    contact_phone = models.CharField(u"移动电话", max_length=30, null=True)
    jigui = models.CharField(u"机柜信息", max_length=30, null=True)
    ip_range = models.CharField(u"IP范围", max_length=30, null=True)
    bandwidth = models.CharField(u"接入带宽", max_length=30, null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = u'数据中心'
        verbose_name_plural = verbose_name

class Line_Assets(models.Model):
    line_name = models.CharField(max_length=100, unique=True)
    '''自定义权限'''

    class Meta:
        # db_table = 'ops_line_assets'
        permissions = (
            ("can_read_line_assets", "读取出口线路资产权限"),
            ("can_change_line_assetss", "更改出口线路资产权限"),
            ("can_add_line_assets", "添加出口线路资产权限"),
            ("can_delete_line_assets", "删除出口线路资产权限"),
        )
        verbose_name = '出口线路资产表'
        verbose_name_plural = '出口线路资产表'

class Raid_Assets(models.Model):
    raid_name = models.CharField(max_length=100, unique=True)
    '''自定义权限'''

    class Meta:
        # db_table = 'ops_raid_assets'
        permissions = (
            ("can_read_raid_assets", "读取Raid资产权限"),
            ("can_change_raid_assets", "更改Raid资产权限"),
            ("can_add_raid_assets", "添加Raid资产权限"),
            ("can_delete_raid_assets", "删除Raid资产权限"),
        )
        verbose_name = 'Raid资产表'
        verbose_name_plural = 'Raid资产表'

class Disk_Assets(models.Model):
    assets = models.ForeignKey('Assets')
    device_volume = models.CharField(max_length=100, blank=True, null=True, verbose_name='硬盘容量')
    device_status = models.CharField(max_length=100, blank=True, null=True, verbose_name='硬盘状态')
    device_model = models.CharField(max_length=100, blank=True, null=True, verbose_name='硬盘型号')
    device_brand = models.CharField(max_length=100, blank=True, null=True, verbose_name='硬盘生产商')
    device_serial = models.CharField(max_length=100, blank=True, null=True, verbose_name='硬盘序列号')
    device_slot = models.SmallIntegerField(blank=True, null=True, verbose_name='硬盘插槽')
    create_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        # db_table = 'ops_disk_assets'
        permissions = (
            ("can_read_disk_assets", "读取磁盘资产权限"),
            ("can_change_disk_assets", "更改磁盘资产权限"),
            ("can_add_disk_assets", "添加磁盘资产权限"),
            ("can_delete_disk_assets", "删除磁盘资产权限"),
        )
        unique_together = (("assets", "device_slot"))
        verbose_name = '磁盘资产表'
        verbose_name_plural = '磁盘资产表'

class Ram_Assets(models.Model):
    assets = models.ForeignKey('Assets')
    device_model = models.CharField(max_length=100, blank=True, null=True, verbose_name='内存型号')
    device_volume = models.CharField(max_length=100, blank=True, null=True, verbose_name='内存容量')
    device_brand = models.CharField(max_length=100, blank=True, null=True, verbose_name='内存生产商')
    device_slot = models.SmallIntegerField(blank=True, null=True, verbose_name='内存插槽')
    device_status = models.CharField(max_length=100, blank=True, null=True, verbose_name='内存状态')
    create_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        # db_table = 'ops_ram_assets'
        permissions = (
            ("can_read_ram_assets", "读取内存资产权限"),
            ("can_change_ram_assets", "更改内存资产权限"),
            ("can_add_ram_assets", "添加内存资产权限"),
            ("can_delete_ram_assets", "删除内存资产权限"),
        )
        unique_together = (("assets", "device_slot"))
        verbose_name = '内存资产表'
        verbose_name_plural = '内存资产表'


class Network_Assets(models.Model):
    assets = models.OneToOneField('Assets')
    bandwidth = models.CharField(max_length=100, blank=True, null=True, verbose_name='背板带宽')
    ip = models.CharField(max_length=100, blank=True, null=True, verbose_name='管理ip')
    port_number = models.SmallIntegerField(blank=True, null=True, verbose_name='端口个数')
    firmware = models.CharField(max_length=100, blank=True, null=True, verbose_name='固件版本')
    cpu = models.CharField(max_length=100, blank=True, null=True, verbose_name='cpu型号')
    stone = models.CharField(max_length=100, blank=True, null=True, verbose_name='内存大小')
    configure_detail = models.TextField(max_length=100, blank=True, null=True, verbose_name='配置说明')
    create_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        # db_table = 'ops_network_assets'
        permissions = (
            ("can_read_network_assets", "读取网络资产权限"),
            ("can_change_network_assets", "更改网络资产权限"),
            ("can_add_network_assets", "添加网络资产权限"),
            ("can_delete_network_assets", "删除网络资产权限"),
        )
        verbose_name = '网络资产表'
        verbose_name_plural = '网络资产表'

class Log_Assets(models.Model):
    assets_id = models.IntegerField(verbose_name='资产类型id', blank=True, null=True, default=None)
    assets_user = models.CharField(max_length=50, verbose_name='操作用户', default=None)
    assets_content = models.CharField(max_length=100, verbose_name='名称', default=None)
    assets_type = models.CharField(max_length=50, default=None)
    create_time = models.DateTimeField(auto_now_add=True, blank=True, null=True, verbose_name='执行时间')
    class Meta:
        # db_table = 'ops_log_assets'
        verbose_name = '项目配置操作记录表'
        verbose_name_plural = '项目配置操作记录表'



class Zone_Assets(models.Model):
    zone_name = models.CharField(max_length=100, unique=True)
    '''自定义权限'''

    class Meta:
        # db_table = 'ops_zone_assets'
        permissions = (
            ("can_read_zone_assets", "读取机房资产权限"),
            ("can_change_zone_assets", "更改机房资产权限"),
            ("can_add_zone_assets", "添加机房资产权限"),
            ("can_delete_zone_assets", "删除机房资产权限"),
        )
        verbose_name = '机房资产表'
        verbose_name_plural = '机房资产表'

#
# @python_2_unicode_compatible
# class ContainerIp(models.Model):
#     ip_addr = models.GenericIPAddressField(unique=True)
#     mac_addr = models.CharField(max_length=200, null=True, blank=True)
#     is_routed = models.BooleanField(default=False)
#     is_active = models.BooleanField(default=True)
#     is_available = models.BooleanField(default=True)
#
#     def __str__(self):
#         return self.ip_addr
#
# @python_2_unicode_compatible
# class ContainerHost(models.Model):
#     hostname = models.CharField(max_length=100, blank=True)
#     is_active = models.BooleanField(default=True)
#     ssh_port = models.CharField(max_length=10, default='22')
#     docker_api_port = models.CharField(max_length=10)
#     docker_network = models.CharField(max_length=100, blank=True)
#
#     def __str__(self):
#         return self.ip.ip_addr
#
# class ImageManager(models.Manager):
#     def get_image(self, name, user):
#         try:
#             image = Image.objects.get(name=name)
#             if user == image.user or user.is_superuser:
#                 return image
#             else:
#                 return None
#         except ObjectDoesNotExist:
#             return None
#
# @python_2_unicode_compatible
# class Image(models.Model, ImageMixin):
#     name = models.CharField(max_length=200)
#     tag = models.CharField(max_length=200)
#     user = models.ForeignKey(UserInfo, on_delete=models.CASCADE)
#     snapshot = models.CharField(max_length=200)
#     is_snapshot = models.BooleanField(default=False)
#     objects = ImageManager()
#
#     def __str__(self):
#         return self.name
#
# class ContainerManager(models.Manager):
#     def get_container(self, container_id, user):
#         try:
#             container = Container.objects.get(container_id=container_id)
#             if user == container.user or user.is_superuser:
#                 return container
#             else:
#                 return None
#         except ObjectDoesNotExist:
#             return None
#
# class Container(models.Model):
#     hostname = models.CharField(max_length=100)
#     container_id = models.CharField(max_length=200)
#     image = models.ForeignKey(Image)
#     ip = models.ForeignKey(ContainerIp)
#     user = models.ManyToManyField(UserInfo)
#     objects = ContainerManager()
#
#     def __str__(self):
#         return self.container_id
