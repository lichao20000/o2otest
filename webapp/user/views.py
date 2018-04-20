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
from utils import _int, _float, _date, _int_default


user_bp = Blueprint('user_bp', __name__, template_folder='templates')

@user_bp.route('/setting/')
@jview('user/setting.html')
@auth_required
def setting():
    user = request.environ['user']
    # 不能通过auth_required 限制 如果没登入手动重定向
    checked = user.user_info['channel_id']  and user.user_info['sales_depart_id']
    return {'title':u'设置', 'checked': 1 if checked else 0}




