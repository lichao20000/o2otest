# *- coding: utf-8 -*-

import os
import sys

_dir = os.path.dirname(os.path.abspath(__file__))
_updir = os.path.abspath(os.path.join( _dir, '../'))
if _updir not in sys.path:
    sys.path.append(_updir)





def get_user_privs(user_id):
    privs = {
            'user_id': 'wangy1214',
            'privs': ['PRIV_PLAN'],
            }   
    return privs['privs']


def get_bcmaanger_info(uni_email):
    return {
            'uni_email':'wangy1214',
            'user_name': u'汪阳',
            'mobile': '18620011607'
            }
