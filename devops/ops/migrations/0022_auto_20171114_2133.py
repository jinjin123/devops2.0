# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2017-11-14 21:33
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ops', '0021_auto_20171114_2126'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='hostinfo',
            name='alive',
        ),
        migrations.AlterField(
            model_name='hostinfo',
            name='key',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
