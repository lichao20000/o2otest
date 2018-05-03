# *- coding: utf-8 -*-

import os
import sys

_dir = os.path.dirname(os.path.abspath(__file__))
_updir = os.path.abspath(os.path.join( _dir, '../'))
if _updir not in sys.path:
    sys.path.append(_updir)


from libs import pg_helper as pg
import config



def get_saler_list(q=None, mobile=None, mobiles=None,
                        channel_id=None, deleted=None,
                        sales_depart_ids=None, page=1 , page_size=100):
    conn, cur = None, None
    try:
        conn = pg.connect(**config.pg_main)
        cur = conn.cursor()
        sql = [
            '''
        select s.*, ch.channel_name, d.sales_depart_name
        from t_sales_saler s
        left join t_sales_channel ch
            on s.channel_id = ch.channel_id
        left join t_sales_depart d
            on s.sales_depart_id = d.sales_depart_id
        where 1 = 1
        ''',
        ' and  s.mobile = %(mobile)s ' if mobile else '',
        ' and  s.mobile = any(%(mobiles)s) ' if mobiles else '',
        ' and  s.channel_id = %(channel_id)s ' if channel_id else '',
        ' and  s.deleted = %(deleted)s ' if deleted!=None else '',
        '''
          and  s.sales_depart_id=any(%(sales_depart_ids)s)
        ''' if sales_depart_ids else '',
        ' and  (s.saler_name like %(q)s or s.mobile like %(q)s) ' if q else '' ,
        ' order by mobile desc '
        ''' limit %(limit)s offset %(offset)s '''
                ]
        #print mobiles, 'wtf......'
        args = {
                'q': '%%%s%%' % (q, ) if q else None,
                'mobile': mobile,
                'channel_id' : channel_id,
                'deleted': deleted,
                'sales_depart_ids': sales_depart_ids,
                'limit': page_size+1,
                'offset': (page-1)*page_size,
                'mobiles' : mobiles,
                }        
        cur.execute(''.join(sql), args)
        #print ''.join(sql) % args
        rows = pg.fetchall(cur)
        has_more = len(rows) > page_size
        result = rows[:-1] if has_more else rows, has_more
        return result
    finally:
        if cur: cur.close()
        if conn: conn.close()


def add_saler(saler):
    conn, cur = None, None
    try:
        keys = ( 'mobile', 'saler_name', 'channel_id',
                'sales_depart_id', 'unit', 'create_user_id')
        conn = pg.connect(**config.pg_main)
        cur = conn.cursor()
        args = {}
        args.update(saler)
        for k in keys:
            if k not in args:
                args[k] = None
        sql = ''' 
            insert into t_sales_saler (
                mobile, 
                saler_name, 
                channel_id, 
                sales_depart_id, 
                unit,
                create_user_id
            )values(
                %(mobile)s, 
                %(saler_name)s, 
                %(channel_id)s, 
                %(sales_depart_id)s, 
                %(unit)s,
                %(create_user_id)s
            )
                '''
        cur.execute(sql, args)
        conn.commit()
        return cur.rowcount == 1
    finally:
        if cur: cur.close()
        if conn: conn.close()


def saler_import(rows):
    conn, cur = None, None
    try:
        conn = pg.connect(**config.pg_main)
        cur = conn.cursor()
        sql = ''' 
            insert into t_sales_saler (
                mobile, saler_name, channel_id,
                sales_depart_id, unit, create_user_id
            )values(
                %(mobile)s, %(saler_name)s, %(channel_id)s, 
                %(sales_depart_id)s, %(unit)s, %(create_user_id)s
            )
                '''
        cur.executemany(sql,rows)
        if cur.rowcount == len(rows):
            conn.commit()
        return cur.rowcount == len(rows)
    finally:
        if cur: cur.close()
        if conn: conn.close()



def update_saler(saler):
    u'''
    mobile is must
    '''
    conn, cur = None, None
    try:
        keys = (  'saler_name', 'channel_id','deleted' ,
                'sales_depart_id', 'unit', 'update_user_id')
        conn = pg.connect(**config.pg_main)
        cur = conn.cursor()
        args = {}
        args.update(saler)
        items =[]
        for k in args:
            if k not in keys: 
                continue
            items.append(' %s = %%(%s)s' % (k, k)) 
        sql = ('''
                update t_sales_saler
                    set update_time = current_timestamp,
            ''',
            ','.join(items),
            ' where mobile = %(mobile)s'
            )
        #print ''.join(sql) % args
        cur.execute(''.join(sql), args)
        conn.commit()
        return cur.rowcount == 1
    finally:
        if cur: cur.close()
        if conn: conn.close()

