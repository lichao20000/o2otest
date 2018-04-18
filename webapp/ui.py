#-*- coding: utf-8 -*-

import re
import urllib
import functools
import flask
import jinja2
from flask import render_template, request, make_response
from utils import json_dumps
import json
import zlib
import config
import os

def jview(arg):
    if isinstance(arg, str) or isinstance(arg, unicode):
        tpl_path = arg
        def wrapper_maker(view_func):
            @functools.wraps(view_func)
            def wrapper(*args, **kargs):
                result = view_func(*args, **kargs)
                if isinstance(result, dict):
                    if 'static' not in result:
                        result['static'] = {
                            'version': '20170922-2',
                            'random': os.urandom(6).encode('hex')
                        }
                    if 'user' in request.environ:
                        result['current_user'] = request.environ['user']
                    if 'debug' not in result:
                        result['debug'] = config._debug_
                    return render_template(tpl_path, **result)
                return result
            return wrapper
        return wrapper_maker
    else:
        return json_view(arg)

def _json_view_options(grant_preflighted_request, allow_origin):
    resp = make_response('')
    if grant_preflighted_request:
        _key_method = 'Access-Control-Request-Method'
        _key_headers = 'Access-Control-Request-Headers'
        req_method = ''
        if _key_method in request.headers:
            req_method = request.headers[_key_method]
        req_headers = ''
        if _key_headers in request.headers:
            req_headers = request.headers[_key_headers]
        resp.headers['Access-Control-Allow-Origin'] = allow_origin
        if req_method:
            resp.headers['Access-Control-Allow-Methods'] = req_method
        if req_headers:
            resp.headers['Access-Control-Allow-Headers'] = req_headers
    return resp

# def json_view(*_args, gzip=False, no_cache=False, allow_origin='', **_kargs):
def json_view(*_args, **_kargs):
    arg = _args[0] if _args else {}
    gzip = _kargs.get('gzip', False)
    no_cache = _kargs.get('no_cache', False)
    allow_origin = _kargs.get('allow_origin', '*')
    grant_preflighted_request = _kargs.get('grant_preflighted_request', True)
    if isinstance(arg, dict):
        headers = arg
        def wrapper_maker(view_func):
            @functools.wraps(view_func)
            def wrapper(*args, **kargs):
                if request.method.lower() == 'options':
                    return _json_view_options(grant_preflighted_request, allow_origin)
                _args = request.args
                callback = _args['callback'] if 'callback' in _args else None
                if request.method == 'POST':
                    _args = request.form
                if 'callback' in _args:
                    callback = _args['callback']
                view_data = view_func(*args, **kargs)
                if isinstance(view_data, flask.Response):
                    return view_data
                if callback:
                    resp_text = json_dumps(view_data)
                    resp_text = callback+'('+resp_text+')'
                else:
                    resp_text = json_dumps(view_data)
                # -------------------- compress --------------------
                IE = re.search(r'(?:msie)|(?:boie)|(?:trident\/\d+)', 
                               request.user_agent.string, 
                               re.I|re.S)
                # print request.user_agent.string
                content_type = 'application/json;charset=UTF-8'
                compress = gzip and len(resp_text) > 1024*4
                accept_enc = request.headers['accept-encoding'] \
                    if 'accept-encoding' in request.headers else ''
                accept_enc = accept_enc or accept_enc
                accept_enc = re.split(r'[\,\;\s]+', accept_enc.lower(), re.S)
                if compress and 'deflate' in accept_enc:
                    resp = make_response(zlib.compress(resp_text))
                    # resp.content_type = 'text/javascript; charset=utf-8'
                    resp.content_type = content_type
                    if IE:
                        # IE
                        resp.headers['Content-Encoding'] = 'gzip'
                    else:
                        resp.headers['Content-Encoding'] = 'deflate'
                else:
                    resp = make_response(resp_text)
                    resp.content_type = content_type
                # -------------------- no-cache --------------------
                _cache_control = ('no-cache',
                                  'no-store',
                                  'must-revalidate',)
                _cache_control = ','.join(_cache_control)
                resp.headers['cache-control'] = _cache_control
                resp.headers['pragma'] = 'no-cache'
                resp.headers['expires'] = '0'
                # -------------------- -------- --------------------
                _req_origin = request.headers.get('origin', u'') or allow_origin
                _req_origin = _req_origin or '*'
                resp.headers['Access-Control-Allow-Origin'] = _req_origin
                resp.headers['Access-Control-Allow-Credentials'] = 'true'
                for h in headers:
                    resp.headers[h] = headers[h]
                return resp
            return wrapper
        return wrapper_maker
    else:
        view_func = arg
        @functools.wraps(view_func)
        def wrapper(*args, **kargs):
            if request.method.lower() == 'options':
                return _json_view_options(grant_preflighted_request, allow_origin)
            _resp = view_func(*args, **kargs)
            if isinstance(_resp, list) or isinstance(_resp, dict) \
                    or isinstance(_resp, tuple):
                resp = make_response(json_dumps(_resp))
                resp.content_type = 'text/javascript; charset=utf-8'
                _req_origin = request.headers.get('origin', u'') or allow_origin
                resp.headers['Access-Control-Allow-Origin'] = _req_origin
                resp.headers['Access-Control-Allow-Credentials'] = 'true'
                return resp
            return _resp
        return wrapper
