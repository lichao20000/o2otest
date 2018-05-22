# *- coding: utf-8 -*-
import os
import sys


_dir = os.path.dirname(os.path.abspath(__file__))

from flask import Blueprint, request, redirect, abort
from flask import make_response, render_template

from flask import send_file
from ui import jview, json_view

from libs.session_helper import auth_required
import config
import json
from ui import jview, json_view
from utils import _int, _float, _date, _int_default, Abort
import usersvc
from menu import items as menus
from privs import PRIV_ADMIN_SUPER,PRIV_ADMIN_ANY,PRIV_ADMIN
from privs import privs_all

import copy

api_bp = Blueprint('user_api_bp', __name__, template_folder='templates')

@api_bp.route('/menus.json', methods=['POST', 'GET'])
@auth_required
@jview
def menus():
    u'''
    获取菜单 
    '''
    return usersvc.get_channels()


@api_bp.route('/get_channels.json', methods=['POST', 'GET'])
@auth_required
@jview
def get_channel():
    u'''
    获取渠道信息
    '''
    args= request.args
    if request.method == 'POST':
        args = request.form
    top =True if  args.get('top', '') else False
    return usersvc.get_channels(top)




@api_bp.route('/set_sales_info.json', methods=['POST', 'GET'])
@auth_required
@jview
def set_sales_info():
    u'''
    第一次登入需要设置 渠道， 区分信息
    市公司管理不能通过此接口设置 
    '''
    args = request.args
    if request.method == 'POST':
        args = request.form
    channel_id = _int(args.get('channel_id','')  )
    sales_depart_id = _int(args.get('sales_depart_id','')  )
    user = request.environ['user']
    result, msg = False, ''
    try:
        if not channel_id or not sales_depart_id: 
            raise Abort(u'无效渠道id或区分id')
        # 检查是否已设置过
        user_info = usersvc.get_user_local_info(user.user_id)
        if user_info['channel_id'] or user_info['sales_depart_id']:
            raise Abort(u'已设置过渠道和区分信息（修改请联系管理人员）')
        # 检查渠道和区分对应关系
        channels = usersvc.get_channels()
        _channel = [c for c in channels if c['channel_id']==channel_id]
        if not _channel:
            raise Abort(u'设置的渠道不存在')
        _depart = [ d for d in _channel[0]['departs']  if d['sales_depart_id'] ==sales_depart_id]
        if not _depart:
            raise Abort(u'设置的渠道和区分错误')
        result = usersvc.set_user_sales_info(user.user_id, channel_id, sales_depart_id)
        if result:
            user.user_info = usersvc.get_user_local_info(user.user_id)
            user.save_to_session()
    except Abort, e:
        msg = e.msg
    return {'result': result, 'msg': msg}


@api_bp.route('/admin_set_info.json', methods=['POST', 'GET'])
@auth_required(priv=PRIV_ADMIN_SUPER)
@jview
def admin_set_info():
    u'''
    管理员设置渠道
    '''
    args = request.args
    if request.method == 'POST':
        args = request.form
    channel_id = _int(args.get('channel_id','')  )
    sales_depart_id = _int(args.get('sales_depart_id','')  )
    user = request.environ['user']
    result, msg = False, ''
    try:
        if not channel_id or not sales_depart_id: 
            raise Abort(u'无效渠道id或区分id')
        channels = usersvc.get_channels(top=True)
        _channel = [c for c in channels if c['channel_id']==channel_id]
        if not _channel:
            raise Abort(u'设置的渠道不存在')
        _depart = [ d for d in _channel[0]['departs']  if d['sales_depart_id'] ==sales_depart_id]
        if not _depart:
            raise Abort(u'设置的渠道和区分错误')
        result = usersvc.set_user_sales_info(user.user_id, channel_id, sales_depart_id)
        if result:
            user.user_info = usersvc.get_user_local_info(user.user_id)
            user.save_to_session()
    except Abort, e:
        msg = e.msg
    return {'result': result, 'msg': msg}


@api_bp.route('/get_users.json',methods=['POST','GET'])
@auth_required(priv=PRIV_ADMIN_SUPER|PRIV_ADMIN)
@jview
def admin_get_user():
    args=request.args
    if request.method=='POST':
        args=request.form
    sales_depart_id =_int(args.get('sales_depart_id', ''))
    query=args.get('query')
    user=request.environ["user"]
    channel_id=user.user_info['channel_id']
    charge_departs=user.user_info["charge_departs"]
    charge_departs=tuple(charge_departs)#后台直接限制查询范围
    return {"users":usersvc.get_users(channel_id,charge_departs,sales_depart_id,query)}


