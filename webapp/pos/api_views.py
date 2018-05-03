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
from user.privs import PRIV_ADMIN_POS, PRIV_ADMIN_SUPER

api_bp = Blueprint('pos_api_bp', __name__, template_folder='templates')
from flask import send_file, Response
import StringIO
from libs.file_helper import excel_write
from datetime import datetime as dt


@api_bp.route('/get_file', methods=['POST', 'GET'])
@auth_required
@jview
def get_file():
    user = request.environ['user']
    channel_id = user.user_info['channel_id'] 
    charge_departs = user.user_info['charge_departs']
    rows = possvc.get_pos_list(
                        channel_id=channel_id, 
                        sales_depart_ids = charge_departs,
                        deleted = 0) 
    xls  = StringIO.StringIO()
    if not excel_write(xls, rows):
       return  u'生成失败.' 
    response = Response()
    response.status_code = 200
    response.data = xls.getvalue()
    response.headers.set('Content-Type', 
                'application/vnd.ms-excel')
    d = dt.now().strftime('%Y%m%d')
    response.headers.set( 'Content-Disposition', 
            'attachment', filename='pos-%s.xls' % d )
    return response
 


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
    q  = args.get('query', '')
    pos_id = _int(args.get('pos_id',''))
    pos_type = args.get('pos_type','')
    pos_name  = args.get('pos_name','')

    sales_depart_id = _int(args.get('sales_depart_id',''))

    deleted = args.get('deleted','')
    deleted = -1 if not deleted.isdigit() else _int(deleted)

    channel_id = user.user_info['channel_id'] 
    charge_departs = user.user_info['charge_departs']
        
    if sales_depart_id :
        ids = [sales_depart_id] if sales_depart_id in charge_departs else []
    else:
        ids = charge_departs
    rows = possvc.get_pos_list(q=q,
                        channel_id=channel_id, 
                        pos_id = pos_id, 
                        pos_type=pos_type,
                        pos_name =pos_name,
                        sales_depart_ids=ids,
                        deleted=deleted)
    return rows
 


@api_bp.route('/update_pos.json', methods=['POST', 'GET'])
@auth_required(priv=PRIV_ADMIN_POS|PRIV_ADMIN_SUPER)
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
                'sales_depart_id', 'deleted', 'pos_man', 'pos_man_mobile',
                'pos_unit', 'pos_code', 'geo_data', )
    args = request.args
    if request.method == 'POST':
        args = request.form
    pos_id =  _int(args.get('pos_id',''))
    result, msg = False, ''
    user = request.environ['user']
    try:
        if not pos_id:
            raise Abort(u'pos_id invalid.')
        items =  {}
        for k in keys:
            val = args.get(k, '') 
            if val :
                if k in ('sales_depart_id',):
                    val = _int(val)
                if not val:
                    raise Abort(u'%s invalid' % k)
                items[k] = val
        if not len(items.keys()):
            raise Abort(u'请指定更新字段.')
        mobile = items.get('pos_man_mobile') 
        if mobile and (len(mobile)!=11  or not mobile.isdigit()):
            raise Abort(u'手机号码不正确.')
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
@auth_required(priv=PRIV_ADMIN_POS|PRIV_ADMIN_SUPER)
@jview
def add_pos():
    u'''
    添加,  
    todo: 负责人信息
    '''
    keys = ( 'pos_type', 'sales_id', 'pos_name', 'pos_address', 'pos_man','pos_man_mobile',
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
        if not items.get('pos_man'):
            raise Abort(u'促销负责任不能为空.')
        mobile = items.get('pos_man_mobile')
        if not mobile or len(mobile)!=11  or not mobile.isdigit():
            raise Abort(u'请提供正确的手机号.')
        name_check = possvc.get_pos_list(pos_name=items.get('pos_name'))
        if name_check:
            raise Abort(u'促销点名称已存在.')
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


def _check(rows):
    names = []
    for row in rows:
        if type(row) != dict:
            raise Abort(u'请提供JSON格式数据.(type error) ')
        if row.get('status') != 1:
           continue 
        data = row.get('data',[] )
        if not type(data)==list or not data or not len(data)>=8:
            row['status'] = 4
            row['msg'] = u'数据不完整.'
            continue 
        if data[4]=='' or not data[6] or not data[7] or not data[0]:
            row['status'] = 4
            row['msg'] = u'必填项.'
            continue 
        if not str(data[7]).isdigit() or len(str(data[7])) !=11:
            row['status'] = 4
            row['msg'] = u'手机号.'
            continue 
        if data[4] in names :
            row['status'] = 4
            row['msg'] = u'名称重复(excel).'
            continue
        names.append(data[4])
        if possvc.get_pos_list(pos_name=data[4]):
            row['status'] = 4
            row['msg'] = u'名称已存在.'
            continue
        row['status'] = 3



@api_bp.route('/check_import.json', methods=['POST', 'GET'])
@auth_required(priv=PRIV_ADMIN_POS|PRIV_ADMIN_SUPER)
@jview
def checkimport():
    args = request.args
    if request.method == 'POST':
        args = request.form
    rows = args.get('rows','')
    result, msg  = False, ''
    try:
    # 单元	促销点ID	代码点	门店名称	门店地址	负责人姓名	负责人电话
        rows = json.loads(rows)
        _check(rows)
        print(rows)
        result = True
    except  ValueError, e: 
        msg = u'请提供JSON格式数据.(loads error) '
        rows = None
    except Abort,e :
        msg = e.msg
        rows = None
    return {'result': result, 'msg': msg, 'rows': rows}




@api_bp.route('/pos_import.json', methods=['POST', 'GET'])
@auth_required(priv=PRIV_ADMIN_POS|PRIV_ADMIN_SUPER)
@jview
def pos_import():
    args = request.args
    if request.method == 'POST':
        args = request.form
    user = request.environ['user']
    channel_id = user.user_info['channel_id'] 
    charge_departs = user.user_info['charge_departs']

    rows = args.get('rows','')
    sales_depart_id = _int(args.get('sales_depart_id', ''))
    pos_type = args.get('pos_type','')
    result, msg, cnt  = False, '' , 0
    # 单元	促销点ID	代码点	门店名称	门店地址	负责人姓名	负责人电话
    try:
        if not pos_type :
            raise Abort(u'请指定类型.')
        rows = json.loads(rows)
        _check(rows) 
        rows = filter(lambda r :r.get('status')==3, rows)
        datas = [r['data'][:8] for r in rows]
        keys = ['sales_depart_id','pos_unit', 'sales_id', 'pos_code', 
                'pos_name', 'pos_address', 'pos_man', 'pos_man_mobile'] 
        datas = [dict(zip(keys, d))   for d in datas]
        for d in datas:
            d['create_user_id'] = user.user_id
            d['channel_id'] = channel_id
            d['pos_type'] = pos_type
        result =  possvc.pos_import(datas)
        cnt = len(datas)
    except  ValueError, e: 
        msg = u'请提供JSON格式数据.(loads error) '
    except Abort,e :
        msg = e.msg
    return {'result': result, 'msg': msg, 'cnt': cnt}    
        



