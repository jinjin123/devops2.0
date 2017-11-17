# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2017-11-08 12:17
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ops', '0004_auto_20171108_0112'),
    ]

    operations = [
        migrations.CreateModel(
            name='Ansible_Playbook',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('playbook_name', models.CharField(max_length=50, unique=True, verbose_name='\u5267\u672c\u540d\u79f0')),
                ('playbook_desc', models.CharField(blank=True, max_length=200, null=True, verbose_name='\u529f\u80fd\u63cf\u8ff0')),
                ('playbook_vars', models.TextField(blank=True, null=True, verbose_name='\u6a21\u5757\u53c2\u6570')),
                ('playbook_uuid', models.CharField(max_length=50, verbose_name='\u552f\u4e00id')),
                ('playbook_file', models.FileField(upload_to='playbook/', verbose_name='\u5267\u672c\u8def\u5f84')),
                ('playbook_auth_group', models.SmallIntegerField(blank=True, null=True, verbose_name='\u6388\u6743\u7ec4')),
                ('playbook_auth_user', models.SmallIntegerField(blank=True, null=True, verbose_name='\u6388\u6743\u7528\u6237')),
            ],
            options={
                'verbose_name': 'Ansible\u5267\u672c\u914d\u7f6e\u8868',
                'verbose_name_plural': 'Ansible\u5267\u672c\u914d\u7f6e\u8868',
                'permissions': (('can_read_ansible_playbook', '\u8bfb\u53d6Ansible\u5267\u672c\u6743\u9650'), ('can_change_ansible_playbook', '\u66f4\u6539Ansible\u5267\u672c\u6743\u9650'), ('can_add_ansible_playbook', '\u6dfb\u52a0Ansible\u5267\u672c\u6743\u9650'), ('can_delete_ansible_playbook', '\u5220\u9664Ansible\u5267\u672c\u6743\u9650')),
            },
        ),
        migrations.CreateModel(
            name='Ansible_Playbook_Log',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ans_id', models.IntegerField(blank=True, default=None, null=True, verbose_name='id')),
                ('ans_user', models.CharField(default=None, max_length=50, verbose_name='\u4f7f\u7528\u7528\u6237')),
                ('ans_name', models.CharField(default=None, max_length=100, verbose_name='\u6a21\u5757\u540d\u79f0')),
                ('ans_content', models.CharField(default=None, max_length=100)),
                ('ans_server', models.TextField(default=None, verbose_name='\u670d\u52a1\u5668')),
                ('create_time', models.DateTimeField(auto_now_add=True, null=True, verbose_name='\u6267\u884c\u65f6\u95f4')),
            ],
            options={
                'verbose_name': 'Ansible\u5267\u672c\u64cd\u4f5c\u8bb0\u5f55\u8868',
                'verbose_name_plural': 'Ansible\u5267\u672c\u64cd\u4f5c\u8bb0\u5f55\u8868',
            },
        ),
    ]