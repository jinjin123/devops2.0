#!/usr/bin/env python
#-*- conding:utf-8 -*-
import requests,sys,os,json,time
reload(sys)
sys.setdefaultencoding('utf-8')
class WeiXin(object):
    def __init__(self, corpid, corpsecret):
        self.__params = {
            'corpid': corpid,
            'corpsecret': corpsecret
        }

        self.url_get_token = 'https://qyapi.weixin.qq.com/cgi-bin/gettoken'
        self.url_send = 'https://qyapi.weixin.qq.com/cgi-bin/message/send'
        self.url_uploadimg = 'https://qyapi.weixin.qq.com/cgi-bin/media/uploadimg'
        self.img_url = 'https://qyapi.weixin.qq.com/cgi-bin/media/upload'

        self.__token = self.__get_token()
        self.__token_params = {
            'access_token': self.__token
        }

    def __raise_error(self, res):
        raise Exception('error code: %s,error message: %s' % (res.json()['errcode'], res.json()['errmsg']))
        global senderr
        global sendstatus
        sendstatus = False
        senderr = 'error code: %s,error message: %s' % (res.json()['errcode'], res.json()['errmsg'])

    def __get_token(self):
        # print self.url_get_token
        headers = {'content-type': 'application/json'}
        res = requests.get(self.url_get_token, headers=headers,  params=self.__params,verify=False)

        try:
            return res.json()['access_token']
        except:
            self.__raise_error(res.content)


    def send_message(self,  agentid, messages, userid, toparty,totag):
        payload = {
            'touser': userid,
            'toparty': toparty,
            'totag': totag,
            'agentid': agentid,
            "msgtype": "text",
            "text": messages
        }
        headers = {'content-type': 'application/json'}
        data = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        params = self.__token_params
        res = requests.post(self.url_send, headers=headers, params=params, data=data,verify=False)
        try:
            return res.json()
        except:
            self.__raise_error(res)



if __name__ == '__main__':
	agentid = 1000002
	wx = WeiXin('wxfcf60e7eba5f47f3', 'KBUIEJBhIo4WBaNRddq79tSzL_SuPWIATfHDF9iQ6yk')
	print wx
	message = {"content": "aaaaaa"}
	data = wx.send_message(userid='@all',agentid=agentid,toparty=4,totag=4,messages=message)
	print data
