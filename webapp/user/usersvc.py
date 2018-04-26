# *- coding: utf-8 -*-

import os
import sys

_dir = os.path.dirname(os.path.abspath(__file__))
_updir = os.path.abspath(os.path.join( _dir, '../'))
if _updir not in sys.path:
    sys.path.append(_updir)


from libs import pg_helper as pg
import config
from privs import privs_all


def get_channels(top=False):
    u'''
    top 控制是否取区分中信息中市公司
    '''
    conn, cur = None, None
    try:
        conn = pg.connect(**config.pg_main)
        cur = conn.cursor()
        sql = '''select * from t_sales_channel ''' 
        cur.execute(sql)
        rows = pg.fetchall(cur)
        # Todo  should get in sql  
        for row in rows:
            row['departs'] = get_sales_departs(row['channel_id'], top)
        return rows 
    finally:

        if cur: cur.close()
        if conn: conn.close()


    
def get_sales_departs(channel_id, top=True):
    conn, cur = None, None
    try:
        conn = pg.connect(**config.pg_main)
        cur = conn.cursor()
        sql = ('''select * from t_sales_depart  where channel_id = %s''' ,
               '' if top else ' and parent_id >0')
        cur.execute(''.join(sql), (channel_id, ))
        rows = pg.fetchall(cur)
        return rows 
    finally:

        if cur: cur.close()
        if conn: conn.close()



def set_user_base_info(user_info):
    u'''
    登入接口更新本地用户基本信息, 存在则更新， 不存在则插入 user_id 为集团邮箱
    不应该手动去修改或调用改接口
    '''
    conn, cur = None, None
    try:
        conn = pg.connect(**config.pg_main)
        cur = conn.cursor()
        sql = '''
            insert into t_sales_user
                    (user_id, user_name, mobile ) 
            select  %(user_id)s, %(user_name)s, %(mobile)s
             where not exists 
                    (select 1 from t_sales_user where user_id=%(user_id)s)
                    '''
        cur.execute(sql, user_info)
        if cur.rowcount!=1:
            sql = ''' 
                update t_sales_user  set user_name = %(user_name)s ,
                        mobile = %(mobile)s,
                        last_sync_time = current_timestamp
                        where user_id = %(user_id)s
            '''
            cur.execute(sql, user_info)
        conn.commit()
        return cur.rowcount == 1 
    finally:
        if cur: cur.close()
        if conn: conn.close()

def get_user_local_info(user_id):
    conn, cur = None, None
    try:
        conn = pg.connect(**config.pg_main)
        cur = conn.cursor()
        sql = ''' 
                select u.*, d.charge_departs , d.charge_departs_info,
                    dd.sales_depart_name, ch.channel_name
                from t_sales_user  u
                    left join v_sales_depart d
                on u.sales_depart_id  = d.sales_depart_id
                    left join t_sales_depart dd
                on u.sales_depart_id  = dd.sales_depart_id
                    left join t_sales_channel ch
                on u.channel_id= ch.channel_id
                     where user_id = %s
                     '''
        cur.execute(sql,(user_id,))
        rows = pg.fetchall(cur)
        return rows[0] if rows else None
    finally:
        if cur: cur.close()
        if conn: conn.close()



def set_user_sales_info(user_id, channel_id, sales_depart_id, op_user_id=None):
    u'''
    管理人员可以在本地没有改用户信息的时候设置 用户的 信息
    '''
    conn, cur = None, None
    try:
        conn = pg.connect(**config.pg_main)
        cur = conn.cursor()
        args = {
                'user_id': user_id,
                'channel_id': channel_id,
                'sales_depart_id': sales_depart_id,
                'last_update_user_id': op_user_id
                }
        sql = ''' 
                insert into t_sales_user
                    (user_id, channel_id, sales_depart_id, 
                        last_update_time, last_update_user_id)
                select 
                    %(user_id)s, %(channel_id)s, %(sales_depart_id)s, 
                        current_timestamp, %(last_update_user_id)s
                 where not exists 
                        (select 1 from t_sales_user where user_id=%(user_id)s )
                '''
        cur.execute(sql, args)
        if cur.rowcount !=1:
            sql = '''
                    update t_sales_user set  channel_id = %(channel_id)s ,
                        sales_depart_id = %(sales_depart_id)s,
                        last_update_time = current_timestamp,
                        last_update_user_id = %(last_update_user_id)s
                    where user_id = %(user_id)s
                        '''
            cur.execute(sql, args)
        conn.commit()
        return cur.rowcount == 1
    finally:
        if cur: cur.close()
        if conn: conn.close()

def get_all_privs():
    return privs_all
    


def set_user_privs(user_id, privs, op_user_id =None):
    conn, cur = None, None
    try:
        conn = pg.connect(**config.pg_main)
        cur = conn.cursor()
        sql = '''
               update t_sales_user
               set  privs = %(privs)s ,
                    last_update_time = current_timestamp,
                    last_update_user_id = %(last_update_user_id)s
                where user_id = %(user_id)s
                '''
        args = {
                'user_id': user_id,
                'privs':  privs,
                'last_update_user_id': op_user_id
                }
        cur.execute(sql, args)
        conn.commit()
        return cur.rowcount == 1
    finally:
        if cur: cur.close()
        if conn: conn.close()




def get_user_privs(user_id):
    user_info = get_user_local_info(user_id)
    if not user_info:
        return None
    return user_info['privs']




def get_bcmaanger_info(uni_email):
    return {
            'uni_email':'wangy1214',
            'full_name': u'汪阳',
            'mobile': '18620011607'
            }
