-- 促销点
create table t_sales_pos{ 
    pos_id integer primary key, -- 促销点 ID 本地
    pos_type  varchar(10) , -- 美宜佳， 711
    sale_id  varchar(30), -- 促销点ID  导入
    pos_name varchar(100),
    pos_address  text,
    pos_depart varchar(20),
    
}
