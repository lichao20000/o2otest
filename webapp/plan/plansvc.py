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
def get_plan_list(channel_id=None, charge_departs=None,sales_depart_id=None,
                  pos_type=None,is_charge=None,queryPos=None,
                    create_user_id = None, pos_id=None, 
                    sales_date = None, plan_id=None,
                    status=None, page=1, page_size=100):
    u''' status is a list args'''
    conn, cur = None, None
    try:
        conn = pg.connect(**config.pg_main)
        cur = conn.cursor()
        sql =[ '''
        select p.*, ch.channel_name, d.sales_depart_name,pos.pos_name,pos.pos_address,
        u.mobile as create_mobile,u.user_name as create_user,pos.lng,pos.lat,
                (select array_agg(row_to_json(s)) 
                from t_sales_saler s 
                where s.mobile = any( p.saler_mobiles))
                as salers
        from t_sales_plan p
        left join t_sales_channel ch
            on p.channel_id = ch.channel_id
        left join t_sales_depart d
            on p.sales_depart_id = d.sales_depart_id
        left join t_sales_pos pos
            on p.pos_id=pos.pos_id
        left join t_sales_user u 
            on p.create_user_id=u.user_id
        where  1=1 and sales_date>=to_char(current_timestamp,'YYYYMMDD')
        ''',
        ' and p.channel_id=%(channel_id)s ' if channel_id else '' ,
        ' and p.sales_depart_id in %(charge_departs)s' if charge_departs else '',
        ' and p.sales_depart_id = %(sales_depart_ids)s' if sales_depart_id else '',
        ' and p.plan_id=%(plan_id)s' if plan_id else '',
        ' and p.status in (1,2,4,5)',
        ' and p.status=any(%(status)s)' if status else '',
        ' and p.create_user_id = %(create_user_id)s' if create_user_id else '',
        ' and p.pos_id = %(pos_id)s' if pos_id else '',
        ' and p.sales_date=any(%(sales_date)s)' if  sales_date else '',
        ' and pos.pos_type = %(pos_type)s' if pos_type else '',
        ' and pos.is_charge= %(is_charge)s' if is_charge else '',
        ' and pos.pos_name like %(queryPos)s' if queryPos else '',
        ' order by p.plan_id desc ',
        ' limit %(limit)s offset %(offset)s '
        ]
        args = {'channel_id': channel_id,
                'charge_departs':charge_departs,
                'sales_depart_ids': sales_depart_id,
                'pos_type':pos_type,
                'is_charge':is_charge,
                'queryPos':'%%%s%%'%queryPos if queryPos else '',
                'create_user_id': create_user_id,
                'plan_id': plan_id,
                'status':status,
                'pos_id': pos_id,
                'sales_date': sales_date if isinstance(sales_date,list) else '{%s}'%sales_date ,
                'limit' : page_size ,
                'offset': (page-1) * page_size,
                }
        #print ''.join(sql) % args
        cur.execute(''.join(sql), args )
        rows = pg.fetchall(cur)
        cur.execute(''.join(sql[:-2]),args)
        cnt=len(pg.fetchall(cur))
        return rows,cnt
    finally:
        if cur: cur.close()
        if conn: conn.close()
    

