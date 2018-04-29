# *- coding: utf-8 -*-

import os
import sys

_dir = os.path.dirname(os.path.abspath(__file__))
_updir = os.path.abspath(os.path.join( _dir, '../'))
if _updir not in sys.path:
    sys.path.append(_updir)


from libs import pg_helper as pg
import config
import copy




def get_datas(sql, args=None):
    conn, cur = None, None
    try:
        _config = copy.deepcopy(config.pg_stand)
        _config['schema'] ='public'
        conn = pg.connect(**_config)
        cur = conn.cursor()
        cur.execute(sql, args) 
        rows = pg.fetchall(cur)
        return rows
    finally:
        if cur: cur.close()
        if conn: conn.close()


sqls = [{
        'name': u'促销人员实况--分时',
        'sql':  '''
select 促销点类别,渠道类型,促销点名称,促销点地址,当前在现场促销人员,促销人员手机号码, substring(cast(当前时刻 as varchar) from 1 for 16)促销时间点  from  itd.ssw_o2o_every_time order by 渠道类型
    '''.decode('utf-8'),
        }, 
        {'name':u'促销人员实况--今日',
         'sql': '''
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
'''},
    {
        'name': u'所有录入号码',
        'sql': u'''
        select * from itd.cuxiao_num_v1 where serial_number in (select bind_mobile from t_rp_sms_user);
        '''
        }
    ]



