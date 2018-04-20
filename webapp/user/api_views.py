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
import usersvc
from menu import items as menus

api_bp = Blueprint('user_api_bp', __name__, template_folder='templates')

@api_bp.route('/menus.json', methods=['POST', 'GET'])
@auth_required
@jview
def menus():
    u'''
    获取菜单 
    '''
    return usersvc.get_channels()




@api_bp.route('/get_channels.json', methods=['POST', 'GET'])
@auth_required
@jview
def get_channel():
    u'''
    获取渠道信息
    '''
    return usersvc.get_channels()




@api_bp.route('/set_sales_info.json', methods=['POST', 'GET'])
@auth_required
@jview
def set_sales_info():
    u'''
    第一次登入需要设置 渠道， 区分信息
    市公司管理不能通过此接口设置 
    '''
    args = request.args
    if request.method == 'POST':
        args = request.form
    channel_id = _int(args.get('channel_id','')  )
    sales_depart_id = _int(args.get('sales_depart_id','')  )
    user = request.environ['user']
    result, msg = False, ''
    try:
        if not channel_id or not sales_depart_id: 
            raise Abort(u'无效渠道id或区分id')
        # 检查是否已设置过
        user_info = usersvc.get_user_local_info(user.user_id)
        if user_info['channel_id'] or user_info['sales_depart_id']:
            raise Abort(u'已设置过渠道和区分信息（修改请联系管理人员）')
        # 检查渠道和区分对应关系
        channels = usersvc.get_channels()
        _channel = [c for c in channels if c['channel_id']==channel_id]
        if not _channel:
            raise Abort(u'设置的渠道不存在')
        _depart = [ d for d in _channel[0]['departs']  if d['sales_depart_id'] ==sales_depart_id]
        if not _depart:
            raise Abort(u'设置的渠道和区分错误')
        result = usersvc.set_user_sales_info(user.user_id, channel_id, sales_depart_id)
        if result:
            user.user_info = usersvc.get_user_local_info(user.user_id)
            user.save_to_session()
    except Abort, e:
        msg = e.msg
    return {'result': result, 'msg': msg}
