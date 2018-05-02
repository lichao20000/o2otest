# -*- coding: utf-8 -*- 

import os
import sys

_dir = os.path.dirname(os.path.abspath(__file__))
_updir = os.path.abspath(os.path.join( _dir, '../'))
if _updir not in sys.path:
    sys.path.append(_updir)


from libs import pg_helper as pg
import config



#status integer --1 待审核2 审核通过 4 审核不通过5 通过后取消,6 删除h
def get_plan_list(channel_id=None, sales_depart_ids=None, 
                    create_user_id = None, pos_id=None, 
                    sales_date = None, plan_id=None,
                    status=None , page=1, page_size=100):
    u''' status is a list args'''
    conn, cur = None, None
    try:
        conn = pg.connect(**config.pg_main)
        cur = conn.cursor()
        sql =[ '''
        select p.*, ch.channel_name, d.sales_depart_name,
                (select array_agg(row_to_json(s)) 
                from t_sales_saler s 
                where s.mobile = any( p.saler_mobiles))
                as salers
        from t_sales_plan p
        left join t_sales_channel ch
            on p.channel_id = ch.channel_id
        left join t_sales_depart d
            on p.sales_depart_id = d.sales_depart_id
        where  1=1
        ''',
        ' and p.channel_id=%(channel_id)s ' if channel_id else '',
        ' and p.sales_depart_id=any(%(sales_depart_ids)s)' if sales_depart_ids else '',
        ' and p.plan_id=%(plan_id)s' if plan_id else '',
        ' and p.status=any(%(status)s)' if status else '',
        ' and p.create_user_id = %(create_user_id)s' if create_user_id else '',
        ' and p.pos_id = %(pos_id)s' if pos_id else '',
        ' and p.sales_date = %(sales_date)s' if  sales_date else '',
        ' order by p.plan_id desc '
        ' limit %(limit)s offset %(offset)s ',
            ]
        args = {'channel_id': channel_id,
                'sales_depart_ids': sales_depart_ids,
                'create_user_id': create_user_id,
                'plan_id': plan_id,
                'status': status,
                'pos_id': pos_id,
                'sales_date': sales_date,
                'limit' : page_size + 1,
                'offset': (page-1) * page_size,
                }
        #print ''.join(sql) % args
        cur.execute(''.join(sql), args )
        rows = pg.fetchall(cur)
        has_more = len(rows) > page_size
        return rows[:-1] if has_more else rows, has_more
    finally:
        if cur: cur.close()
        if conn: conn.close()
    

def add_plans(channel_id, sales_depart_id, create_user_id, plans):
    conn, cur = None, None
    try:
        conn = pg.connect(**config.pg_main)
        cur = conn.cursor()
        keys = ( 'pos_id', 'saler_mobiles', 'sales_date', 
                'saler_cnt', 'remark'  )
        rows = []
        for p in plans :
            args ={ 'channel_id': channel_id,
                    'sales_depart_id': sales_depart_id,
                    'create_user_id': create_user_id, } 
            for key in keys:
                args[key] = p.get(key, None)
            rows.append(args)
        # 更新 未审核的一个点同一个日期只能有一个
        sql = '''
            update t_sales_plan set status = 6
            where status in (1, 2)  and pos_id = %(pos_id)s 
                and sales_date = %(sales_date)s
            '''
        cur.executemany(sql, rows)
        sql = '''
            insert into t_sales_plan(
                plan_id,
                channel_id,
                sales_depart_id,
                pos_id,
                saler_mobiles,
                sales_date,
                saler_cnt,
                remark,
                create_user_id
            )values(
                nextval('seq_t_sales_plan'),
                %(channel_id)s,
                %(sales_depart_id)s,
                %(pos_id)s,
                %(saler_mobiles)s,
                %(sales_date)s,
                %(saler_cnt)s,
                %(remark)s,
                %(create_user_id)s
            )
            '''
        cur.executemany(sql, rows)
        conn.commit()
        return cur.rowcount
    finally:
        if cur: cur.close()
        if conn: conn.close()




def add_plan(plan_info):
    conn, cur = None, None
    try:
        conn = pg.connect(**config.pg_main)
        cur = conn.cursor()
        cur.execute("select nextval('seq_t_sales_plan')")
        plan_id = cur.fetchone()[0]
        args = {'plan_id': plan_id}
        keys = ('channel_id', 'sales_depart_id', 'pos_id',
                'saler_mobiles', 'sales_date', 'saler_cnt', 'remark',
                'create_user_id'  )
        for key in keys:
            args[key] = plan_info.get(key, None)
        sql = '''
            insert into t_sales_plan(
                plan_id,
                channel_id,
                sales_depart_id,
                pos_id,
                saler_mobiles,
                sales_date,
                saler_cnt,
                remark,
                create_user_id
            )values(
                %(plan_id)s,
                %(channel_id)s,
                %(sales_depart_id)s,
                %(pos_id)s,
                %(saler_mobiles)s,
                %(sales_date)s,
                %(saler_cnt)s,
                %(remark)s,
                %(create_user_id)s
            )
            '''
        cur.execute(sql, args)
        conn.commit()
        return plan_id if cur.rowcount == 1 else None
    finally:
        if cur: cur.close()
        if conn: conn.close()


def update_plan(plan_info):
    u'''
    使用最多的是更新status
    '''
    conn, cur = None, None
    try:
        conn = pg.connect(**config.pg_main)
        cur = conn.cursor()
        plan_id = plan_info.get('plan_id')
        keys = ( #'plan_id', 
                #'channel_id', 'sales_depart_id', 'pos_id',
                 #'saler_mobiles', 'sales_date', 'saler_cnt', 'remark' ,
                 'audit_user_id', 'status' )
        args = {}
        args.update(plan_info)
        items = []
        for key in args:
            if key not in keys:
                continue
            items.append(' %s=%%(%s)s ' % (key, key)) 
        sql = ['''
            update t_sales_plan
            set update_time = current_timestamp,
            ''',
            ','.join(items),
            'where plan_id = %(plan_id)s '
            ]
        #print ''.join(sql) % args
        cur.execute(''.join(sql), args)
        conn.commit()
        return cur.rowcount == 1
    finally:
        if cur: cur.close()
        if conn: conn.close()


