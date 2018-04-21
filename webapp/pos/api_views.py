# *- coding: utf-8 -*-
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
import possvc
from user.privs import PRIV_ADMIN_POS

api_bp = Blueprint('pos_api_bp', __name__, template_folder='templates')

@api_bp.route('/get_pos_list.json', methods=['POST', 'GET'])
@auth_required
@jview
def get_pos_list():
    u'''
    查的数据权限限定在自己所在的渠道、负责的区分
    '''
    args = request.args
    if request.method == 'POST':
        args = request.form
    user = request.environ['user']
    q  = args.get('q', '') 
    pos_id = _int(args.get('pos_id',''))
    pos_type = args.get('pos_type','')
    sales_depart_id = _int(args.get('sales_depart_id',''))

    deleted = args.get('deleted','')
    deleted = -1 if not deleted.isdigit() else _int(deleted)

    channel_id = user.user_info['channel_id'] 
    charge_departs = user.user_info['charge_departs']
        
    if sales_depart_id :
        ids = [sales_depart_id] if sales_depart_id in charge_departs else []
    else:
        ids = charge_departs
    rows = possvc.get_pos_list(q=q, channel_id=channel_id, 
                        pos_id = pos_id, pos_type=pos_type,
                        sales_depart_ids=ids, deleted=deleted)
    return rows
 


@api_bp.route('/update_pos.json', methods=['POST', 'GET'])
@auth_required(priv=PRIV_ADMIN_POS)
@jview
def update_pos():
    u'''
    可以用作删除
    更新 keys 里的字段
    只能更新数据权限范围内的数据
    渠道不能更改
    区分只能改到自己权限范围内 
    '''
    keys = ( 'pos_type', 'sales_id', 'pos_name', 'pos_address', 
                #'channel_id',
                'sales_depart_id', 'deleted',
                'pos_unit', 'pos_code', 'geo_data', )
    args = request.args
    if request.method == 'POST':
        args = request.form
    pos_id =  _int(args.get('pos_id',''))
    result, msg = False, ''
    user = request.environ['user']
    try:
        items =  {}
        for k in keys:
            val = args.get(k, '') 
            if val :
                if k in ('channel_id', 'sales_depart_id'):
                    val = _int(val)
                if not val:
                    raise Abort(u'%s invalid' % k)
                items[k] = val
        if not pos_id:
            raise Abort(u'pos_id invalid.')
        if not len(items.keys()):
            raise Abort(u'请指定更新字段.')
        pos = possvc.get_pos_list(pos_id = pos_id) 
        if not pos:
            raise Abort(u'更新项不存在.')
        pos =pos[0]
        if pos['channel_id'] != user.user_info['channel_id'] or\
            pos['sales_depart_id'] not in user.user_info['charge_departs']\
            or ('sales_depart_id' in items and items['sales_depart_id']\
                not in user.user_info['charge_departs']) :
            raise Abort(u'无权更新.')
        items['update_user_id'] = user.user_id
        items['pos_id'] = pos_id
        result = possvc.update_pos(items)
    except Abort, e:
        msg = e.msg
    return { 'result' : result, 'msg': msg}
 



@api_bp.route('/add_pos.json', methods=['POST', 'GET'])
@auth_required(priv=PRIV_ADMIN_POS)
@jview
def add_pos():
    u'''
    添加,  
    '''
    keys = ( 'pos_type', 'sales_id',
            'pos_name', 'pos_address', 
                #'channel_id', 'deleted',
                'sales_depart_id', 'pos_unit', 'pos_code', 'geo_data', )
    args = request.args
    if request.method == 'POST':
        args = request.form
    user = request.environ['user']
    channel_id = user.user_info['channel_id']
    charge_departs= user.user_info['charge_departs']
    items = {'channel_id': channel_id, 'create_user_id':user.user_id}
    for k in keys:
        val = args.get(k,'')
        if not val :
            continue
        items[k] = val
    result, msg, pos_id = False, '', None
    try: 
        if not items.get('pos_name'):
            raise Abort(u'促销点名称不能为空.')
        items['sales_depart_id']  = _int(items.get('sales_depart_id',''))
        if not items['sales_depart_id']:
            raise Abort(u'请指定正确的区分信息.')
        if items['sales_depart_id'] not in charge_departs:
            raise Abort(u'无权添加改区分的促销点信息.')
        pos_id = possvc.add_pos(items) 
        result = True if pos_id else False
    except Abort, e:
        msg = e.msg
    return {'result': result, 'pos_id': pos_id, 'msg': msg}
