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
import salersvc
from user.privs import PRIV_ADMIN_SALE, PRIV_ADMIN_SUPER
import StringIO
from libs.file_helper import excel_write
from datetime import datetime as dt
from flask import send_file, Response

api_bp = Blueprint('saler_api_bp', __name__, template_folder='templates')


@api_bp.route('/get_file', methods=['POST', 'GET'])
@auth_required
@jview
def get_file():
    user = request.environ['user']
    channel_id = user.user_info['channel_id'] 
    charge_departs = user.user_info['charge_departs']
    rows = []
    rows = salersvc.get_saler_list(
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
            'attachment', filename='saler-%s.xls' % d )
    return response
 

@api_bp.route('/get_saler_list.json', methods=['POST', 'GET'])
@auth_required
@jview
def get_saler_list():
    u'''
    获取自己所在渠道、及管理的区分的促销人员信息 
    '''
    args = request.args
    if request.method == 'POST':
        args = request.form
    q = args.get('q')
    sales_depart_id = _int(args.get('sales_depart_id',''))
    page = _int(args.get('page',''))
    page = page if page else None
    page_size = _int(args.get('page_size',''))
    page_size = page_size if page_size>0 else None
    mobile = args.get('mobile','')
    deleted = args.get('deleted','')
    deleted = None if not deleted.isdigit() else _int(deleted)
    user = request.environ['user']
    channel_id = user.user_info['channel_id']
    charge_departs = user.user_info['charge_departs']
    if sales_depart_id :
        ids = [sales_depart_id] if sales_depart_id in charge_departs else []
    else:
        ids = charge_departs
    rows = salersvc.get_saler_list(q=q,
                        channel_id=channel_id,
                        deleted = deleted,
                        sales_depart_ids = ids,
                        page=page,
                        page_size=page_size,
                        mobile=mobile)
    return {
            'salers': rows,
            } 
 


@api_bp.route('/add_saler.json', methods=['POST', 'GET'])
@auth_required(priv=PRIV_ADMIN_SALE|PRIV_ADMIN_SUPER)
@jview
def add_saler():
    u'''
    更新， 各渠道只能更新各渠道的数据
    区分也限定
    '''
    args = request.args
    if request.method == 'POST':
        args = request.form
    keys = ( 'mobile', 'saler_name', #'channel_id',
                'sales_depart_id', 'unit', #'create_user_id'
                )
    user = request.environ['user']
    channel_id = user.user_info['channel_id'] # 限定只能添加自己渠道的
    charge_departs = user.user_info['charge_departs']
    saler = {'channel_id': channel_id , 'create_user_id':user.user_id}
    for k in keys:
        val = args.get(k,'')
        saler[k] = val
    sales_depart_id =  _int(saler['sales_depart_id'])
    saler['sales_depart_id'] = sales_depart_id 
    result, msg = False, ''
    try:
        mobile = saler['mobile']
        if not mobile.isdigit() or len(mobile) != 11:
            raise Abort(u'请提供正确的手机号')
        if not saler['saler_name']:
            raise Abort(u'促销人员姓名不能为空')
        if not saler['sales_depart_id']:
            raise Abort(u'促销人员区分不能为空')
        if saler['sales_depart_id'] not in charge_departs:
            raise Abort(u'无权添加人员到该区分')
        check= salersvc.get_saler_list(mobile=mobile)
        if len(check):
            msg = u'手机号码已存在请作更新操作（若无法查询到该记录请联系管理员）'
            raise Abort(msg)
        result = salersvc.add_saler(saler)
    except Abort, e:
        msg = e.msg
    return {
            'result': result,
            'msg': msg,
            } 
 




