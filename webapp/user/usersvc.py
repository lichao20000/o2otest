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
                    (user_id, user_name, mobile,privs ) 
            select  %(user_id)s, %(user_name)s, %(mobile)s, %(privs)s
             where not exists 
                    (select 1 from t_sales_user where user_id=%(user_id)s)
                    '''
        user_info['privs'] = []
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

def get_users(channel_id=None,charge_departs=None,sales_depart_id=None,query=None):
    conn, cur = None, None
    try:
        conn = pg.connect(**config.pg_main)
        cur = conn.cursor()
        sql=['''
            select u.*,c.channel_name,d.sales_depart_name from t_sales_user u
                left join t_sales_channel c
                on u.channel_id=c.channel_id
                left join t_sales_depart d
                on u.sales_depart_id=d.sales_depart_id
            where 1 = 1 
            ''',
            ' and u.sales_depart_id in %(charge_departs)s' if charge_departs else ''
            ' and u.channel_id = %(channel_id)s' if channel_id else '',
            ' and u.sales_depart_id = %(sales_depart_id)s' if sales_depart_id else '',
            ' and (u.user_name like %(query)s or u.mobile like %(query)s) ' if query else '',
             ]
        args={
            'channel_id': channel_id,
            'charge_departs': charge_departs,
            'sales_depart_id': sales_depart_id,
            'query': '%%%s%%' % (query,) if query else None}
        cur.execute(''.join(sql),args)
        rows=pg.fetchall(cur)
        result=rows
        return result
    finally:
        if cur: cur.close()
        if conn: conn.close()

def set_user_all(user_id=None, adminuser_id=None,channel_id=None, sales_depart_id=None,user_name=None,privs=None,tags=None):
    conn, cur = None, None
    try:
        conn = pg.connect(**config.pg_main)
        cur = conn.cursor()
        sql = ( ' update itd.t_sales_user set ',
                ' channel_id = %(channel_id)s, ' if channel_id else '',
                ' sales_depart_id = %(sales_depart_id)s, ' if sales_depart_id else '',
                ' user_name = %(user_name)s, ' if user_name else ''
                ' privs = %(privs)s ,' if privs else '',
                ' tags = %(tags)s ,' if tags else '',
                ' last_update_user_id = %(adminuser_id)s,',
                ' last_update_time = current_timestamp '
                ' where user_id=%(user_id)s ',
        )
        args = {
                'user_id': user_id,
                'channel_id':channel_id,
                'sales_depart_id':sales_depart_id,
                'user_name': user_name,
                'privs':privs,
                'tags':tags,
                'adminuser_id':adminuser_id,
                }
        cur.execute(''.join(sql), args)
        conn.commit()
        return cur.rowcount == 1
    finally:
        if cur: cur.close()
        if conn: conn.close()

def get_pos_tag():
    conn,cur=None,None
    try:
        conn=pg.connect(**config.pg_main)
        cur=conn.cursor()
        sql=(' select t.* from itd.t_sales_pos_tag t where t.deleted=0 ',)
        cur.execute(''.join(sql))
        rows=pg.fetchall(cur)
        return rows
    finally:
        if cur:cur.close()
        if conn:conn.close()

def get_channel_list(channel_id=None):
    conn,cur=None,None
    try:
        conn=pg.connect(**config.pg_main)
        cur=conn.cursor()
        sql=(' select c.* from itd.t_sales_channel c ',
             ' where 1=1 ',
             ' and channel_id=%(channel_id)s ' if channel_id else '',)
        args={
            'channel_id':channel_id
        }
        cur.execute(''.join(sql),args)
        channels=pg.fetchall(cur)
        return channels
    finally:
        if cur:cur.close()
        if conn:conn.close()

def get_depart_list(charge_departs=None,sales_depart_id=None):
    conn,cur=None,None
    try:
        conn=pg.connect(**config.pg_main)
        cur=conn.cursor()
        sql=(' select d.* from itd.t_sales_depart d ',
             ' where 1=1 ',
             ' and sales_depart_id = any(%(charge_departs)s) ' if charge_departs else '',
             ' and sales_depart_id = %(sales_depart_id)s ' if sales_depart_id else '',
             )
        args={
            'charge_departs':charge_departs,
            'sales_depart_id':sales_depart_id
        }
        cur.execute(''.join(sql),args)
        departs=pg.fetchall(cur)
        return departs
    finally:
        if cur:cur.close()
        if conn:conn.close()




def get_bcmaanger_info(uni_email):
    return {
            'uni_email':'wangy1214',
            'full_name': u'汪阳',
            'mobile': '18620011607'
            }

