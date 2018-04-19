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
from utils import _int, _float, _date, _int_default


app_bp = Blueprint('app_bp', __name__, template_folder='templates')
from user.privs import PRIV_ADMIN_CHECK, PRIV_PLAN



@app_bp.route('/', methods=['GET'])
@jview('index.html')
@auth_required
def index():
    user = request.environ['user']
    return {}

@app_bp.route('/test1', methods=['GET'])
@auth_required(priv=PRIV_ADMIN_CHECK)
@jview('index.html')
def test1():
    user = request.environ['user']
    return {}



@app_bp.route('/test', methods=['GET'])
@auth_required(priv=PRIV_PLAN)
@jview('index.html')
def test():
    user = request.environ['user']
    return {}



@app_bp.route('/favicon.ico', methods=['GET'])
def favicon():
    _path = os.path.join(_dir, 'static/images/O2O-128x128.png')
    if not os.path.isfile(_path):
        return abort(404)
    return send_file(_path,
                     mimetype='image/x-icon',
                     cache_timeout=3600*24,
                     add_etags=True,
                     conditional=True)






