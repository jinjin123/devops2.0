# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2017-11-14 21:35
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ops', '0022_auto_20171114_2133'),
    ]

    operations = [
        migrations.AddField(
            model_name='hostinfo',
            name='alive',
            field=models.CharField(blank=True, max_length=256, null=True),
        ),
        migrations.AlterField(
            model_name='hostinfo',
            name='key',
            field=models.CharField(blank=True, default='N', max_length=100, null=True),
        ),
    ]
