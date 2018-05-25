# -*- coding: utf-8 -*-

import os
import sys

_dir = os.path.dirname(os.path.abspath(__file__))
if _dir not in sys.path:
    sys.path.append(_dir)

env_keys = [(k.lower(), k) for k in os.environ.keys()]
env_keys_d = dict(env_keys)
del_keys = ('http_proxy', 'https_proxy',)
for k in del_keys:
    if k in env_keys_d:
        del os.environ[env_keys_d[k]]

from flask import Flask
from ui import jview, json_view
from session import SessionMiddleware
import config


app = Flask(__name__, template_folder='templates')
app.debug = True



blueprints = (

    # 首页
    ('index_views.app_bp', ''),

    # 静态文件版本化路径映射
  #  ('static_views.static_bp', '/s'),

   
    ('user.views.user_bp', '/user'),
    ('user.api_views.api_bp', '/user/api'),
    ('user.login_views.login_bp','/u'),

    ('pos.api_views.api_bp','/pos/api'),
    ('saler.api_views.api_bp','/saler/api'),
    ('plan.api_views.api_bp','/plan/api'),

    )


#blueprints = []

for mod_path, mount_point in blueprints:
    parts = mod_path.split('.')
    _path = '.'.join(parts[:-1])
    bp_name = parts[-1]
    mod = __import__(_path, None, None, [bp_name], -1)
    bp = getattr(mod, bp_name)
    app.register_blueprint(bp, url_prefix=mount_point)


rules = [u for u in app.url_map.iter_rules()]
urls = [ {'url':u.rule, 'methods':list(u.methods)}  for u in rules]

def get_all_urls():
    return urls


if __name__ == '__main__':
    _argv = sys.argv[1:]
    port = config.port
    if _argv and _argv[0].isdigit():
        port = int(_argv[0])
        config.port = port
    host = ('0.0.0.0', port)
    app.wsgi_app = SessionMiddleware(app.wsgi_app)
    app.run(host=host[0], port=host[1], debug=True)


