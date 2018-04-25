#-*- coding: utf-8 -*-

import os, sys

_dir = os.path.dirname(os.path.abspath(__file__))
if _dir not in sys.path:
    sys.path.insert(0, _dir)


from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop


from app import app
import config
from session import SessionMiddleware

if __name__ == '__main__':
    port = config.port
    _argv = sys.argv[1:]
    if _argv and _argv[0].isdigit():
        port = int(_argv[0])

    #app.wsgi_app = AccessControlMiddleware(app.wsgi_app,
    #                                       allow_headers=['set-session-id'])
    app.wsgi_app = SessionMiddleware(app.wsgi_app)
    http_server = HTTPServer(app)
    http_server.listen(port)
    IOLoop.instance().start()
