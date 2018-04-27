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
from user.privs import PRIV_PLAN, PRIV_ADMIN_SUPER



api_bp = Blueprint('plan_api_bp', __name__, template_folder='templates')


def _check(rows):
    user = request.environ['user']
    channel_id = user.user_info['channel_id'] 
    charge_departs = user.user_info['charge_departs']
    for row in rows:
        pos_id = row.get('pos_id')
        mobiles = row.get('saler_mobiles')
        sales_date = row.get('sales_date')
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
        salers,_ = salersvc.get_saler_list(channel_id=channel_id,
                                sales_depart_ids=charge_departs, 
                                deleted=0,
                                mobiles = mobiles
                                )
        row['salers'] = salers
        if not _pos:
            row['msg'] = '促销点非法.'
            row['status'] = 4
            continue
        row['pos'] = _pos[0]
        if not salers or len(salers)!=len(mobiles):
            row['msg'] = '促销人非法.'
            row['status'] = 4
            continue
        row['status'] = 3
    return rows


        



@api_bp.route('/check_import.json', methods=['POST', 'GET'])
@auth_required(priv=PRIV_PLAN |PRIV_ADMIN_SUPER)
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


     