@api_bp.route('/get_user_privs.json', methods=['POST','GET'])
@auth_required(priv=PRIV_ADMIN_ANY)
@jview
def admin_get_privs():
    args=request.args
    if request.method=='POST':
        args=request.form
    AdminUser = request.environ['user']
    user_id=args.get('user_id','')
    SetUser=usersvc.get_user_local_info(user_id)
    if not SetUser['privs']:
        SetUser['privs']=[]
    AdminPrivs = AdminUser.user_info['privs']
    privsmanage=[False,False,False,False]
    for a in AdminPrivs:
        if a=='PRIV_ADMIN_SUPER':
            privsmanage[0]=True
        if a=='PRIV_ADMIN':
            privsmanage[1]=True
    SetPrivs = SetUser['privs']

    for s in SetPrivs:
        if s=='PRIV_ADMIN_SUPER':
            privsmanage[2]=True
        if s=='PRIV_ADMIN':
            privsmanage[3]=True
    if SetPrivs is None:
        SetPrivs=[]
    result,msg=False,''
    try:
        if SetUser is None:
            raise Abort(u'获取用户资料异常')
        resp=[]
        if privsmanage[2] or (privsmanage[3] and not privsmanage[0]):
            pass
        else:
            for a in AdminPrivs:
                if a=='PRIV_ADMIN_SUPER' or (a=='PRIV_ADMIN' and not privsmanage[0]):
                    pass
                else:
                    match=False
                    for s in SetPrivs:
                        if a==s:
                            match=True
                            break
                    if match:
                        for p in privs_all:
                            if p['priv']==a.encode():
                                resp.append({'priv':a.encode(),'state':True,'label':p['label']})
                    else:
                        for p in privs_all:
                            if p['priv']==a.encode():
                                resp.append({'priv':a.encode(),'state':False,'label':p['label']})
        result=True
        return {'user':SetUser,'privs':resp,'result':result,'msg':msg}
    except Abort,e:
        msg=e.msg
    return {'result':result,'msg':msg}

def privsUpdate(privs,priv,state):
    if state=='true' and priv not in privs:
        privs.append(priv)
    elif state=='false' and priv in privs:
        privs.remove(priv)
    else:
        raise Abort(u'设置权限异常')
    return privs


@api_bp.route('/set_user_privs.json', methods=['POST','GET'])
@auth_required(priv=PRIV_ADMIN_ANY)
@jview
def admin_alter_user():
    args = request.args
    if request.method == 'POST':
        args=request.form
    result, msg = False, ''
    try:
        user_id=args.get('user_id','')
        SetUser = usersvc.get_user_local_info(user_id)
        privs=copy.copy(SetUser['privs'] if SetUser['privs'] else [])
        AdminUser=request.environ['user']
        if not user_id or not SetUser:
            raise Abort(u'设置的用户不存在')
        if 'PRIV_ADMIN_SUPER' in privs or \
                ('PRIV_ADMIN_SUPER' not in AdminUser.user_info['privs'] and 'PRIV_ADMIN' in privs) :
            raise Abort(u'不能越级更改系统管理员的信息')

        channel_id = args.get('channel_id', '')
        channel_id =_int(channel_id) if channel_id else None
        channel_id = channel_id if channel_id != SetUser['channel_id'] else None
        sales_depart_id = args.get('sales_depart_id', None)
        sales_depart_id =_int(sales_depart_id) if sales_depart_id else None
        sales_depart_id =sales_depart_id if sales_depart_id !=SetUser['sales_depart_id'] else None
        user_name = args.get('user_name', None)
        user_name = user_name if user_name !=SetUser['user_name'] else None
        if channel_id and 'PRIV_ADMIN_SUPER' not in AdminUser.user_info['privs'] and channel_id!=AdminUser.user_info['channel_id'] :
            raise Abort(u'非超级管理员不能更改渠道')
        if sales_depart_id and 'PRIV_ADMIN_SUPER' not in AdminUser.user_info['privs'] and sales_depart_id not in AdminUser.user_info['charge_departs']:
            raise Abort(u'非超级管理员不能夸越渠道变更区分')
        if sales_depart_id and channel_id:
            depart_info=usersvc.get_depart_list(sales_depart_id=sales_depart_id)
            if depart_info[0]['channel_id']!=channel_id:
                raise Abort(u'设置的渠道与区分不符合')


        PRIV_ADMIN = args.get('PRIV_ADMIN', None)
        if PRIV_ADMIN:privs=privsUpdate(privs,'PRIV_ADMIN',PRIV_ADMIN)
        PRIV_ADMIN_POS = args.get('PRIV_ADMIN_POS', None)
        if PRIV_ADMIN_POS:privs=privsUpdate(privs,'PRIV_ADMIN_POS',PRIV_ADMIN_POS)
        PRIV_ADMIN_SALE = args.get('PRIV_ADMIN_SALE', None)
        if PRIV_ADMIN_SALE:privs=privsUpdate(privs,'PRIV_ADMIN_SALE',PRIV_ADMIN_SALE)
        PRIV_PLAN = args.get('PRIV_PLAN', None)
        if PRIV_PLAN:privs=privsUpdate(privs,'PRIV_PLAN',PRIV_PLAN)
        PRIV_ADMIN_DATA = args.get('PRIV_ADMIN_DATA', None)
        if PRIV_ADMIN_DATA:privs=privsUpdate(privs,'PRIV_ADMIN_DATA',PRIV_ADMIN_DATA)
        PRIV_PLAN_AUDIT = args.get('PRIV_PLAN_AUDIT', None)
        if PRIV_PLAN_AUDIT:privs=privsUpdate(privs,'PRIV_PLAN_AUDIT',PRIV_PLAN_AUDIT)
        privs = '{'+','.join(privs)+'}' if privs != SetUser['privs'] else None


        tags=copy.copy(SetUser['tags'] if SetUser['tags'] else [])
        TAG_1 = args.get(u'1', None)
        if TAG_1=='true' and 1 not in tags:
            tags.append(1)
        elif TAG_1=='false' and 1 in tags:
            tags.remove(1)
        TAG_2 = args.get(u'2', None)
        if TAG_2=='true' and 2 not in tags:
            tags.append(2)
        elif TAG_2=='false' and 2 in tags:
            tags.remove(2)
        tags='{'+','.join(map(str,tags))+'}' if  tags !=SetUser['tags'] else None
        if channel_id or sales_depart_id or user_name or privs or tags:
            print channel_id,sales_depart_id,user_name,privs,tags
            usersvc.set_user_all(user_id=user_id,
                                 adminuser_id=AdminUser.user_info['user_id'],
                                 channel_id=channel_id,
                                 sales_depart_id=sales_depart_id,
                                 user_name=user_name,
                                 privs=privs,
                                 tags=tags,
                                 )
            result=True
        else:
            raise Abort(u'没有更新的内容')
    except Abort, e :
        msg = e.msg
    return {'result': result, 'msg': msg}

