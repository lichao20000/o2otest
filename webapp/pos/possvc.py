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
                    pos_name=None,sales_depart_ids=None, deleted = -1,
                 located=None,is_charge=None,
                 pageCurrent=None,pageSize=None):
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
               ' and p.pos_id = %(pos_id)s ' if pos_id else ' ',
               ' and p.lng is null or p.lat is null ' if located==0 else '',
               ' and p.lng is not null and p.lat is not null' if located==1 else '',
               " and p.is_charge = %(is_charge)s " if is_charge else '',
               u'''
               and (p.pos_name like %(q)s
                 or p.pos_address like %(q)s)
               ''' if q  else ' ',
                ' order by p.pos_id desc ',
                ' limit %(limit)s offset %(offset)s ' if isinstance(pageSize,int) and isinstance(pageCurrent,int) else ''
                )
        args = {
                'q' : '%%%s%%'%q if q else '',
                'pos_id': pos_id,
                'pos_name': pos_name,
                'channel_id': channel_id,
                'sales_depart_ids': sales_depart_ids,
                'deleted': deleted ,
                'pos_type':  pos_type,
                'is_charge':is_charge,
                'limit': pageSize if isinstance(pageSize,int) else None,
                'offset':(pageCurrent-1)*pageSize if isinstance(pageCurrent,int) and isinstance(pageSize,int) else None
                }
        #print ''.join(sql) % args
        cur.execute(''.join(sql), args) 
        rows = pg.fetchall(cur)
        cur.execute(''.join(sql[:-2]), args)
        cnt=len(pg.fetchall(cur))
        return rows,cnt
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
        keys = ('pos_type',
                'sales_id', 
                'pos_name',
                'pos_address', 
                'channel_id', 
                'sales_depart_id',
                'pos_unit',
                'pos_code',
                'pos_man',
                'pos_man_mobile',
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
                pos_man,
                pos_man_mobile,
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
                %(pos_man)s,
                %(pos_man_mobile)s,
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
                'pos_man',
                'pos_man_mobile',
                'update_user_id' ,)
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


def pos_import(rows):
    conn, cur = None, None
    try:
        conn = pg.connect(**config.pg_main)
        cur = conn.cursor()
        sql = '''
            insert into t_sales_pos
            (
                pos_id, pos_type, sales_id, 
                pos_name, pos_address, channel_id,
                sales_depart_id, pos_unit, pos_code, 
                pos_man, pos_man_mobile, create_user_id,is_charge
            ) values(
                nextval('seq_t_sales_pos'), %(pos_type)s, %(sales_id)s, 
                %(pos_name)s, %(pos_address)s, %(channel_id)s, 
                %(sales_depart_id)s, %(pos_unit)s, %(pos_code)s,
                %(pos_man)s, %(pos_man_mobile)s, %(create_user_id)s,%(is_charge)s
            );
            '''
        cur.executemany(sql, rows)
        result = cur.rowcount == len(rows)
        if result:
            conn.commit()
        return  result
    finally:
        if cur: cur.close()
        if conn: conn.close()

def sms_user_import(data):
    conn,cur=None,None
    try:
        conn = pg.connect(**config.pg_main)
        cur = conn.cursor()
        sql=( ' insert into public.t_rp_sms_user ',
                  ' (user_id,bind_mobile,full_name,reg_date,status) ',
                  ' select ',
                  " nextval('public.seq_rp_sms_user_id'), '%(pos_man_mobile)s',%(pos_man)s,current_timestamp,1 ",
              ' where not exists (select 1 ',
              '                             from public.t_rp_sms_user',
              "                             where bind_mobile='%(pos_man_mobile)s') ",)
        cur.executemany(''.join(sql),data)
        result=cur.rowcount
        if result>0:
            conn.commit()
        return result
    finally:
        if cur: cur.close()
        if conn: conn.close()









