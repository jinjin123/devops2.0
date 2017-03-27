#-*- coding=utf-8 -*-
#!/usr/bin/env python
from tornado.web import _create_signature_v1, _time_independent_equals
from tornado.escape import utf8
from qr import get_qrcode
from tornado.options import options, define, parse_command_line
from tornado.concurrent import Future
import sys
import os
import base64
import tornado.ioloop
import tornado.web
import tornado.gen
import tornado.httpclient
import tornado.escape
import tornado.httpserver
import tornado.ioloop
import tornado.web
import tornado.wsgi
import uuid
from django.core.wsgi import get_wsgi_application

define('port', type=int, default=8080)


def create_url_signed_value(secret, value):
    signature = _create_signature_v1(secret, value)
    token = "-".join([value, signature])
    return token



class LoginBuff(object):

    def __init__(self):
        self.waiters = {}

    def wait_for_login(self, user_id):
        future = Future()
        self.waiters[user_id] = future
        return future

    def new_login_msg(self, user_id):
        if user_id in self.waiters:
            self.waiters[user_id].set_result(True)
            self.waiters.pop(user_id)


global_login_buff = LoginBuff()


class BaseHandler(tornado.web.RequestHandler):

    def get_current_user(self):
        user_id = self.get_secure_cookie('user_id')
        if not user_id:
            return None
        else:
            return user_id

    def decode_url_signed_value(self, token):
        token = utf8(token)
        parts = utf8(token).split("-")
        if len(parts) != 2:
            return False
        signature = _create_signature_v1(self.application.settings["cookie_secret"], parts[0])
        if not _time_independent_equals(parts[1], signature):
            return False
        try:
            return parts[0]
        except Exception:
            return False


class HelloHandler(BaseHandler):
    def  get(self):
         self.write("ok")
        #self.render("test.html")

class CellPhoneLoginHandler(BaseHandler):

    def get(self, token):
        user_id = self.decode_url_signed_value(token)
        if user_id and user_id in global_login_buff.waiters:
            self.render('cellphone.html')
        else:
            self.write('二维码识别错误，请重新扫码')

    def post(self, token):
        user_id = self.decode_url_signed_value(token)
        if user_id and user_id in global_login_buff.waiters:
            global_login_buff.new_login_msg(user_id)
            # self.write('PC端登录成功！')
            self.redirect("/ops/index")
        else:
            self.write('二维码识别错误，请重新扫码')


class LoginHandler(BaseHandler):
    # @tornado.web.authenticated
    def get(self):
        self.render("login.html",**{"csrf_token":"/ops/login"})

    def post(self):
        self.redirect('/ops/hello')

class LogoutHandler(BaseHandler):

    def get(self):
        self.clear_cookie("user_id")
        self.redirect("/pc")


class PCLoginRedirectHandler(BaseHandler):

    def get(self):
        user_id = uuid.uuid4().get_hex()
        token = create_url_signed_value(self.application.settings["cookie_secret"], user_id)
        print(token)
        url = '/pc/{0}'.format(token)
        self.redirect(url)


class PCLoginHandler(BaseHandler):

    def get(self, token):
        user_id = self.decode_url_signed_value(token)
        if user_id and user_id not in global_login_buff.waiters:
            url = 'http://{0}/cellphone/{1}'.format(self.request.host, token)
            img_data = get_qrcode(url)
            base64_img_data = base64.b64encode(img_data)
            self.render('pc.html', base64_img_data=base64_img_data)
        else:
            self.redirect('/pc')

    @tornado.gen.coroutine
    def post(self, token):
        user_id = self.decode_url_signed_value(token)
        self.user_id = user_id
        login_success = yield global_login_buff.wait_for_login(user_id)
        if login_success:
            self.set_secure_cookie('user_id', user_id)
            self.write('ok')

    def on_connection_close(self):
        global_login_buff.waiters.pop(self.user_id)

settings = {
        "cookie_secret":"81oETzKXQAGaYdkL5gEmGeJJFuYh7EQnpZXdTP1o",
        "login_url" : "/pc",
        "template_path":os.path.join(os.path.dirname(__file__),"templates"),
        "static_path":os.path.join(os.path.dirname(__file__),"static"),
        "debug": True,
        "xsrf_cookie" : True,
        "gzip" : True
        }

def main():
    os.environ['DJANGO_SETTINGS_MODULE'] = 'devops.settings' # TODO: edit this
    sys.path.append('./devops') # path to your project if needed

    parse_command_line()

    wsgi_app = get_wsgi_application()
    container = tornado.wsgi.WSGIContainer(wsgi_app)

    tornado_app = tornado.web.Application(
        [
            (r"/", tornado.web.RedirectHandler, {'url': '/login'}),
            (r"/login",LoginHandler ),
            (r"/cellphone/([^/]+)", CellPhoneLoginHandler),
            (r"/hello", HelloHandler),
            (r"/logout", LogoutHandler),
            (r"/pc/([^/]+)", PCLoginHandler),
            (r"/pc", PCLoginRedirectHandler),
            ('.*', tornado.web.FallbackHandler, dict(fallback=container)),
        ],**settings)

    server = tornado.httpserver.HTTPServer(tornado_app)
    server.listen(options.port)

    tornado.ioloop.IOLoop.instance().start()

if __name__ == '__main__':
    main()