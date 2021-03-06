from subprocess import check_output
from string import ascii_uppercase, digits
from random import SystemRandom
import psutil
import shutil
import requests,time
import json,re,ssh_settings
from django.conf import settings


class DHost(object):
    @classmethod
    def disk_size(self):
        x = shutil.disk_usage('/')
        return format(x.total / 1024 / 1024 / 1024, '.2f')

    @classmethod
    def free_space(self):
        x = shutil.disk_usage('/')
        return format(x.free / 1024 / 1024 / 1024, '.2f')

    @classmethod
    def used_space(self):
        x = shutil.disk_usage('/')
        return format(x.used / 1024 / 1024 / 1024, '.2f')

    @classmethod
    def net_inbound(self):
        return "3"

    @classmethod
    def net_outbound(self):
        return "3"

    @classmethod
    def memory(self, type):
        mem = psutil.virtual_memory()
        if type == 'total':
            return format(mem.total / 1024 / 1024, '.0f')
        elif type == 'available':
            return format(mem.available / 1024 / 1024, '.0f')
        elif type == 'used':
            return format(mem.used / 1024 / 1024, '.0f')
        elif type == 'free':
            return format(mem.free / 1024 / 1024, '.0f')
        elif type == 'cached':
            return format(mem.cached / 1024 / 1024, '.0f')

    @classmethod
    def cpu(self, type):
        if type == 'count':
            return psutil.cpu_count()
        elif type == 'cpu_percent':
            return psutil.cpu_percent(interval=1)


class ImageMixin(object):
    def run_macvlan(self, cores, memory, ip_addr, mac_addr, hostname):
        #TODO implement with api, or handle exception
        run_cmd = 'docker run --cpuset-cpus=%s -m %sM --net=dbox_macvlan \
                --ip=%s --mac-address %s -h %s -itd %s' % (cores, memory, \
                ip_addr, mac_addr, hostname, self.name)
        return check_output(run_cmd, shell=True)[0:12]

    @staticmethod
    def run_bridge(cores, memory, ip_addr, hostname,name):
        #TODO implement with api, or handle exception
        run_cmd = 'docker run --cpuset-cpus=%s -m %sM --net=dbox_bridge \
                --ip=%s -h %s --name %s -itd %s' % (cores, memory, ip_addr, hostname, hostname,name)
        return check_output(run_cmd, shell=True)[0:12]

    @staticmethod
    def remove(name):
        response = requests.delete('http://localhost:' + settings.DOCKER_API_PORT + '/images/' + name)
        return response.status_code

    @staticmethod
    def details(name,tag):
        encode_name = name.replace('/', '%2F')
        print encode_name
        details_rg = requests.get('http://localhost:%s/images/%s:%s/json' % (settings.DOCKER_API_PORT, encode_name, tag))
        j_details = details_rg.json()
        details_d = {'size': j_details['Size'] / 1000000, 'created': j_details['Created'].split('.')[0].replace('T', ' '), 'id': j_details['Id'].split(":")[1][:10]}
        return details_d

    def image_id(self):
        encode_name = self.name.replace('/', '%2F')
        response = requests.get('http://localhost:%s/images/%s:%s/json' % (settings.DOCKER_API_PORT, encode_name, self.tag))
        return response.json()['Id']

    def has_access(self, user):
        if user.is_superuser or self.user == user:
            return True
        else:
            return False

class  EmailMinxin:
    def email(self,email,password):
        # cmd = '/usr/bin/python  %s %s %s %s' % (format(ssh_settings.HOME + '/devops/ops/views/emmail.py'),user,email,password)
        # cmd = '/usr/bin/python  %s %s %s' % (format(ssh_settings.HOME + '/devops/ops/views/emmail.py'),email,password)
        cmd = '/usr/bin/python  %s  %s %s' % (format(ssh_settings.HOME + '/devops/ops/views/emmail.py'),email,password)
        # cmd = '/usr/bin/python  %s ' % (format(ssh_settings.HOME + '/devops/ops/views/emmail.py'))
        data = str(check_output(cmd,shell=True))
        result = dict({"content": data})
        return  json.dumps(result)


