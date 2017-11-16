# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2017-11-08 19:37
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('ops', '0008_auto_20171108_1556'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='ansible_playbook',
            options={'permissions': (('can_read_ansible_playbook', '\u8bfb\u53d6Ansible\u5267\u672c\u6743\u9650'), ('can_change_ansible_playbook', '\u66f4\u6539Ansible\u5267\u672c\u6743\u9650'), ('can_add_ansible_playbook', '\u6dfb\u52a0Ansible\u5267\u672c\u6743\u9650'), ('can_delete_ansible_playbook', '\u5220\u9664Ansible\u5267\u672c\u6743\u9650'), ('can_do_all_ansible_playbook', '\u6240\u6709Ansible\u5267\u672c\u6743\u9650')), 'verbose_name': 'Ansible\u5267\u672c\u914d\u7f6e\u8868', 'verbose_name_plural': 'Ansible\u5267\u672c\u914d\u7f6e\u8868'},
        ),
        migrations.AlterModelOptions(
            name='ansible_playbook_number',
            options={'permissions': (('can_read_ansible_playbook_number', '\u8bfb\u53d6Ansible\u5267\u672c\u6210\u5458\u6743\u9650'), ('can_change_ansible_playbook_number', '\u66f4\u6539Ansible\u5267\u672c\u6210\u5458\u6743\u9650'), ('can_add_ansible_playbook_number', '\u6dfb\u52a0Ansible\u5267\u672c\u6210\u5458\u6743\u9650'), ('can_delete_ansible_playbook_number', '\u5220\u9664Ansible\u5267\u672c\u6210\u5458\u6743\u9650'), ('can_do_all_ansible_playbook_number', '\u6240\u6709Ansible\u5267\u672c\u6210\u5458\u6743\u9650')), 'verbose_name': 'Ansible\u5267\u672c\u6210\u5458\u8868', 'verbose_name_plural': 'Ansible\u5267\u672c\u6210\u5458\u8868'},
        ),
    ]
