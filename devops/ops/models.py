#-*- coding=utf8 -*-
from __future__ import unicode_literals
from django.db import models

USER_TYPE_LIST  = (
    ('user','user'),
    ('admin','admin'),
)
USER_ALIVE_STATUS = (
    (0,'dead'),
    (1,'alive'),
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
    alive = models.IntegerField(choices=USER_ALIVE_STATUS,null=False,default=0)
    bz = models.CharField(max_length=128,null=True,blank=True)

    class Meta:
        unique_together = (("ip","group"))


    def __unicode__(self):
        return self.ip

class HostGroup(models.Model):
    group_name = models.ForeignKey(HostInfo,max_length=16,null=True)

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
