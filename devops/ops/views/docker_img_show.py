#-*- coding=utf8 -*-
#/usr/bin/python env
import os,sys
reload(sys)
import requests,time
import simplejson as json
from requests.auth import HTTPBasicAuth

class Docker_registry(object):
    def __init__(self,address='',repo_user='',repo_pass='',image=None,time=''):
        self.url = address
        self.user = repo_user
        self.pwd = repo_pass
        self.image = image
        self.time = time

        # self.status = self.__getconnect()

    def GetconnDkRp(self):
        results = {}
        try:
            r = requests.get(url=self.url + "/v2/_catalog", auth=HTTPBasicAuth(self.user, self.pwd), timeout=10)
            # r = request.get(url=http://139.219.105.52:5000/v2/_catalog/,auth=HTTPBasicAuth(j,j))
            if r.status_code == 200:
                results["status"] = r.status_code
        except Exception,e:
            results["status"] = "连接仓库失败"

        return json.dumps(results)


    def docker_img_content(self):
        images = []
        images_list = []
        try:
            r = requests.get(url=self.url + "/v2/_catalog", auth=HTTPBasicAuth(self.user, self.pwd), timeout=10)
            image_result = json.loads(r.text).get('repositories', [])
            # print image_result, '750'
            for i in image_result:
                img_data = {}
                img = i.split('/')
                if len(img) == 1:
                    img_data["title"] = img[0]
                elif len(img) == 2:
                    img_data["title"] = img[1]
                    img_data["parent"] = img[0]

                images_list.append(img_data)

            temp_tree_view = {}
            for i in images_list:
                if i.has_key("parent"):
                    if not temp_tree_view.has_key(i['parent']):
                        temp_tree_view[i['parent']] = []
                    temp_tree_view[i['parent']].append(i['title'])
                else:
                    images.append({
                        "name": i['title'],
                    })

            for t, n in temp_tree_view.items():
                tt = {}
                tt['name'] = t
                tt['sub'] = []
                for nn in n:
                    tt['sub'].append({
                        "name": nn,
                    })
                images.append(tt)
            # print images,'56'

        except Exception,e:
            print e

        return images

    def docker_img_tags(self):
        tags = {
            "image_name": self.image,
            "tag_list": []
        }
        try:
            r = requests.get(url=self.url + "/v2/" + self.image + "/tags/list",
                             auth=HTTPBasicAuth(self.user, self.pwd), timeout=5)
            if r.status_code == 200:
                t_list = json.loads(r.text).get('tags', [])
                for t in t_list:
                    img = {}
                    tr = requests.get(url=self.url + "/v2/" + self.image + "/manifests/" + t,
                                      auth=HTTPBasicAuth(self.user, self.pwd),
                                      timeout=5,
                                      headers={'Accept': 'application/vnd.docker.distribution.manifest.v2+json'}
                                      )
                    print tr.headers
                    t_info = json.loads(tr.text)
                    if not t_info.has_key('errors'):
                        last_modified = time.strftime("%Y-%m-%d %H:%M:%S",
                                                      time.strptime(tr.headers.get('Last-Modified', ''),
                                                                    '%a, %d %b %Y %H:%M:%S GMT'))
                        img["layer_count"] = len(t_info.get('layers'))
                        img["layer_detail"] = t_info.get('layers')
                        img["url"] = self.url + "/" + self.image + ":" + t
                        img["tag"] = t
                        img["digest"] = tr.headers.get('Docker-Content-Digest', '')
                        img["last_modified"] = last_modified
                        tags['tag_list'].append(img)
                        print json.dumps(tags)

        except Exception, e:
            print "get tags error: " + str(e)

        return tags

    def del_manifests(self,image,tag):
        result =  {"status": True }
        try:
            rr = requests.get(url=self.url + "/v2/" + image + "/manifests/" + tag,auth=HTTPBasicAuth(self.user,self.pwd),
                headers={'Accept':'application/vnd.docker.distribution.manifest.v2+json'},
                timeout=5
            )
            digest = rr.headers.get('Docker-Content-Digest','')
            ###get the  layer  id  to remove it
            if digest:
                del_url = self.url + "/v2/" + image + "/manifests/" + digest
                ###return  status code
                dr =  requests.delete(url=del_url,auth=HTTPBasicAuth(self.user,self.pwd),timeout=5)
                get_tag = requests.get(url=self.url + "/v2/" + image + "/manifests/" + tag,auth=HTTPBasicAuth(self.user,self.pwd),timeout=5)
                if not json.loads(get_tag.text).has_key('errors'):
                        result["status"] = False
                if dr == 202 :
                        result["status"] = True
            else:
                dr = requests.delete(url=self.url,auth=HTTPBasicAuth(self.user,self.pwd),timeout=5)
                get_tag = requests.get(url=self.url + "/v2/" + image + "/manifests/" + tag,auth=HTTPBasicAuth(self.user,self.pwd),timeout=5)
                if not json.loads(get_tag.text).has_key('errors'):
                    result["status"] = False
                if dr == 202:
                    result["status"] = True
        except Exception,e:
            print str(e),'140'
        # print result
        return  json.dumps(result)



if __name__ ==  '__main__':
    a =  Docker_registry(address='http://139.219.105.52:5000/',repo_user='j',repo_pass='j',time=10)
    b = a.GetconnDkRp()
    print b
