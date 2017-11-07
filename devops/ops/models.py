#-*- coding=utf8 -*-
from __future__ import unicode_literals
from django.db import models
from django.contrib.auth.models import Group
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
USE_SUDO = (
    ('N','N'),
    ('Y','Y'),
)
LG_TP = (
    ('密码方式','密码方式'),
    ('秘钥方式','秘钥方式'),
)
HOST_G = {
    ('生产','生产'),
    ('测试','测试'),

}
# Create your models here.
class UserInfo(models.Model):
    user = models.CharField(max_length=20,null=False,blank=False,primary_key=True,unique=True)
    pwd = models.CharField(max_length=20,null=False,blank=False)
    phone = models.IntegerField(blank=False)
    email = models.EmailField(max_length=32,null=False,blank=False)
    ctime =  models.DateTimeField(auto_now_add=True)
    uptime = models.DateTimeField(auto_now=True)
    user_type = models.CharField(choices=USER_TYPE_LIST,max_length=10)
    group = models.CharField(choices=GROUP_TYPE_LIST,null=True,max_length=10)
    hdimg = models.FileField(upload_to="static/img/head/", null=True, blank=True)
    alive = models.IntegerField(choices=USER_ALIVE_STATUS,null=False,default=0)
    # Toddo:搜索可使用的命令,
    def __unicode__(self):
        return self.user

class UserGroup(models.Model):
    group_name = models.ForeignKey(UserInfo)

class UserLock(models.Model):
    id = models.AutoField(primary_key=True,unique=True,blank=False,null=False)
    ip = models.CharField(max_length=15,null=True,blank=True)
    user = models.CharField(max_length=20,null=False,blank=False)
    status = models.IntegerField(null=False,blank=False,default=1)
    uptime = models.DateTimeField(auto_now=True)



class HostInfo(models.Model):
    ip = models.CharField(max_length=15,null=False,blank=False,primary_key=True,unique=True)
    port = models.IntegerField(null=False,blank=False,default=22)
    group = models.CharField(null=False,blank=False,max_length=15)
    user = models.CharField(max_length=10,null=False,blank=False)
    pwd = models.CharField(max_length=10,null=False,blank=False)
    login_type = models.CharField(choices=LG_TP,null=False,blank=False,max_length=10)
    sudo = models.CharField(max_length=10,null=True,blank=True)
    su = models.CharField(max_length=10,null=True,blank=True)
    us_sudo = models.CharField(choices=USE_SUDO,null=False,blank=False,max_length=10)
    us_su = models.CharField(choices=USE_SUDO,null=False,blank=False,max_length=10)
    key = models.FileField(upload_to="keys",null=True,blank=True)
    alive = models.CharField(max_length=256,null=False,blank=True)
    bz = models.CharField(max_length=128,null=True,blank=True)

    class Meta:
        unique_together = (("ip","group"))


    def __unicode__(self):
        return self.ip

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
