#-*- coding=utf-8 -*-
#!/usr/bin/env python
from tornado.options import options, define, parse_command_line
import sys,os,json,subprocess
import base64,logging
import tornado.httpserver
import tornado.ioloop
import tornado.wsgi
import tornado.web
import tornado.websocket
from daemon import Bridge
from data import ClientData
from utils import check_ip, check_port
import django.core.handlers.wsgi

define('port', type=int, default=8002)


class IndexHandler(tornado.web.RequestHandler):

    def get(self):
        self.render("test1.html")

class WSHandler(tornado.websocket.WebSocketHandler):

    clients = dict()

    def get_client(self):
        return self.clients.get(self._id(), None)

    def put_client(self):
        bridge = Bridge(self)
        self.clients[self._id()] = bridge

    def remove_client(self):
        bridge = self.get_client()
        if bridge:
            bridge.destroy()
            del self.clients[self._id()]

    @staticmethod
    def _check_init_param(data):
        return check_ip(data["hostname"]) and check_port(data["port"])

    @staticmethod
    def _is_init_data(data):
        return data.get_type() == 'init'

    def _id(self):
        return id(self)

    def open(self):
        self.put_client()

    def on_message(self, message):
        bridge = self.get_client()
        # logging.info(' bridge client :%s' % bridge)
        client_data = ClientData(message)
        if self._is_init_data(client_data):
            if self._check_init_param(client_data.data):
                bridge.open(client_data.data)
                logging.info('connection established from: %s' % self._id())
            else:
                self.remove_client()
                logging.warning('init param invalid: %s' % client_data.data)
        else:
            if bridge:
                bridge.trans_forward(client_data.data)

    def on_close(self):
        self.remove_client()
        logging.info('client close the connection: %s' % self._id())

settings = {
        "template_path":os.path.join(os.path.dirname(__file__),"../devops/templates"),
        "static_path":os.path.join(os.path.dirname(__file__),"../devops/static"),
        }

def main():
   # os.environ['DJANGO_SETTINGS_MODULE'] = 'devops.settings' # TODO: edit this
   # sys.path.append('./devops') # path to your project if needed

    parse_command_line()
    options.parse_config_file("webssh.conf")

    #wsgi_app = get_wsgi_application()
    #container = tornado.wsgi.WSGIContainer(wsgi_app)
    wsgi_app = tornado.wsgi.WSGIContainer(
    django.core.handlers.wsgi.WSGIHandler())

    tornado_app = tornado.web.Application(
        [
	   (r"/", IndexHandler),
	   (r"/ws", WSHandler),
            ('.*', tornado.web.FallbackHandler, dict(fallback=wsgi_app)),
        ],**settings)

    server = tornado.httpserver.HTTPServer(tornado_app)
    server.listen(options.port)

    tornado.ioloop.IOLoop.instance().start()

if __name__ == '__main__':
    main()
