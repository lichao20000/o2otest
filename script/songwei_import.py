# -*- coding: utf-8  -*-
import os
import sys
_dir = os.path.abspath(os.path.join(__file__, '..'))
_updir = os.path.abspath(os.path.join(_dir, '..'))
webapp = os.path.join(_updir, 'webapp')
if webapp not in sys.path:
    sys.path.insert(0, webapp)

from libs.file_helper import excel_write
from libs import pg_helper as pg
from datetime import datetime as dt
import logging 
import config


logging_config = { 
    'filename': os.path.join(_dir, 'songwei_import.log'),
    'level': logging.DEBUG,
    'format': ''.join(('[%(levelname)s] %(asctime)-15s ',
                '%(processName)s %(module)s %(message)s'))
    }  
 
logging.basicConfig(**logging_config)
logger = logging.getLogger('crawl-bot')


def get_datas(sql, args=None):
    conn, cur = None, None
    try:
        conn = pg.connect(**config.pg_stand)
        cur = conn.cursor()
        cur.execute(sql, args) 
        rows = pg.fetchall(cur)
        return rows
    finally:
        if cur: cur.close()
        if conn: conn.close()


sqls = [{
        'name': u'促销人员实况--分时',
        'sql':  u'''
select 促销点类别,渠道类型,促销点名称,促销点地址,当前在现场促销人员,促销人员手机号码, substring(cast(当前时刻 as varchar) from 1 for 16)促销时间点  from  itd.ssw_o2o_every_time order by 渠道类型
    ''',
        }, 
        {'name':u'显示名：促销人员实况--今日',
         'sql': u'''
    select a.pos_type 促销点类别,a.channel_type 渠道类型,to_char(now(), 'YYYY-MM-DD')统计日期, a.pos_name 促销点名称,a.address 促销点地址,name 促销人员姓名, a.serial_number 促销人员手机号码 from (
select distinct lng, lat, pos_type, pos_name, channel_type,address, area, channel_detail, person_duty, arrive_need,serial_number,name
from (
select lng, lat,pos_type, pos_name,address, channel_type, area, channel_detail,person_duty,arrive_need,serial_number,
  extract(hour from create_date) ,status,name,distanct,
  row_number()over(partition by create_date,name order by distanct) rn
from(-------------------2、匹配当前距离小于500的点与人
select a.*, b.serial_number, b.x, b.y, b.create_date, b.status, b.name,
ST_Distance_sphere(st_point(a.lng,a.lat),st_point(b.x,b.y)) distanct
from
(select a.address,st_x(geo_data) lng, st_y(geo_data) lat, b.* FROM ----1、取出当前最近的地址并添加至ssw_pos_affi_v1中
(select * FROM (select *,  row_number()over(partition by poi_name order by poi_id desc)rn from t_rp_poi p where  (p.is_deleted is null or p.is_deleted=0))a where rn = 1) a,
itd.ssw_pos_affi_v1 b
where a.poi_name = b.pos_name) a,----1、取出当前最近的地址并添加至ssw_pos_affi_v1中
(select a.bind_mobile, b.x, b.y,create_date, c.status , d.name,d.area,d.serial_number,d.channel_type,d.pos_type
from t_rp_sms_user a, t_rp_user_loc b,  t_rp_user_signup_status c, itd.cuxiao_num_v1 d
where a.user_id = b.user_id and a.user_id = c.user_id and d.serial_number = a.bind_mobile
and to_char(b.create_date, 'YYYY-MM-DD') = to_char(now(), 'YYYY-MM-DD') --'2018-04-26'--to_char(now() - interval '1 day','YYYYMMDD')
) b---昨天数据
where a.area = b.area and ST_Distance_sphere(st_point(a.lng,a.lat),st_point(b.x,b.y)) < 500 and a.channel_type = b.channel_type and a.pos_type = b.pos_type
 -------------------2、匹配当前距离小于500的点与人
 )a
 )a where rn = 1
 )a order by 渠道类型
''',},
    {
    'name':u'已打点但未进入系统',
    'sql': u'''
 select poi_name, poi_remark, address from t_rp_poi where (is_deleted is null or is_deleted=0) and poi_name not in (select pos_name from itd.ssw_pos_affi_v1)
    ''',},
    {
    'name':u'已打点且进入系统',
    'sql': u'''select pos_name,channel_type, area, channel_detail from itd.ssw_pos_affi_v1
where pos_name in (select distinct poi_name from t_rp_poi where is_deleted is null or is_deleted = 0)
'''}
    ]


def write(sqls=sqls):
    for i, items in enumerate(sqls):
        sql = items['sql']
        name = items['name']
        rows = get_datas(sql)
        if not rows:
            logger.info(u' get data none. return. sql%s' % i)
            return 
        _d = dt.now() 

        _name = u'%s%s.xls' % (name,str(_d), )
        path = os.path.join(webapp, 'static', 'files')
        file_name = os.path.join(path, _name)
        if not excel_write(file_name, rows):
            logger.error(u' write to data to excel failed. sql%s' % i)
        else:
            logger.info(u' write excel success[%s].'%(_name,))
 

if __name__ == '__main__':
    #sqls = [{'sql': 'select *from t_sales_depart','name':'test.xls'}]
    write(sqls)

  
