# *- coding: utf-8 -*-

import os
import sys
_dir = os.path.dirname(os.path.abspath(__file__))



import os
import sys


_dir = os.path.dirname(os.path.abspath(__file__))

from flask import Blueprint, request, redirect, abort
from flask import make_response, render_template

from flask import send_file
from ui import jview, json_view

from libs.session_helper import auth_required
import config
import json
from ui import jview, json_view
from utils import _int, _float, _date, _int_default, Abort
import requests


login_bp = Blueprint('login_bp', __name__, template_folder='templates')


@login_bp.route('/login/', methods=['GET'])
@jview('login/login.html')
def login_():
    return {
            'title': 'Login',
            'response_type': 'code',
            'redirect_uri': config.OAuth2['auth_uri'],
            'auth2_uri':  config.OAuth2['auth2_uri'],
            'client_id':  config.OAuth2['client_id'],#'o2o_sales'
            } 

@login_bp.route('/oauth2/')
@jview
def oauth2():
    code = request.args.get('code')
    try:
        if not code:
            raise Abort(u'认证失败(oauth2返回code为空)!')
        params = dict( code = code,
                client_id = config.OAuth2['client_id'],
                client_secret = config.OAuth2['client_secret'],
                grant_type = 'authorization_code' )
        resp = requests.post(config.OAuth2['token_uri'] ,data=params)
        content = {}
        if resp.status_code == 200 and resp.text:
            try:
                content = json.loads(resp.text) 
            except ValueError,e:
                raise Abort(u'认证失败(解析token错误)')
        token = content.get('access_token')
        if not token:
            raise Abort(u'认证失败(获取token失败)')
        params = dict( access_token = token, 
               client_id = config.OAuth2['client_id'])
        resp = requests.post(config.OAuth2['info_uri'] ,data=params)
        content = {}
        if resp.status_code == 200 and resp.text :
            try:
                content = json.loads(resp.text) 
            except ValueError,e:
                raise Abort(u'认证失败(解析token错误)')
        
        user_info = content.get('user_info')
        if not user_info:
            raise Abort(u'认证失败(获取用户数据出错)')
        ## 到此认证成功
        user = request.environ['user']
        user.user_id = user_info['uni_email']
        user.user_info = user_info
        user.save_to_session()
        return redirect('/')
    except Abort, e:
        msg = e.msg
    return msg







