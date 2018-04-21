# -*- coding: utf-8 -*- 
from privs import *
import functools
from flask import request, redirect, abort
import copy
from utils import json_dumps


items = [{
        'label': u'促销排产',
        'open': True,
        'icon': 'ActionGrade',
        'priv': PRIV_PLAN | PRIV_ADMIN_ANY ,
        'items': [{
            'label': u'排产',
            'url': '/plan/arrange/',
            'priv': PRIV_PLAN | PRIV_ADMIN_ANY ,
            }, {
            'label': u'排产历史',
            'url': '/plan/history/',
            'priv': PRIV_PLAN | PRIV_ADMIN_ANY ,
            } ],
        } , {
        'label': u'管理',
        'priv': PRIV_ADMIN_ANY,
        'open': True,
        'icon': 'fa-user',
        'items': [{
            'label': u'排产审核',
            'url': '/plan/check/',
            'priv': PRIV_ADMIN_CHECK | PRIV_ADMIN_SUPER,
            }, {
            'label': u'促销点管理',
            'url': '/pos/manager/',
            'priv': PRIV_ADMIN_POS | PRIV_ADMIN_SUPER,
            } , {
                'label': u'促销人员管理',
                'url': '/saler/manager/',
                'priv': PRIV_ADMIN_SALE | PRIV_ADMIN_SUPER,
            },{
                'label': u'权限管理',
                'url': '/sys/manager/',
                'priv':  PRIV_ADMIN_SUPER,
                },]
         },{
        'label': u'我',
        'url': '/user/mine/',
        }
]



def h1(items, labels):
    if not labels:
        return
    if not items:
        return
    for item in items:
        if item['label'] == labels[0]:
            item['highlight'] = True
            if 'items' in item:
                h1(item['items'], labels[1:])

def make_menu_id(items, parent=None):
    for item in items:
        label = item['label']
        if isinstance(label, unicode):
            label = label.encode('utf-8')
        item_id = label.encode('hex')
        if parent and 'id' in parent:
            item_id = parent['id'] + '.' + item_id
        item['id'] = item_id
        if 'items' in item:
            make_menu_id(item['items'], parent=item)

def get_items(all_items, user_privs, _li):
    make_menu_id(all_items)
    def has_privilege_of_item(item, user_privs):
        if isinstance(item, dict):
            if 'privs' in item and item['privs']:
                for priv in user_privs:
                    if priv in item['privs']:
                        return True
                return False
            elif 'priv' in item:
                priv = item['priv']
                return priv.fullfilled_by(user_privs)
            else:
                return True
        elif isinstance(item, list) or isinstance(item, tuple):
            return any([has_privilege_of_item(t, user_privs) for t in item])
        else:
            return True
    def privilege_check(items, user_privs):
        items = [t for t in items if has_privilege_of_item(t, user_privs)]
        for item in items:
            if 'items' in item:
                item['items'] = privilege_check(item['items'], user_privs)
        return items
    _items = copy.deepcopy(all_items)
    h1(_items, _li[:])
    _items = privilege_check(_items, user_privs)
    return _items



def func_menu(h_labels=None, menu_items=None):
    _li =  h_labels[:] if h_labels else []
    def wrapper_maker(view_func):
        @functools.wraps(view_func)
        def wrapper(*args, **kargs):
            user = request.environ['user']
            result = view_func(*args, **kargs)
            if isinstance(result, dict):
                privs = user.privileges
                if menu_items:
                    visible_items = get_items(menu_items, 
                                              privs, _li)
                else:
                    visible_items = get_items(items, 
                                              privs, _li)
                result['menu_items'] = json_dumps(visible_items)
            return result
        return wrapper
    return wrapper_maker










 