#!/usr/bin/env python
# coding:utf-8
import threading, Queue, time
from ssh_thread_num import AutoGetThreadNum
from ssh_modol_controler import SSHControler
from ssh_error import SSHError
from .. import ssh_settings
import os, sys, json,redis

class SSHThreadAdmin(object):
    def __init__(self):
            self.r = redis.StrictRedis(host=ssh_settings.redisip, port=ssh_settings.redisport, db=0)

    def run(self, parameter={}):
        ssh_info = {"status": True, "content": ""}
        try:
            task_type = parameter["task_type"]
            tid = parameter["tid"]
            multi_thread = parameter["multi_thread"]
            if not type(multi_thread) == type(False): raise SSHError("CHB0000000010")
            if task_type == "cmd":
                cmd = parameter["cmd"]
                servers = parameter["servers"]
                if not type(servers) == type([]): raise SSHError("CHB0000000011")
                total = "total.%s" % tid
                current = "current.%s" % tid
                self.r.set(total, len(servers))
                self.r.set(current, 0)
                # SSHConnector.progress[total]=len(servers)
                # SSHConnector.progress[current]=0
                if multi_thread:
                    pool = SSHPool()
                    for s in servers:
                        controler = SSHControler()
                        param = {"cmd": cmd, "ip": s, "tid": tid}
                        print param,'36'
                        pool.add_task(controler.command_controler, param)

                else:

                    for s in servers:
                        controler = SSHControler()
                        controler.command_controler(cmd=cmd, ip=s, tid=tid)

            elif task_type == "file":
                pass
            else:
                raise SSHError("CHB0000000009")
        except Exception, e:
            ssh_info["content"] = str(e)
            ssh_info["status"] = False
        print ssh_info

        return ssh_info


class SSHThread(threading.Thread):
    def __init__(self, queue):
        threading.Thread.__init__(self)
        self.queue = queue
        self.daemon = True
        self.start()

    def run(self):
        while True:
            try:
                func, kws = self.queue.get()
                func(**kws)
            except Exception, e:
                print e
                pass
            self.queue.task_done()


class SSHPool(AutoGetThreadNum):
    def __init__(self):
        AutoGetThreadNum.__init__(self)
        self.thread_num = self.auto_thread()
        self.queue = Queue.Queue(self.thread_num)
        for i in range(self.thread_num):  # 循环多少次，实际上是一个数字
            SSHThread(self.queue)

    def add_task(self, func, dict):
        self.queue.put((func, dict))  # 把参数和函数，放到队列里面去，然后，有一个run会来这里取的

    def all_complete(self):
        self.queue.join()


def test_func(**kws):
    time.sleep(0.5)
    print "argssssssssssssssssss", kws


if __name__ == '__main__':
    p = SSHPool()
    for i in range(20):
        p.add_task(test_func, {"username": i})
    p.all_complete()
