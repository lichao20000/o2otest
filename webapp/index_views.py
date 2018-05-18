# -*- coding: utf-8 -*-

import os
import sys


_dir = os.path.dirname(os.path.abspath(__file__))

from flask import Blueprint, request, redirect, abort
from flask import make_response, render_template, Response

from flask import send_file
from ui import jview, json_view

from libs.session_helper import auth_required
import config
import json
from ui import jview, json_view
from utils import _int, _float, _date, _int_default, Abort
from user.menu import func_menu

from libs.file_helper import excel_reader

app_bp = Blueprint('app_bp', __name__, template_folder='templates')
from user.privs import PRIV_PLAN
import xlrd
from libs.file_helper import excel_write
from datetime import datetime as dt
import config

@app_bp.route('/', methods=['GET'])
@jview('sales.html')
@auth_required
@func_menu()
def index():
    user = request.environ['user']
    if not user.user_info['channel_id'] or not user.user_info['sales_depart_id']:
        return redirect('/user/setting/')
    return {'title': u'o2o促销管理'}


@app_bp.route('/favicon.ico', methods=['GET'])
def favicon():
    _path = os.path.join(_dir, 'static/images/O2O-128x128.png')
    if not os.path.isfile(_path):
        return abort(404)
    return send_file(_path,
                     mimetype='image/png',
                     cache_timeout=3600*24,
                     add_etags=True,
                     conditional=True)


@app_bp.route('/upload/read_excel', methods=['GET', 'POST'])
@jview
def upload_file():
    f = request.files.get('file')
    result, rows , msg = False, None,  ''
    try:
        if not f:
            raise Abort(u'文件为空')
        file_name = f.filename
        _, ext = os.path.splitext(file_name)
        if ext not in ( '.xls', '.xlsx'):
            raise Abort(u'非法文件')
        book = xlrd.open_workbook(file_contents=f.read())
        result, rows = excel_reader(book=book)
    except Abort,e:
        msg = e.msg
    return  {'rows': rows, 'result':result, 'msg':msg}



# 临时解决方案
from user.privs import PRIV_ADMIN_DATA

@app_bp.route('/get_files.json', methods=['GET', 'POST'])
@jview
@auth_required(priv=PRIV_ADMIN_DATA)
def get_files():
   # path = os.path.join('static', 'files')
   # files = []
   # for _,d, fs in os.walk(path):
   #     for f in fs: 
   #         _, ext = os.path.splitext(f)
   #         if ext in ('.xls','.xlsx' ) :
   #             files.append(f)
   # return files
   import songwei as sw
   return [sql['name']  for sql in sw.sqls]


   

@app_bp.route('/get_file/<string:filename>',
                        methods=['POST', 'GET'])
@auth_required(priv=PRIV_ADMIN_DATA)
def get_file(filename):
    import songwei as sw
    import StringIO
    names = [s['name'] for s in sw.sqls]
    if filename not in names:
       return  u'非法文件名.' 
    idx = names.index(filename)
    sql = sw.sqls[idx]
    user = request.environ['user']
    channel_id = user.user_info['channel_id']
    charge_departs = user.user_info['charge_departs']
    args={
        'channel_id':channel_id,
        'charge_departs':charge_departs
    }
    rows = sw.get_datas(sql['sql'],args)
    print rows
    xls  = StringIO.StringIO()
    if not excel_write(xls, rows):
       return  u'生成失败.' 
    response = Response()
    response.status_code = 200
    response.data = xls.getvalue()
    response.headers.set('Content-Type', 
                'application/vnd.ms-excel')
    d = dt.now().strftime('%Y%m%d-%H%M%S')
    filename=u'%s-%s.xlsx' % (filename, d)
    response.headers.set( 'Content-Disposition', 
            'attachment',filename=filename.encode('gbk') )
    return response







