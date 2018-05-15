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


@api_bp.route('/set_user_privs.json', methods=['POST','GET'])
@auth_required(priv=PRIV_ADMIN_ANY)
@jview
def admin_alter_user():
    args = request.args
    if request.method == 'POST':
        args=request.form
    privs = args.get('req', '')
    privstate=args.get('reqstate')
    user_id=args.get('user_id','')
    AdminUser=request.environ['user']
    SetUser=usersvc.get_user_local_info(user_id)
    result, msg = False, ''
    try:
        if not isinstance(privs,unicode) and not isinstance(privstate,unicode) and SetUser is None:
            raise Abort(u'无效的用户')
        if 'PRIV_ADMIN_SUPER' not in AdminUser.user_info['privs'] and 'PRIV_ADMIN' not in AdminUser.user_info['privs']:
            raise Abort(u'无权赋权')
        SetPrivs = SetUser['privs']
        if SetPrivs is None:
            SetPrivs = []
        privs=privs.encode().split(',')
        privstate=privstate.encode().split(',')
        if len(privs)!=len(privstate):
            raise Abort(u'权限和状态数量不一致')
        if SetUser['channel_id']==AdminUser.user_info['channel_id'] and SetUser['sales_depart_id'] in AdminUser.user_info['charge_departs']:
            for p in range(len(privs)):
                if p=='PRIV_ADMIN_SUPER' or p=='PRIV_ADMIN':
                    pass
                elif privs[p] in AdminUser.user_info['privs']:
                    if privs[p] not in SetPrivs and privstate[p]=='1':
                        SetPrivs.append(privs[p])
                    elif privs[p] in SetPrivs and privstate[p]=='0':
                        SetPrivs.remove(privs[p])
                    else:
                        Abort(u'无效的权限状态')
                else:
                    Abort(u'无效的赋权')
            SetPrivsString =''
            for p in SetPrivs:
                if SetPrivsString=='':
                    SetPrivsString=p
                else:
                    SetPrivsString=SetPrivsString+','+p
            SetPrivsString='{'+SetPrivsString+'}'
            usersvc.set_user_privs(user_id,SetPrivsString,AdminUser['user_id'])
            result=True
        else:
            raise Abort(u'设置的渠道区分')
    except Abort, e :
        msg = e.msg
    return {'result': result, 'msg': msg}