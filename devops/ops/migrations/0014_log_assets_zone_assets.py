# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2017-11-13 21:31
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ops', '0013_auto_20171113_2127'),
    ]

    operations = [
        migrations.CreateModel(
            name='Log_Assets',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('assets_id', models.IntegerField(blank=True, default=None, null=True, verbose_name='\u8d44\u4ea7\u7c7b\u578bid')),
                ('assets_user', models.CharField(default=None, max_length=50, verbose_name='\u64cd\u4f5c\u7528\u6237')),
                ('assets_content', models.CharField(default=None, max_length=100, verbose_name='\u540d\u79f0')),
                ('assets_type', models.CharField(default=None, max_length=50)),
                ('create_time', models.DateTimeField(auto_now_add=True, null=True, verbose_name='\u6267\u884c\u65f6\u95f4')),
            ],
            options={
                'db_table': 'opman_log_assets',
                'verbose_name': '\u9879\u76ee\u914d\u7f6e\u64cd\u4f5c\u8bb0\u5f55\u8868',
                'verbose_name_plural': '\u9879\u76ee\u914d\u7f6e\u64cd\u4f5c\u8bb0\u5f55\u8868',
            },
        ),
        migrations.CreateModel(
            name='Zone_Assets',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('zone_name', models.CharField(max_length=100, unique=True)),
            ],
            options={
                'db_table': 'opman_zone_assets',
                'verbose_name': '\u673a\u623f\u8d44\u4ea7\u8868',
                'verbose_name_plural': '\u673a\u623f\u8d44\u4ea7\u8868',
                'permissions': (('can_read_zone_assets', '\u8bfb\u53d6\u673a\u623f\u8d44\u4ea7\u6743\u9650'), ('can_change_zone_assets', '\u66f4\u6539\u673a\u623f\u8d44\u4ea7\u6743\u9650'), ('can_add_zone_assets', '\u6dfb\u52a0\u673a\u623f\u8d44\u4ea7\u6743\u9650'), ('can_delete_zone_assets', '\u5220\u9664\u673a\u623f\u8d44\u4ea7\u6743\u9650')),
            },
        ),
    ]