def get_audit_list(channel_id=None,charge_departs=None,pageCurrent=None,pageSize=None,
                   sales_depart_id=None,selectedTag=None,status_id=None,
                   queryPoi=None,queryMan=None):
    conn,cur=None,None
    try:
        conn=pg.connect(**config.pg_main)
        cur=conn.cursor()
        sql=(' select p.*, ',
             ' public.st_AsText(p.geo_data) wkt, ',
             ' s.saler_name,s.mobile,t.tag_label,sta.status_label ' ,
             ' from public.t_rp_poi p ',
             ' left join public.t_rp_sms_user u' ,
             ' on p.create_user_id=u.user_id ',
             ' left join itd.t_sales_saler s ',
             ' on u.bind_mobile=s.mobile ',
             ' left join public.t_rp_tag t ',
             ' on p.reporter_tag=t.tag ',
             ' left join public.t_rp_status sta ',
             ' on p.status=sta.status ',
             ' where 1=1 ',
        ' and s.channel_id=%(channel_id)s' if channel_id else '',
        ' and s.sales_depart_id=any(%(charge_departs)s)' if charge_departs else '',
        ' and s.sales_depart_id=%(sales_depart_id)s' if sales_depart_id else '',
        ' and p.reporter_tag=%(selectedTag)s' if selectedTag else '',
        ' and p.status=%(status_id)s' if status_id else '',
        ' and (p.poi_name like %(queryPoi)s or p.address like %(queryPoi)s)' if queryPoi else '',
        ' and (u.bind_mobile like %(queryMan)s or u.full_name like %(queryMan)s)' if queryMan else '',
        ' order by p.poi_id desc ',
        ' limit %(limit)s offset %(offset)s ' if isinstance(pageSize,int) and isinstance(pageCurrent,int) else ''
             )
        args = {
                'channel_id': channel_id,
                'charge_departs':charge_departs,
                'sales_depart_id':sales_depart_id,
                'selectedTag':selectedTag,
                'status_id':status_id,
                'queryPoi':'%%%s%%'%queryPoi if queryPoi else '',
                'queryMan':'%%%s%%'%queryMan if queryMan else '',
                'limit':pageSize,
                'offset':(pageCurrent-1)*pageSize if isinstance(pageSize,int) and isinstance(pageCurrent,int) else None
                }
        #print ''.join(sql) % args
        cur.execute(''.join(sql), args)
        rows = pg.fetchall(cur)
        cur.execute(''.join(sql[:-2]),args)
        cnt = len(pg.fetchall(cur))
        return rows,cnt
    finally:
        if cur: cur.close()
        if conn: conn.close()

def get_poi_tag(channel_name):
    conn,cur=None,None
    try:
        conn = pg.connect(**config.pg_main)
        cur = conn.cursor()
        sql=(' select * from public.t_rp_tag where 1=1 ',
            ' and tag_label= %(channel_name)s',)
        args={
            'channel_name':channel_name
        }
        cur.execute(''.join(sql),args)
        rows=pg.fetchall(cur)
        return rows
    finally:
        if cur:cur.close()
        if conn:conn.close()

def pos_audit(selectedPoi,status,queryStatus):
    conn,cur=None,None
    try:
        conn=pg.connect(**config.pg_main)
        cur=conn.cursor()
        sql=(' update public.t_rp_poi set status=%(status)s where status=any(%(queryStatus)s) and poi_id=any(%(selectedPoi)s)')
        args={
            'selectedPoi':selectedPoi,
            'status':status,
            'queryStatus':queryStatus
        }
        cur.execute(sql,args)
        conn.commit()
        return cur.rowcount
    finally:
        if cur:cur.close()
        if conn:conn.close()

def get_pos_tag(tags):
    conn,cur=None,None
    try:
        conn=pg.connect(**config.pg_main)
        cur=conn.cursor()
        sql=(' select * from itd.t_sales_pos_tag t where t.deleted=0 ',
             ' and tag_id = any(%(tags)s)')
        args={
            'tags':tags
        }
        cur.execute(''.join(sql),args)
        rows=pg.fetchall(cur)
        return rows
    finally:
        if cur:cur.close()
        if conn:conn.close()
