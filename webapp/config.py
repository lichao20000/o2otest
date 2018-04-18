# -*- coding:utf-8 -*- 

pg_local = {
    'host' : 'localhost',
    'database': 'o2o',
    'user': 'o2o',
    'password': 'o2o',
    'port': 5432
    }

pg_12 = {
    'host' : 'localhost',
    'database': 'mailer',
    'user': 'mailer',
    'password': 'mailer',
    'port': 5432
        }


session_storage = {
        'redis':{
            'host': None,
            'db':'1',
            'port': 1234
            }

        }

pg_main = pg_12
_debug_ = False
session_force_use_redis = False


import os

if os.environ.get('LOGNAME') == 'yantz':
    pg_main = pg_local
    _debug_ = True
