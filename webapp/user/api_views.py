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


api_bp = Blueprint('user_api_bp', __name__, template_folder='templates')


