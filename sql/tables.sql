create table t_sales_channel(
    channel_id integer primary key , -- 渠道ID
    channel_name varchar(100) ,-- 渠道名称
    last_update_time timestamp default current_timestamp
);

create  sequence seq_t_sales_channel;
--  初始化

insert into t_sales_channel( channel_id, channel_name)
values 
(nextval('seq_t_sales_channel'),'校园'),
(nextval('seq_t_sales_channel'),'实渠'),
(nextval('seq_t_sales_channel'),'营业');


create table t_sales_depart(
    sales_depart_id integer primary key , -- 渠道区分id
    sales_depart_name varchar(100) not null, --- 渠道名称
    parent_id  integer not null,
    channel_id integer not null, 
    last_update_time timestamp default current_timestamp,
    last_udpate_user_id varchar(60)
);
create sequence seq_t_sales_depart;

--  初始化

insert into t_sales_depart
(sales_depart_id, channel_id,  sales_depart_name, parent_id )
values 
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='校园'),'市公司校园', 0),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='实渠'),'市公司实渠', 0),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='营业'),'市公司营业', 0)
;
-- parent_id 根据上面创建的设置
insert into t_sales_depart
(sales_depart_id, channel_id,  sales_depart_name, parent_id )
values 
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='校园'),'天河区分',1),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='校园'),'越秀区分',1),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='校园'),'白云区分',1),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='校园'),'番禺区分',1),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='校园'),'海珠区分',1),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='校园'),'花都区分',1),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='校园'),'荔湾区分',1),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='校园'),'黄埔区分',1),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='校园'),'增城区分',1),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='校园'),'从化区分',1),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='校园'),'南沙区分',1),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='实渠'),'天河销售',2),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='实渠'),'海珠销售',2),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='实渠'),'白云南销售',2),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='实渠'),'白云北销售',2),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='实渠'),'番禺销售',2),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='实渠'),'越秀销售',2),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='实渠'),'花都销售',2),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='实渠'),'荔湾销售',2),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='实渠'),'黄埔销售',2),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='实渠'),'增城销售',2),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='实渠'),'南沙销售',2),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='实渠'),'从化销售',2),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='营业'),'天河销售',3),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='营业'),'海珠销售',3),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='营业'),'白云南销售',3),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='营业'),'白云北销售',3),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='营业'),'番禺销售',3),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='营业'),'越秀销售',3),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='营业'),'花都销售',3),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='营业'),'荔湾销售',3),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='营业'),'黄埔销售',3),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='营业'),'增城销售',3),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='营业'),'南沙销售',3),
(nextval('seq_t_sales_depart'),(select channel_id from t_sales_channel where channel_name ='营业'),'从化销售',3)
;


/*create view v_sales_depart as 
select  d.*,
    (select array_agg(sales_depart_id)||d.sales_depart_id 
        from t_sales_depart sd 
    where sd.parent_id = d.sales_depart_id)  as charge_departs
from t_sales_depart d;
*/

CREATE OR REPLACE VIEW public.v_sales_depart AS
 SELECT d.sales_depart_id,
    d.sales_depart_name,
    d.parent_id,
    d.channel_id,
    d.last_update_time,
    d.last_udpate_user_id,
    ( SELECT array_agg(sd.sales_depart_id) || d.sales_depart_id
           FROM t_sales_depart sd
          WHERE sd.parent_id = d.sales_depart_id) AS charge_departs
   FROM t_sales_depart d;




--- 用户表
-- drop table t_sales_user;
create table t_sales_user(
    user_id varchar(60) primary key , -- uni_email
    user_name varchar(20),
    mobile varchar(11),
    channel_id integer , 
    sales_depart_id integer, 
    privs varchar[],
    last_sync_time timestamp default current_timestamp, --基本信息 同步时间
    last_login_time timestamp default current_timestamp,
    last_update_time timestamp, --- chanenl depart privs 更新时间
    last_update_user_id varchar(60) -- 同上
);


CREATE OR REPLACE VIEW public.v_sales_depart AS
 SELECT d.sales_depart_id,
    d.sales_depart_name,
    d.parent_id,
    d.channel_id,
    d.last_update_time,
    d.last_udpate_user_id,
    ( SELECT array_agg(sd.sales_depart_id) || d.sales_depart_id
           FROM t_sales_depart sd
          WHERE sd.parent_id = d.sales_depart_id) AS charge_departs
   FROM t_sales_depart d;




-- 促销点
-- drop table t_sales_pos
CREATE EXTENSION postgis;

create sequence seq_t_sales_pos;
-- drop table t_sales_pos
create table t_sales_pos (
    pos_id integer primary key default nextval('seq_t_sales_pos'), -- 促销点 ID 本地
    pos_type  varchar(10) , -- 美宜佳， 711
    sales_id  varchar(30), -- 促销点ID  导入
    pos_name varchar(100),
    pos_address  text,
    channel_id integer,  -- 渠道
    sales_depart_id integer, -- 区分
    pos_unit varchar(100), -- 责任单元
    pos_code varchar(60), -- 代码点
    geo_data GEOMETRY(Point,4326),
    deleted integer,
    update_time timestamp,
    create_time timestamp default current_timestamp,
    update_user_id varchar(60),
    create_user_id varchar(60)
);


insert into t_sales_pos
(pos_type, sales_id, pos_name, pos_address, channel_id, sales_depart_id)
values
('美宜佳', 'A580', '测试美宜佳', '天河区中山大道西141', 1, 4),
('711xxx', 'B580', '测试xxxax1', '白云钟落潭bbbb村子 ', 1, 4),
('固定点', 'F580', 'what hhah ', '越秀llll啦啦啦啦啦 ', 1, 5),
('美宜佳', 'A180', 's凑凑 a 下', '海珠嗨hi 啊 hi 阿海', 1, 6)
;



-- 促销人员表
-- drop table t_sales_saler
create table t_sales_saler (
    mobile varchar(11) primary key,
    saler_name varchar(100),
    channel_id integer,
    sales_depart_id integer , -- 可以为空 不做限定
    unit varchar(60),
    deleted int default 0 , -- 状态位
    create_user_id varchar(60),
    create_time timestamp default current_timestamp,
    last_update_user_id varchar(60),
    update_time timestamp
)








