# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2017-11-08 12:38
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('ops', '0005_ansible_playbook_ansible_playbook_log'),
    ]

    operations = [
        migrations.CreateModel(
            name='Ansible_Playbook_Number',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('playbook_server', models.CharField(blank=True, max_length=100, null=True, verbose_name='\u76ee\u6807\u670d\u52a1\u5668')),
                ('playbook', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='server_number', to='ops.Ansible_Playbook')),
            ],
            options={
                'verbose_name': 'Ansible\u5267\u672c\u6210\u5458\u8868',
                'verbose_name_plural': 'Ansible\u5267\u672c\u6210\u5458\u8868',
                'permissions': (('can_read_ansible_playbook_number', '\u8bfb\u53d6Ansible\u5267\u672c\u6210\u5458\u6743\u9650'), ('can_change_ansible_playbook_number', '\u66f4\u6539Ansible\u5267\u672c\u6210\u5458\u6743\u9650'), ('can_add_ansible_playbook_number', '\u6dfb\u52a0Ansible\u5267\u672c\u6210\u5458\u6743\u9650'), ('can_delete_ansible_playbook_number', '\u5220\u9664Ansible\u5267\u672c\u6210\u5458\u6743\u9650')),
            },
        ),
    ]