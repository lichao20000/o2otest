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
import usersvc
import random
import time


login_bp = Blueprint('login_bp', __name__, template_folder='templates')


@login_bp.route('/login/', methods=['GET'])
@jview('login/login.html')
def login_():
    user = request.environ['user']
    if user.authenticated:
        return redirect('/')
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
        usersvc.set_user_base_info({
            'user_id': user_info['uni_email'],
            'user_name': user_info['full_name'],
            'mobile': user_info['mobile']
            })

        user_local_info = usersvc.get_user_local_info(user_info['uni_email']) 
        user = request.environ['user']
        user.user_name = user_info['full_name']
        user.user_id = user_info['uni_email']
        user.privs =  user_local_info['privs'] or []
        user.user_info = user_local_info # user_info 存储本地表读取的用户信息
        user.save_to_session()
        if not user.user_info['channel_id'] or not user.user_info['sales_depart_id']:
            return redirect('/user/setting/')
        return redirect('/')
    except Abort, e:
        msg = e.msg
    return msg


@login_bp.route('/msg_code.json', methods=['GET', 'POST'])
@jview
def get_msg_code():
    args = request.args
    if request.method == 'POST':
        args = request.form
    msg_phone = args.get('phone','')
    uni_email = args.get('uni_email','')
    user = request.environ['user']
    result, msg, msg_code = False, '', None
    try:
        if user.authenticated:
            raise Abort(u'您已经登入.')
        if not msg_phone or not uni_email:
            raise Abort(u'无效的手机号码或集团邮箱')
        if user.msg_time and time.time() - user.msg_time < 120:
            raise Abort(u'操作太过频繁，请稍后再试')
        user_info = usersvc.get_bcmaanger_info(uni_email)
        #if not user_info or user_info['mobile'] != msg_phone:
            #raise Abort(u'机号码或集团邮箱不存在')
        msg_code = str(random.random())[2:8]
        print msg_code
        user.msg_code = msg_code
        user.msg_time = time.time()
        user.msg_phone = msg_phone
        user.msg_email = uni_email
        user.save_to_session()
        # send_msg()   # TODO
        result = True
    except Abort, e:
        msg = e.msg
    return {'result':result ,
            'msg': msg ,
            'msg_code': msg_code if result else None
            }






@login_bp.route('/login_validate.json', methods=['GET', 'POST'])
@jview
def login_json():
    args = request.args
    if request.method == 'POST':
        args = request.form
    msg_code = args.get('msg_code','')
    result, msg = False, ''
    user = request.environ['user']
    try:
        if not user.msg_code or not user.msg_email or not user.msg_time \
                or time.time() - user.msg_time > 60*5:
            raise Abort(u'请重新获取验证码.')
        if not msg_code:
            raise Abort(u'无效的验证码.')
        print msg_code, user.msg_code 
        if user.msg_code != msg_code:
            raise Abort(u'请输入正确的验证码.')
        user_info = usersvc.get_bcmaanger_info(user.msg_email)

        usersvc.set_user_base_info({
            'user_id': user_info['uni_email'],
            'user_name': user_info['full_name'],
            'mobile': user_info['mobile']
            })


        user.user_name = user_info['full_name']
        user.user_id = user_info['uni_email']
        user_local_info = usersvc.get_user_local_info(user_info['uni_email']) 

        user.privs =  user_local_info['privs'] or []
        user.user_info = user_local_info

        user.msg_code = None
        user.msg_phone = None
        user.msg_time = None
        user.msg_email = None
        user.save_to_session()
        result = True
    except Abort, e:
        msg = e.msg
    return {'result': result,
            'msg' : msg, }



 




