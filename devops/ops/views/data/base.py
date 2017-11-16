# -*- coding=utf-8 -*-
#/usr/bin/python env
import os,sys
reload(sys)
sys.setdefaultencoding("utf-8")
import redis
from ops.views.ssh_settings import redisip,redisport


class APBase(object):
    REDSI_POOL = 10000

    @staticmethod
    def getRedisConnection(db):
        '''根据数据源标识获取Redis连接池'''
        if db == APBase.REDSI_POOL:
            REDSI_LPUSH_POOL = redis.ConnectionPool(host=redisip, port=redisport,db=db)
        pools = REDSI_LPUSH_POOL
        connection = redis.StrictRedis(connection_pool=pools)
        return connection