@api_bp.route('/update_saler.json', methods=['POST', 'GET'])
@auth_required(priv=PRIV_ADMIN_SALE|PRIV_ADMIN_SUPER)
@jview
def update_saler():
    u'''
    更新， 各渠道只能更新各渠道的数据
    区分也限定
    '''
    args = request.args
    if request.method == 'POST':
        args = request.form
    keys = ( 'mobile', 'saler_name', #'channel_id',
                'deleted','sales_depart_id', 'unit', #'create_user_id'
                )
    user = request.environ['user']
    channel_id = user.user_info['channel_id'] # 限定只能添加自己渠道的
    charge_departs = user.user_info['charge_departs']
    saler = { 'update_user_id':user.user_id}
    for k in keys:
        val = args.get(k,'')
        if val=='':
            continue
        saler[k] = val
    result, msg = False, ''
    try:
        mobile = saler['mobile']
        if saler.get('deleted'): 
            deleted = _int(saler['deleted'])
            saler['deleted'] = 1 if deleted else 0
        if not mobile.isdigit() or len(mobile) != 11:
            raise Abort(u'请提供正确的手机号')
        if saler.get('sales_depart_id'):
            saler['sales_depart_id'] = _int(saler['sales_depart_id'])
            if not saler['sales_depart_id']:
                raise Abort(u'促销人员区分无效')
            if saler['sales_depart_id'] not in charge_departs:
                raise Abort(u'无权修改人员到该区分')
        check = salersvc.get_saler_list(mobile=mobile)
        if not len(check):
            raise Abort(u'要修改的记录不存在')
        check = check[0]
        if check['sales_depart_id'] not in charge_departs \
                or channel_id != check['channel_id']:
            raise Abort(u'无权修改该信息')
        result = salersvc.update_saler(saler)
    except Abort, e:
        msg = e.msg
    return {
            'result': result,
            'msg': msg,
            } 
 


def _check(rows):
    user=request.environ['user']
    charge_departs_info = user.user_info['charge_departs_info']
    rm_depart = None
    for d in charge_departs_info:
        if d['parent_id'] == 0:
            rm_depart = d['sales_depart_id']
    charge_departs = user.user_info['charge_departs']
    if rm_depart:
        charge_departs.remove(rm_depart)
    mobiles = []
    for row in rows:
        if type(row) != dict:
            raise Abort(u'请提供JSON格式数据.(type error) ')
        if row.get('status') != 1:
           continue 
        data = row.get('data',[] )
        if not type(data)==list or not data or not len(data)>=3:
            row['status'] = 4
            row['msg'] = u'数据不完整'
            continue 
        if  not data[0] or not data[1] or not data[2]:
            row['status'] = 4
            row['msg'] = u'必填项'
            continue
        if data[0] not in charge_departs:
            row['status'] = 4
            row['msg'] = u'区分ID不符合要求'
            continue
        if not str(data[1]).isdigit() or len(str(data[1])) !=11:
            row['status'] = 4
            row['msg'] = u'手机号异常'
            continue
        if data[1] in mobiles:
            row['status'] = 4
            row['msg'] = u'手机号重复(excel)'
            continue
        mobiles.append(data[0])
        if not str(data[3]).isdigit() or len(str(data[3])) != 10:
            row['status'] = 4
        saler= salersvc.get_saler_list(mobile=str(data[1]))
        if saler:    
            row['status'] = 4
            row['msg'] = u'手机号已存在'
            continue
        row['status'] = 3


@api_bp.route('/check_import.json', methods=['POST', 'GET'])
@auth_required(priv=PRIV_ADMIN_SALE|PRIV_ADMIN_SUPER)
@jview
def checkimport():
    args = request.args
    if request.method == 'POST':
        args = request.form
    rows = args.get('rows','')
    result, msg  = False, ''
    try:
        rows = json.loads(rows)
        _check(rows)
        result = True
    except  ValueError, e: 
        msg = u'请提供JSON格式数据.(loads error) '
        rows = None
    except Abort,e :
        msg = e.msg
        rows = None
    return {'result': result, 'msg': msg, 'rows': rows}



@api_bp.route('/saler_import.json', methods=['POST', 'GET'])
@auth_required(priv=PRIV_ADMIN_SALE|PRIV_ADMIN_SUPER)
@jview
def pos_import():
    args = request.args
    if request.method == 'POST':
        args = request.form
    user = request.environ['user']
    channel_id = user.user_info['channel_id']
    rows = args.get('rows','')
    result, msg, cnt  = False, '' , 0
    try:
        rows = json.loads(rows)
        _check(rows) 
        rows = filter(lambda r :r.get('status')==3, rows)
        datas = [r['data'][:5] for r in rows]
        keys = ['sales_depart_id','mobile', 'saler_name','develop_id','unit']
        datas = [dict(zip(keys, d))   for d in datas]
        for d in datas:
            d['develop_id']='{'+d['develop_id']+'}'
            d['create_user_id'] = user.user_info['user_id']
            d['channel_id'] = channel_id
        result = salersvc.saler_import(datas)
        salersvc.sms_user_import(datas)
        cnt = len(datas)
    except  ValueError, e: 
        msg = u'请提供JSON格式数据.(loads error) '
    except Abort,e :
        msg = e.msg
    return {'result': result, 'msg': msg, 'cnt': cnt}    
        






