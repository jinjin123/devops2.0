#-*- coding=utf8 -*-
#/usr/bin/python env
import os,sys
reload(sys)
sys.setdefaultencoding("utf-8")
from django.http import HttpResponseRedirect,HttpResponse,request
from django.core.urlresolvers import reverse
from django.shortcuts import render


def docker_repo(request):
    return render("docker_repo.html")