# -*- coding:utf-8 -*- 
import os

pg_local = {
    'host' : 'localhost',
    'database': 'o2o',
    'user': 'o2o',
    'password': 'o2o',
    'port': 5432,
    'schema':'public'
    }


session_storage_production = {
        'protocols': 'redis',
        'redis':{
            'host': 'redis',
            'db':'11',
            'port': 6379 
            }
        }

        print sql % user_info

pg_production = {
        'host':'132.96.64.32',
        'database':'gi_db',
        'user' :'wangy',
        'password' :'wangy1607',
        'port': 5432,
        'schema': 'itd',
        }

pg_production_readonly = {
        'host':'132.96.64.34',
        'database':'gi_db',
        'user' :'wangy',
        'password' :'wangy1607',
        'port': 5432,
        'schema': 'itd',
        }

import socket 
def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(('8.8.8.8', 10000))  
    _ip = s.getsockname()[0] 
    s.close()
    return _ip

session_storage = session_storage_production
pg_main = pg_production
pg_stand= pg_production_readonly
#domain = 'sales.gz.gd.unicom.local'

domain = '132.97.135.12'
port = 9020
_debug_ = False
session_force_use_redis = False



if os.environ.get('LOGNAME') in ['yantz', 'wy']:
    pg_main = pg_local
    domain = get_local_ip()
    _debug_ = True




OAuth2 = dict( 
    client_id= 'o2o_sales' ,
    client_secret = '5774b10f439a11e8b837001a640940be',
    auth_uri = '%s:%s/u/oauth2/' % (domain,port),
    auth2_uri = 'http://gz.gd.unicom.local/open/oauth2/auth/',
    token_uri = 'http://auth.gz.gd.unicom.local/open/oauth2/token.json',
    info_uri =  'http://auth.gz.gd.unicom.local/open/oauth2/user_info.json'
    )
        
        