def add_plans(channel_id, sales_depart_id, create_user_id, plans):
    conn, cur = None, None
    try:
        conn = pg.connect(**config.pg_main)
        cur = conn.cursor()
        keys = ( 'pos_id', 'saler_mobiles', 'sales_date', 
                'saler_cnt', 'remark','sale_hour'  )
        rows = []
        for p in plans :
            args ={ 'channel_id': channel_id,
                    'sales_depart_id': sales_depart_id,
                    'create_user_id': create_user_id, } 
            for key in keys:
                args[key] = p.get(key, None)
            args['sale_hour']='{'+args['sale_hour']+'}'
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
                create_user_id,
                sale_hour
            )values(
                nextval('seq_t_sales_plan'),
                %(channel_id)s,
                %(sales_depart_id)s,
                %(pos_id)s,
                %(saler_mobiles)s,
                %(sales_date)s,
                %(saler_cnt)s,
                %(remark)s,
                %(create_user_id)s,
                %(sale_hour)s
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

def plan_audit(status_id,status,channel_id,charge_departs,selected_plan):
    conn,cur=None,None
    try:
        conn=pg.connect(**config.pg_main)
        cur=conn.cursor()
        sql=(' update itd.t_sales_plan ',
             ' set status=%(status_id)s ',
             ' where 1=1 ',
             ' and status=any(%(status)s) ',
             ' and channel_id=%(channel_id)s ',
             ' and sales_depart_id = any(%(charge_departs)s) ',
             ' and plan_id=any(%(selected_plan)s) ',
        )
        args={
            'status_id':status_id,
            'status':status,
            'channel_id':channel_id,
            'charge_departs':charge_departs,
            'selected_plan':selected_plan
        }
        cur.execute(''.join(sql),args)
        conn.commit()
        return cur.rowcount
    finally:
        if cur:cur.close()
        if conn:conn.close()

def get_column():
    conn,cur=None,None
    try:
        conn=pg.connect(**config.pg_main)
        cur=conn.cursor()
        sql='''
SELECT col_description(a.attrelid,a.attnum) as comment,format_type(a.atttypid,a.atttypmod) as type,a.attname as name, a.attnotnull as notnull   
FROM pg_class as c,pg_attribute as a where c.relname = 't_sales_plan' and a.attrelid = c.oid and a.attnum>0 and col_description(a.attrelid,a.attnum) is not null
'''
        cur.execute(sql)
        plan_column=pg.fetchall(cur)
        sql='''
SELECT col_description(a.attrelid,a.attnum) as comment,format_type(a.atttypid,a.atttypmod) as type,a.attname as name, a.attnotnull as notnull   
FROM pg_class as c,pg_attribute as a where c.relname = 't_sales_plan' and a.attrelid = c.oid and a.attnum>0 and col_description(a.attrelid,a.attnum) is not null
'''
        cur.execute(sql)
        pos_column=pg.fetchall(cur)
        sql='''
SELECT col_description(a.attrelid,a.attnum) as comment,format_type(a.atttypid,a.atttypmod) as type,a.attname as name, a.attnotnull as notnull   
FROM pg_class as c,pg_attribute as a where c.relname = 't_sales_plan' and a.attrelid = c.oid and a.attnum>0 and col_description(a.attrelid,a.attnum) is not null
'''
        cur.execute(sql)
        saler_column=pg.fetchall(cur)
        sql = '''
SELECT col_description(a.attrelid,a.attnum) as comment,format_type(a.atttypid,a.atttypmod) as type,a.attname as name, a.attnotnull as notnull   
FROM pg_class as c,pg_attribute as a where c.relname = 't_sales_plan' and a.attrelid = c.oid and a.attnum>0 and col_description(a.attrelid,a.attnum) is not null
        '''
        cur.execute(sql)
        user_column=pg.fetchall(cur)
        return plan_column,pos_column,saler_column,user_column
    finally:
        if cur:cur.close()
        if conn:conn.close()

def plan_export(channel_id,charge_departs,sales_dates=None,status_id=None,sales_depart_id=None):
    conn,cur=None,None
    try:
        conn=pg.connect(**config.pg_main)
        cur=conn.cursor()
        sql=(" select c.channel_name 渠道,d.sales_depart_name 区分,plan.sales_date 促销日期, array_to_string(plan.sale_hour,',') 促销时刻, plan.create_user_id 排产人ID, plan.saler_cnt 应到人数, array_to_string(plan.saler_mobiles,',') 促销人员 from itd.t_sales_plan plan",
             ' left join itd.t_sales_channel c on plan.channel_id=c.channel_id',
             ' left join itd.t_sales_depart d on plan.sales_depart_id=d.sales_depart_id'
             ' where plan.channel_id=%(channel_id)s ',
             ' and plan.sales_depart_id=any(%(charge_departs)s) ',
             ' and plan.sales_date=any(%(sales_dates)s) ' if sales_dates else '',
             ' and plan.status=%(status_id)s ' if status_id else '',
             ' and plan.sales_depart_id=%(sales_depart_id)s ' if sales_depart_id else '',
             )
        print sql,channel_id,charge_departs,sales_dates
        args={
            'channel_id':channel_id,
            'charge_departs':charge_departs,
            'sales_dates':sales_dates,
            'status_id':status_id,
            'sales_depart_id':sales_depart_id
        }
        cur.execute(''.join(sql),args)
        rows=pg.fetchall(cur)
        return rows
    finally:
        if cur:cur.close()
        if conn:conn.close()
