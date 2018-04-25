#-*- coding: utf-8 -*-

import os, sys

_dir = os.path.dirname(os.path.abspath(__file__))
if _dir not in sys.path:
    sys.path.insert(0, _dir)


from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop
import tornado
from tornado.wsgi import WSGIContainer



from app import app
import config
from session import SessionMiddleware

if __name__ == '__main__':
    port = config.port
    _argv = sys.argv[1:]
    if _argv and _argv[0].isdigit():
        port = int(_argv[0])
    sockets = tornado.netutil.bind_sockets(port)
    tornado.process.fork_processes(0)
    app.wsgi_app = SessionMiddleware(app.wsgi_app)
    server = HTTPServer(WSGIContainer(app))
    server.add_sockets(sockets)
    IOLoop.current().start()
