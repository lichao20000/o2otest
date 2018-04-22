# *- coding: utf-8 -*-

import os
import sys

_dir = os.path.dirname(os.path.abspath(__file__))
_updir = os.path.abspath(os.path.join( _dir, '../'))
if _updir not in sys.path:
    sys.path.append(_updir)


from libs import pg_helper as pg
import config




def get_pos_list(q=None, pos_id=None, channel_id=None,  pos_type=None,
                    pos_name=None,sales_depart_ids=None, deleted = -1):
    u'''
    deleted = -1 全部
    '''
    conn, cur = None, None
    try:
        conn = pg.connect(**config.pg_main)
        cur = conn.cursor()
        sql = (
               ''' 
               select p.* , ch.channel_name, d.sales_depart_name
               from t_sales_pos p
               left join t_sales_channel ch on p.channel_id = ch.channel_id
            left join t_sales_depart d on p.sales_depart_id = d.sales_depart_id
               where  1= 1
               ''',
               ' ' if deleted == -1 else ' and p.deleted =%(deleted)s ',
               'and p.channel_id=%(channel_id)s  ' if channel_id else ' ',
               '''
               and p.sales_depart_id=any(%(sales_depart_ids)s) 
               '''
               if sales_depart_ids else ' ',
               ' and p.pos_name=%(pos_name)s ' if pos_name else '',
               ' and pos_type = %(pos_type)s ' if pos_type else '',
               'and p.pos_id = %(pos_id)s ' if pos_id else ' ',
               u'''
               and (p.pos_name like %(q)s
                 or p.pos_address like %(q)s)
               ''' if q  else ' ',
                )
        args = {
                'q' : '%%%s%%'%q if q else '',
                'pos_id': pos_id,
                'pos_name': pos_name,
                'channel_id': channel_id,
                'sales_depart_ids': sales_depart_ids,
                'deleted': deleted ,
                'pos_type':  pos_type,
                }
        print ''.join(sql) % args
        cur.execute(''.join(sql), args) 
        rows = pg.fetchall(cur)
        return rows
    finally:
        if cur: cur.close()
        if conn: conn.close()



def get_pos():
    conn, cur = None, None
    try:
        conn = pg.connect(**pg.main)
        cur = conn.cursor()
    finally:
        if cur: cur.close()
        if conn: conn.close()


def add_pos(pos_info):
    conn, cur = None, None
    try:
        conn = pg.connect(**config.pg_main)
        cur = conn.cursor()
        keys = (
                'pos_type',
                'sales_id', 
                'pos_name',
                'pos_address', 
                'channel_id', 
                'sales_depart_id',
                'pos_unit',
                'pos_code',
                'geo_data',
                'create_user_id' ,)
        args = {}
        args.update(pos_info)
        for k in keys:
            if k not in pos_info:
                args[k] = None
        sql = "select nextval('seq_t_sales_pos')"
        cur.execute(sql)
        args['pos_id'] = cur.fetchone()[0]
        sql = '''
            insert into t_sales_pos
            (
                pos_id,
                pos_type,
                sales_id, 
                pos_name,
                pos_address, 
                channel_id, 
                sales_depart_id,
                pos_unit,
                pos_code,
                ---geo_data,
                create_user_id
            ) values(
                %(pos_id)s,
                %(pos_type)s,
                %(sales_id)s, 
                %(pos_name)s,
                %(pos_address)s, 
                %(channel_id)s, 
                %(sales_depart_id)s,
                %(pos_unit)s,
                %(pos_code)s,
                ---geo_data,
                %(create_user_id)s
            ) 
            '''
        cur.execute(sql, args)
        conn.commit()
        return args['pos_id'] if cur.rowcount == 1 else None
    finally:
        if cur: cur.close()
        if conn: conn.close()



def del_pos(pos_id, user_id=None):
    conn, cur = None, None
    try:
        conn = pg.connect(**config.pg_main)
        cur = conn.cursor()
        sql = '''
            update t_sales_pos
            set deleted = 1 , update_time = current_timestamp,
                update_user_id = %s
                where deleted = 0 and pos_id = %s
            '''
        cur.execute(sql, (user_id,pos_id,))
        conn.commit()
        return cur.rowcount == 1
    finally:
        if cur: cur.close()
        if conn: conn.close()


def update_pos(pos_info):
    conn, cur = None, None
    try:
        conn = pg.connect(**config.pg_main)
        cur = conn.cursor()
        keys = (
                'pos_type',
                'deleted',
                'sales_id', 
                'pos_name',
                'pos_address', 
                'channel_id', 
                'sales_depart_id',
                'pos_unit',
                'pos_code',
                'geo_data',
                'create_user_id' ,)
        items = []
        for key in pos_info:
            if key in keys:
                items.append(' %s=%%(%s)s '%(key,key))
        sql = [''' update t_sales_pos set update_time=current_timestamp,''',
                ','.join(items),
                ''' where  pos_id = %(pos_id)s ''']
        cur.execute(''.join(sql), pos_info)
        conn.commit()
        return cur.rowcount == 1
    finally:
        if cur: cur.close()
        if conn: conn.close()


def export_pos(self):
    conn, cur = None, None
    try:
        conn = pg.connect(**pg.main)
        cur = conn.cursor()
    finally:
        if cur: cur.close()
        if conn: conn.close()


def import_pos(self):
    conn, cur = None, None
    try:
        conn = pg.connect(**pg.main)
        cur = conn.cursor()
    finally:
        if cur: cur.close()
        if conn: conn.close()




