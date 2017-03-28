#-*- coding=utf8 -*-
#/usr/bin/python env
import os,sys
from models import  UserInfo
os.environ['DJANGO_SETTINGS_MODULE'] = '../devops.settings'  # TODO: edit this
sys.path.append('../devops')  # path to your project if needed

def user():
    username = list(UserInfo.objects.order_by('-uptime'))[0]
    print username

user()