@api_bp.route('/get_pos_tag.json', methods=['POST','GET'])
@auth_required(priv=PRIV_ADMIN_SUPER)
@jview
def get_pos_tag():
    args=request.args
    if request.method=='POST':
        args=request.form
    user=request.environ['user']
    rows=usersvc.get_pos_tag()
    return {'rows':rows}

@api_bp.route('/get_channels_departs.json',methods=['POST','GET'])
@auth_required(priv=PRIV_ADMIN_SUPER)
@jview
def get_channel_list():
    args=request.args
    if request.method=='POST':
        args=request.form
    channels = usersvc.get_channel_list()
    departs = usersvc.get_depart_list()
    return {'channels':channels,'departs':departs}


@api_bp.route('/get_user_tag.json',methods=['POST','GET'])
@auth_required(priv=PRIV_ADMIN_SUPER|PRIV_ADMIN)
@jview
def get_user_tag():
    args=request.args
    if request.method=='POST':
        args=request.form
    user_id=args.get('user_id','')
    adminUser=request.environ['user']
    setUser = usersvc.get_user_local_info(user_id)
    if not setUser or \
            adminUser.user_info['channel_id']!=setUser['channel_id'] or \
            setUser['sales_depart_id'] not in adminUser.user_info['charge_departs']:
        raise Abort(u'请求的用户不存在或非负责区域')
    tags,result,msg=[],False,''
    privsmanage = [False, False, False, False]
    for a in adminUser.user_info['privs']:
        if a == 'PRIV_ADMIN_SUPER':
            privsmanage[0] = True
        if a == 'PRIV_ADMIN':
            privsmanage[1] = True
    for s in setUser['privs']:
        if s=='PRIV_ADMIN_SUPER':
            privsmanage[2]=True
        if s=='PRIV_ADMIN':
            privsmanage[3]=True
    if privsmanage[2] or (privsmanage[1] and privsmanage[3]):
        raise Abort(u'无权限设置该用户的标签')
    try:
        rows=usersvc.get_pos_tag()
        adminTags=adminUser.user_info['tags'] if adminUser.user_info['tags'] else []
        setTags=setUser['tags'] if setUser['tags'] else []
        for a in adminTags:
            for r in rows:
                if a==r[u'tag_id']:
                    match = False
                    for s in setTags:
                        if a==s:
                            match=True
                            break
                    if match:
                        tags.append({'tag_id': a, 'tag_label': r[u'tag_label'], 'status': True})
                    else:
                        tags.append({'tag_id': a, 'tag_label': r[u'tag_label'], 'status': False})
        result=True
    except Abort,e:
        msg=e.msg
    return {'tags':tags,'result':result,'msg':msg}