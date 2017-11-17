# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2017-11-14 21:04
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ops', '0018_auto_20171114_1703'),
    ]

    operations = [
        migrations.AlterField(
            model_name='hostinfo',
            name='alive',
            field=models.CharField(blank=True, max_length=256, null=True),
        ),
        migrations.AlterField(
            model_name='hostinfo',
            name='su',
            field=models.CharField(blank=True, default='N', max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name='hostinfo',
            name='sudo',
            field=models.CharField(blank=True, default='N', max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name='hostinfo',
            name='us_su',
            field=models.CharField(choices=[('N', 'N'), ('Y', 'Y')], default='N', max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name='hostinfo',
            name='us_sudo',
            field=models.CharField(choices=[('N', 'N'), ('Y', 'Y')], default='N', max_length=10, null=True),
        ),
    ]