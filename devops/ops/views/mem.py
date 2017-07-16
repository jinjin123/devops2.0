#!/usr/bin/env python
# -*- coding: utf-8 -*-

class MemData:
    def __init__(self):
        self.now_data = {}

    def get_data(self):
        """获取系统内存数据
            @Return: (status, msgs, results)
                status = INT, # Function execution status,
                                0 is normal, other is failure.
                msgs = STRING, # If status equal to 0, msgs is '',
                                 otherwise will be filled with error message.
                result = DICT {  # 单位均为KB
                    'cached': 215008,
                    'memused': 747532,
                    'memtotal': 1011928,
                    'buffers': 201784
                }
        """
        status = 0
        msgs = ""
        results = ""
        try:
            fp = file('/proc/meminfo')
            raw_data = fp.read()
            fp.close()
            temps = raw_data.strip().split('\n')
            for temp in temps:
                tmp = temp.split()
                self.now_data[tmp[0]] = tmp[1]
            results = {}
            results['memtotal'] = int(self.now_data['MemTotal:'])
            results['memused'] = int(self.now_data['MemTotal:']) - \
                int(self.now_data['MemFree:'])
            results['buffers'] = int(self.now_data['Buffers:'])
            results['cached'] = int(self.now_data['Cached:'])
            return (status, msgs, results)
        except Exception, e:
            return (-1, e + 'data error!', '')

if __name__ == "__main__":
    meminfo = MemData()
    print meminfo.get_data()