class ContainerMixin:
    def has_access(self, user):
        if user.is_superuser or self.user == user:
            return True
        else:
            return False

    @staticmethod
    def time():
        return (int(time.time()) + 8 * 3600) * 1000

    @staticmethod
    def cpu(container_id):
        container_id = str(container_id)
        response = str(check_output("docker stats --no-stream " + container_id + "| tail -1", shell=True))
        response = response.split()
        if response:
            result = float(response[1].split('%')[0])
            #['c63b28fdb64b', '0.00%', '3.258MiB', '/', '300MiB', '1.09%', '20.8kB', '/', '5.38kB', '11.8MB', '/', '0B', '3']
        return result

    @staticmethod
    def memusage(container_id):
        container_id = str(container_id)
        response = str(check_output("docker stats --no-stream " + container_id + "| tail -1", shell=True))
        response = response.split()
        if response:
            mem_usage = float(response[2].split('M')[0])
            mem_limit = int(response[4].split('M')[0])
            # result = '[{"cpu":"%s","memory":"%s","memTotal":"%s","netDow":"%s","netDowUnit":"%s", \
            #          "netUp":"%s","netUpUnit":"%s"}],' % (response[1], response[7], response[5], \
            #          response[8], response[9], response[11], response[12]
        return mem_usage,mem_limit

    @staticmethod
    def mem_percentage(container_id):
        container_id = str(container_id)
        response = str(check_output("docker stats --no-stream " + container_id + "| tail -1", shell=True))
        response = response.split()
        if response:
            result = float(response[5].split('%')[0])
        return result

    @staticmethod
    def network(container_id):
        container_id = str(container_id)
        response = str(check_output("docker stats --no-stream " + container_id + "| tail -1", shell=True))
        response = response.split()
        if response:
            upload = float(response[6].split('k')[0])
            # print response[8]
            download = float(response[8].split('k')[0])
        return upload,download

    @staticmethod
    def start(container_id):
        container_id = str(container_id)
        response = requests.post('http://localhost:' + settings.DOCKER_API_PORT + \
                '/containers/' + container_id + '/start')
        return response

    ### the framework  not support  async,  use yield will block  other  http request
    @staticmethod
    def stats(container_id):
        container_id = str(container_id)
        # while True:
        response = str(check_output("docker stats --no-stream " + container_id + "| tail -1", shell=True))
        response = response.split()
        if response:
            yield '[{"cpu":"%s","memory":"%s","memTotal":"%s","netDow":"%s","netDowUnit":"%s", \
                     "netUp":"%s","netUpUnit":"%s"}],' % (response[1], response[7], response[5], \
                     response[8], response[9], response[11], response[12])
            # print result
            # return result

    @staticmethod
    def stop(container_id):
        container_id = str(container_id)
        response = requests.post('http://localhost:' + settings.DOCKER_API_PORT + \
                    '/containers/' + container_id + '/stop')

        return response
        # return response.json

    @staticmethod
    def restart(container_id):
        container_id = str(container_id)
        response = requests.post('http://localhost:' + settings.DOCKER_API_PORT + \
                '/containers/' + container_id + '/restart')
        return response

    @staticmethod
    def remove(container_id):
        response = ContainerMixin().stop(container_id)
        response = requests.delete('http://localhost:' + settings.DOCKER_API_PORT + \
                '/containers/' + container_id + '?v=1?force=1')
        return response

    def details(self,host,container_id):
        try:
            details_rg = requests.get('http://'+ host + ':' + settings.DOCKER_API_PORT + \
                    '/containers/' + container_id + '/json')
            j_details = details_rg.json()
            details_d = {'memory': j_details['HostConfig']['Memory']/1000000}
            if j_details['HostConfig']['CpusetCpus'] == "":
                details_d['cpu'] = '0'
            else:
                details_d['cpu'] = j_details['HostConfig']['CpusetCpus']
            details_d['image'] = j_details['Config']['Image']
            details_d['servicename'] = j_details['Name'].split('/')[1]
            details_d['container_id'] = container_id
            details_d['dependsnode'] = host
            details_d['user'] = 'all'

            net = j_details['NetworkSettings']['Networks']
            details_d['serviceAddress'] = net['bridge']['IPAddress']
            # if net.get('dbox_macvlan', None):
                # details_d['ip_addr'] = net['dbox_macvlan']['IPAddress']
            # else:
                # details_d['ip_addr'] = net['dbox_bridge']['IPAddress']

            details_d['created'] = j_details['Created'].split('.')[0].replace('T', ' ')
            details_d['running'] = j_details['State']['Running']

            return details_d
        except Exception as e:
            return e

    def running_processes(self):
        processes = requests.get('http://localhost:' + settings.DOCKER_API_PORT + '/containers/' + self.container_id + '/top')
        return processes

    def json(self,host):
        container = requests.get('http://' + host +':'+ settings.DOCKER_API_PORT + '/containers/json')
        return container.json()

    @staticmethod
    def commit(container_id,name):
        params = {'container': container_id, 'repo': name, 'tag': 'latest'}
        response = requests.post('http://localhost:%s/commit' % (settings.DOCKER_API_PORT), params=params)
        return response, response.json()['Id'].split(":")[1][:10]

    @staticmethod
    def checkcontainer(container_id):
        if type(container_id) == str:
            cmd = 'fping %s'% (container_id)
        else:
            cmd = 'fping %s'% (container_id)
        return re.split('(is ' ')',check_output(cmd,shell=True))[2].strip('\n')

    @staticmethod
    def set_passphrase(container_id):
        symbols = '!@#%^&*_-=;:?><,.'
        passphrase = ''.join(SystemRandom().choice(ascii_uppercase+digits+symbols) for _ in range(15))
        if type(container_id) == str:
            cmd = r'''docker exec %s bash -c "echo root:$'%s' | chpasswd"''' % (container_id, passphrase)
        else:
            cmd = r'''docker exec %s bash -c "echo root:$'%s' | chpasswd"''' % (container_id.decode("utf-8"), passphrase)
        check_output(cmd, shell=True)
        return passphrase

    @staticmethod
    def copy_ssh_pub_key(user,container_id,ssh_pub_key):
        if type(container_id) == str:
            cmd = r'''docker exec %s bash -c "ls /root/.ssh || mkdir /root/.ssh && echo '%s' >> /root/.ssh/authorized_keys"''' \
                    % (container_id, ssh_pub_key)
        else:
            cmd = r'''docker exec %s bash -c "ls /root/.ssh || mkdir /root/.ssh && echo '%s' >> /root/.ssh/authorized_keys"''' \
                    % (container_id.decode('utf-8'), ssh_pub_key)
        check_output(cmd, shell=True)

    @staticmethod
    def top(container_id):
        top_rg = requests.get('http://localhost:' + settings.DOCKER_API_PORT + '/containers/%s/top' % (container_id))
        if top_rg.status_code == 200:
            return top_rg.json()
        return None

    @staticmethod
    def diff(container_id):
        diff_rg = requests.get('http://localhost:' + settings.DOCKER_API_PORT + '/containers/%s/changes' % (container_id))
        if diff_rg.status_code == 200:
            return diff_rg.json()
        return []
