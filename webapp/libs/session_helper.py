#-*- coding: utf-8 -*-

import os, sys

_dir = os.path.dirname(os.path.abspath(__file__))
_webdir = os.path.abspath(os.path.join(_dir, '..'))

import base64
import functools
from flask import request, redirect, abort
from flask import render_template, make_response
from utils import json_dumps
#from privs import Priv
#from user import usersvc
import config


# HOST  = 'http://u.sit.zootopia.unicom.local/api/profile'
# SECRET = 'Ouy1S2Qxb8iEDQxSJjz3qBmXRrC9ZydEUkMVi3nFPm1VC0kR51yFWGZX0VMfrvYCV8xuKuizfXju8xZaNqRp6LBqy3lBDdVpJaBB0cVOZRGl9blwGX3pWvmFezJwGcez'

def js_redirect(*args):
    tpl = render_template('js_redirect.html')
    resp = make_response(tpl)
    return resp

import inspect

auth_urls = []

def get_auth_urls():
    return  auth_urls

def auth_required(*args, **kargs):
    stack = inspect.stack()
    co_filename = stack[1][1]
    f_lineno = stack[1][2]
    _u = { 'invoke_info':{'co_filename': co_filename, 'f_lineno': f_lineno}}
    if 'url' in kargs:
        _u['url'] = kargs['url']
    if 'priv' in kargs:
        _u['priv'] = kargs['priv'].get_code()
    auth_urls.append(_u)
    def pri_check(user, k_args):
        if 'priv' in k_args:
            priv_required = k_args['priv']
            if not priv_required:
                return
            if isinstance(priv_required, list):
                privs = priv_required[:]
                privs = reduce(lambda (l,p): l|P(p) if l else P(p), privs)
                priv_required = privs
            elif isinstance(priv_required, str):
                priv_required = Priv(priv_required)
            elif hasattr(priv_required, 'fullfilled_by'):
                pass
            else:
                return
            privs = user.privileges
            # print privs
            # print priv_required
            if not priv_required.fullfilled_by(privs):
                abort(403)
                return
    #  without args
    if not kargs and callable(args[0]):
        view_func = args[0]
        @functools.wraps(view_func)
        def wrapper(*v_args, **k_args):
            user = request.environ['user']
            # if not user.authenticated and config.auto_check_unicom_session:
            #     import requests,json
            #     zootopiasid =  request.cookies.get('ZOOTOPIASID',None)
            #     result =  requests.get('%s?secret=%s&session=%s' %(HOST, SECRET, zootopiasid))
            #     user_json = {} 
            #     if result.status_code == 200:
            #         user_json = json.loads(result.text)
            #     user_data = user_json.get('data',None)
            #     if not user_data:
            #         #usersvc.register_user(user_id)
            #         return redirect('/u/login/?path=%s'% request.path)
            #     else:
            #         _,user_id = usersvc.register_or_update_user(user_data)
            #         user_info = usersvc.get_user_info(user_id)
            #         if not user_info:
            #             raise Abort(u'用户资料缺失，注册失败。')
            #         user.user_id = user_id
            #         user.user_info = user_info
            #         user.save_to_session()

            if not user.authenticated:
                # raise Abort(u'需要登录。')
                # return redirect('/u/login/?path=%s' % request.path)
                return js_redirect()
        
            # pri_check(user, k_args)
            result_chk = pri_check(user, k_args)
            if result_chk:
                return result_chk
            result = view_func(*v_args, **k_args)
            if isinstance(result, dict):
                result['user'] = user.get_dict()
                result['user_json'] = json_dumps(user.get_dict())
            return result
        return wrapper 
    #  with args
    else:
        def wrapper_maker(view_func):
            @functools.wraps(view_func)
            def _wrapper(*v_args, **v_kargs):
                user = request.environ['user']
                inject = False
                if 'inject' in kargs:
                    inject = kargs['inject']
                if 'ignore' in kargs and kargs['ignore']:
                    pass
                else:
                    # do dac check
                    if not user.authenticated:
                        # url = '/u/login/?path=%s'
                        # url = url % request.path
                        # resp = redirect(url)
                        # return resp
                        return js_redirect()
                    result_chk = pri_check(user,kargs)
                    if result_chk:
                        return result_chk
                result = view_func(*v_args, **v_kargs)
                if isinstance(result, dict) and inject:
                    result['user'] = user.get_dict()
                    result['user_json'] = json_dumps(user.get_dict())
                return result
            return _wrapper
        return wrapper_maker


if __name__ == '__main__':
    test()
