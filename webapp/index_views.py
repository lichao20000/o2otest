# -*- coding: utf-8 -*-

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
from user.menu import func_menu

from libs.file_helper import excel_reader

app_bp = Blueprint('app_bp', __name__, template_folder='templates')
from user.privs import PRIV_ADMIN_CHECK, PRIV_PLAN
import xlrd


@app_bp.route('/', methods=['GET'])
@jview('sales.html')
@auth_required
@func_menu()
def index():
    user = request.environ['user']
    if not user.user_info['channel_id'] or not user.user_info['sales_depart_id']:
        return redirect('/user/setting/')
    return {'title': u''}


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





