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
import plansvc
from pos import possvc
from saler import salersvc
from user.privs import PRIV_PLAN, PRIV_ADMIN_SUPER, PRIV_PLAN_AUDIT
import re
from datetime import datetime as dt


api_bp = Blueprint('plan_api_bp', __name__, template_folder='templates')


def _check(rows):
    user = request.environ['user']
    channel_id = user.user_info['channel_id'] 
    charge_departs = user.user_info['charge_departs']
    for row in rows:
        pos_id = row.get('pos_id')
        mobiles = row.get('saler_mobiles')
        sales_date = row.get('sales_date')
        sale_hour=row.get('sale_hour')
        if _int(sales_date) < _int(dt.now().strftime('%Y%m%d')):
            row['msg'] = u'排产日期不能小于当前时间'
            row['status'] = 4
            continue
        plans,_ = plansvc.get_plan_list(sales_date=sales_date, pos_id=pos_id,status=[1,2])
        if plans:
            plan = plans[0]
            if plan['status'] == 1:
                row['msg'] = '已排产（继续将删除之前排产）'
            if plan['status'] == 2:
                row['msg'] = '已排产并审核通过.'
                row['status'] =4
                continue
        saler_cnt= row.get('saler_cnt')
        if not pos_id or not mobiles or not sales_date\
                        or not saler_cnt:
            row['msg'] = '数据不完整'
            row['status'] = 4
            continue
        _pos = possvc.get_pos_list(channel_id=channel_id, 
                                sales_depart_ids=charge_departs,
                                pos_id=pos_id,
                                deleted = 0)
        print mobiles
        salers = salersvc.get_saler_list(channel_id=channel_id,
                                sales_depart_ids=charge_departs, 
                                deleted=0,
                                mobiles = mobiles
                                )
        print salers
        row['salers'] = salers
        if not _pos:
            row['msg'] = '促销点不存在.'
            row['status'] = 4
            continue
        row['pos'] = _pos[0]
        if not salers or len(salers)!=len(mobiles):
            row['msg'] = '促销人员不存在.'
            row['status'] = 4
            continue
        row['status'] = 3
        if sale_hour and len(sale_hour)<100:
            sale_hour=sale_hour.split(',')
            for h in range(len(sale_hour)):
                if sale_hour[h] in sale_hour[h+1:]:
                    row['msg']='促销时间重复'
                    row['status']=4
                try:
                    s=int(sale_hour[h])
                except:
                    s=0
                    row['msg']='促销时间不是整数'
                    row['status']=4
                if s not in range(0,24):
                    row['msg']='促销时间范围超出0-23'
                    row['status']=4
        else:
            row['msg']='促销时间错误！'
            row['status']=4
    return rows


        



@api_bp.route('/check_import.json', methods=['POST', 'GET'])
@auth_required(priv=PRIV_PLAN | PRIV_ADMIN_SUPER)
@jview
def checkimport():
    args = request.args
    if request.method == 'POST':
        args = request.form
    rows = args.get('rows','')
    result, msg  = False, ''
    try:
        # 促销点系统ID	促销时间	促销人员手机号
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


@api_bp.route('/add_plans.json', methods=['POST', 'GET'])
@auth_required(priv=PRIV_PLAN |PRIV_ADMIN_SUPER)
@jview
def add_plan():
    args = request.args
    if request.method == 'POST':
        args = request.form
    rows = args.get('rows','')
    user = request.environ['user']
    channel_id = user.user_info['channel_id'] 
    charge_departs = user.user_info['charge_departs']
    sales_depart_id = user.user_info['sales_depart_id']
    result, msg , cnt  = False, '', None
    try:
        # 促销点系统ID	促销时间	促销人员手机号
        _rows = json.loads(rows)
        rows = filter(lambda r: r['status']==3 ,_check(_rows))
        cnt = plansvc.add_plans(channel_id, sales_depart_id,
                                user.user_id, rows)
        result = True
    except  ValueError, e: 
        msg = u'请提供JSON格式数据.(loads error) '
        rows = None
    except Abort,e :
        msg = e.msg
        rows = None
    return {'result': result, 'msg': msg, 'cnt':cnt}

 
@api_bp.route('/get_my_plans.json', methods=['POST', 'GET'])
@auth_required(priv=PRIV_PLAN | PRIV_ADMIN_SUPER)
@jview
def get_my_plan():
    args = request.args
    if request.method == 'POST':
        args = request.form
    status = [1, 2, 4, 5]
    user = request.environ['user']
    create_user_id = user.user_id
    rows= plansvc.get_plan_list(status=status, create_user_id=create_user_id)
    return {'rows': rows}




     
@api_bp.route('/get_plan_list.json', methods=['POST', 'GET'])
@auth_required(priv=PRIV_PLAN_AUDIT | PRIV_ADMIN_SUPER)
@jview
def get_plan_list():
    args = request.args
    if request.method == 'POST':
        args = request.form
    user=request.environ['user']
    channel_id=user.user_info['channel_id']
    charge_departs=tuple(user.user_info['charge_departs'])
    pageCurrent=_int(args.get('pageCurrent',''))
    pageSize=_int(args.get('pageSize',''))
    sales_dates= args.get('sales_dates','')
    status_id=args.get('status_id','')
    status_id = None if not status_id else status_id.encode().split(',')
    if status_id:
        for s in range(len(status_id)):
            status_id[s]=_int(status_id[s])
    sales_dates = None if not sales_dates else sales_dates.encode().split(',')
    sales_depart_id=_int(args.get('sales_depart_id',''))
    pos_type = args.get('pos_type','')
    pos_type=None if not pos_type else pos_type
    is_charge = args.get('is_charge')
    is_charge=None if not is_charge else is_charge
    queryPos=args.get('queryPos')
    queryPos=None if not queryPos else queryPos
    rows, cnt= plansvc.get_plan_list(status=status_id,
                                     channel_id=channel_id,
                                     page=pageCurrent,
                                     page_size=pageSize,
                                     sales_date=sales_dates,
                                     charge_departs=charge_departs,
                                     sales_depart_id=sales_depart_id,
                                     pos_type=pos_type,
                                     is_charge=is_charge,
                                     queryPos=queryPos,
                                     )
    return {'rows': rows,  'count': cnt }



     
@api_bp.route('/audit.json', methods=['POST', 'GET'])
@auth_required(priv=PRIV_PLAN_AUDIT | PRIV_ADMIN_SUPER)
@jview
def audit():
    args = request.args
    if request.method == 'POST':
        args = request.form
    plan_id = _int(args.get('plan_id',''))
    status = _int(args.get('status',''))
    result, msg = False, u'' 
    user = request.environ['user']
    try:
        if not plan_id or not status:
            raise Abort(u'')
        update_info = {
                'plan_id': plan_id,
                'status':  status, 
                'audit_user_id': user.user_id
                }
        result = plansvc.update_plan(update_info)
    except Abort,e:
        msg = e.msg
    return {'result': result,  'msg': msg}

