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
select 促销点类别,渠道类型,促销点名称,促销点地址,当前在现场促销人员,促销人员手机号码, substring(cast(当前时刻 as varchar) from 1 for 16)促销时间点  from  itd.ssw_o2o_every_time order by 促销时间点 desc limit 100000
    '''.decode('utf-8'),
        }, 
        {'name':u'促销人员实况--今日',
#         'sql': '''
#    select a.pos_type 促销点类别,a.channel_type 渠道类型,to_char(now(), 'YYYY-MM-DD')统计日期, a.pos_name 促销点名称,a.address 促销点地址,name 促销人员姓名, a.serial_number 促销人员手机号码 from (
#select distinct lng, lat, pos_type, pos_name, channel_type,address, area, channel_detail, person_duty, arrive_need,serial_number,name
#from (
#select lng, lat,pos_type, pos_name,address, channel_type, area, channel_detail,person_duty,arrive_need,serial_number,
#  extract(hour from create_date) ,status,name,distanct,
#  row_number()over(partition by create_date,name order by distanct) rn
#from(-------------------2、匹配当前距离小于500的点与人
#select a.*, b.serial_number, b.x, b.y, b.create_date, b.status, b.name,
#ST_Distance_sphere(st_point(a.lng,a.lat),st_point(b.x,b.y)) distanct
#from
#(select a.address,st_x(geo_data) lng, st_y(geo_data) lat, b.* FROM ----1、取出当前最近的地址并添加至ssw_pos_affi_v1中
#(select * FROM (select *,  row_number()over(partition by poi_name order by poi_id desc)rn from t_rp_poi p where  (p.is_deleted is null or p.is_deleted=0))a where rn = 1) a,
#itd.ssw_pos_affi_v1 b
#where a.poi_name = b.pos_name) a,----1、取出当前最近的地址并添加至ssw_pos_affi_v1中
#(select a.bind_mobile, b.x, b.y,create_date, c.status , d.name,d.area,d.serial_number,d.channel_type,d.pos_type
#from t_rp_sms_user a, t_rp_user_loc b,  t_rp_user_signup_status c, itd.cuxiao_num_v1 d
#where a.user_id = b.user_id and a.user_id = c.user_id and d.serial_number = a.bind_mobile
#and to_char(b.create_date, 'YYYY-MM-DD') = to_char(now(), 'YYYY-MM-DD') --'2018-04-26'--to_char(now() - interval '1 day','YYYYMMDD')
#) b---昨天数据
#where a.area = b.area and ST_Distance_sphere(st_point(a.lng,a.lat),st_point(b.x,b.y)) < 500 and a.channel_type = b.channel_type and a.pos_type = b.pos_type
# -------------------2、匹配当前距离小于500的点与人
# )a
# )a where rn = 1
# )a order by 渠道类型
#''',
'sql': '''
select * from (
select distinct to_char (now(), 'YYYY-MM-DD') 统计时间,pos_type,channel_type,a.area,pos_name,当前在现场促销人员 促销人员姓名,促销人员手机号码 from 
(select pos_name, b.arrive_need,channel_type,area,pos_type FROM ----1、取出当前最近的地址并添加至ssw_pos_affi_v1中 
(select * FROM (select *,  row_number()over(partition by poi_name order by poi_id desc)rn from t_rp_poi p where  (p.is_deleted is null or p.is_deleted=0))a where rn = 1) a,--去重去最新
itd.ssw_pos_affi_v1 b
where a.poi_name = b.pos_name)a left join 
itd.ssw_o2o_every_time b
on a.pos_name = b.促销点名称 and to_char (当前时刻, 'YYYY-MM-DD') = to_char (now(), 'YYYY-MM-DD')
  )c where 促销人员姓名 is not null
''',



},
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
        },
    {
        'name':u'新版-促销人员到场分时明细(半小时)',
        'sql':u'''
select pos_type 促销点类别,is_charge 是否有租金, pos_name 促销点名称, pos_address 促销点地址, s.channel_name 渠道, s.sales_depart_name 区分, pos_unit 单元, saler_name 促销人员, bind_mobile 促销人员手机号码, cast(create_date AS varchar) 统计时刻 
from itd.ssw_cxmx_pc_half_hour s left join itd.t_sales_channel c on s.channel_name=c.channel_name left join itd.t_sales_depart d on s.sales_depart_name=d.sales_depart_name
where bind_mobile is not null 
and pos_type in (select tag_label from itd.t_pos_tag) and c.channel_id=%(channel_id)s and d.sales_depart_id=any(%(charge_departs)s)
order by 统计时刻 desc
limit 100000
        '''
    },
    {
        'name':u'新版-促销人员到场分时明细（包括未按排产时间）（半小时）',
        'sql':u'''
select pos_type 促销点类别,is_charge 是否有租金, pos_name 促销点名称, pos_address 促销点地址, a.channel_name 渠道 , a.sales_depart_name 区分, pos_unit 单元, saler_name 促销人员, bind_mobile 促销人员手机号码, cast(create_date as varchar) 统计时刻 
from itd.ssw_cxmx_pc_half_hour_all a
left join itd.t_sales_channel b
on a.channel_name=b.channel_name
left join itd.t_sales_depart c 
on a.sales_depart_name=c.sales_depart_name
where bind_mobile is not null 
and pos_type in (select tag_label from itd.t_pos_tag)
and b.channel_id=%(channel_id)s
and c.sales_depart_id = any(%(charge_departs)s)
order by 统计时刻 desc
limit 100000
        '''
    },{
        'name':u'新版--未按排产时间排产人员(累计至查询时刻)',
        'sql':'''
select distinct a.channel_name, a.sales_depart_name, pos_name, saler_name  
,b.channel_id
,c.sales_depart_id
from itd.ssw_cxmx_pc_half_hour_all a
, itd.t_sales_channel b
, itd.t_sales_depart c
where
to_char(create_date, 'YYYY-MM-DD') = to_char(now(), 'YYYY-MM-DD') 
and a.channel_name = b.channel_name 
and a.sales_depart_name = c.sales_depart_name
and b.channel_id = c.channel_id
and saler_name is not null
and saler_name not in 
(select distinct saler_name from itd.ssw_cxmx_pc_half_hour where to_char(create_date, 'YYYY-MM-DD') = to_char(now(), 'YYYY-MM-DD')  and saler_name is not null)
and b.channel_id=%(channel_id)s 
and c.sales_depart_id = any(%(charge_departs)s)
        '''
    },
    ]



