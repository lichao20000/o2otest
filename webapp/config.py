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

domain = 'salse.gz.gd.unicom.local'

if os.environ.get('LOGNAME') in ['yantz', 'wy']:
    pg_main = pg_local
    domain = 'localhost:9020'
    _debug_ = True



OAuth2 = dict( 
    client_id= 'o2o_sales' ,
    client_secret = '5774b10f439a11e8b837001a640940be',
    auth_uri = '%s/u/oauth2/' % domain,
    auth2_uri = 'http://gz.gd.unicom.local/open/oauth2/auth/',
    token_uri = 'http://gz.gd.unicom.local/open/oauth2/token.json',
    info_uri =  'http://gz.gd.unicom.local/open/oauth2/user_info.json'
    )
        
        
