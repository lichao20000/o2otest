# -*- coding: utf-8 -*-
from libs.privs import Priv


privs_all =[ {
            'label':u'排产人员',
            'priv' : 'PRIV_PLAN'
            },{
            'label':u'排产审核',
            'priv' : 'PRIV_PLAN_AUDIT'
            },{
            'label':u'促销点管理员',
            'priv' : 'PRIV_ADMIN_POS'
            },{
            'label':u'促销人员管理员',
            'priv' : 'PRIV_ADMIN_SALE'
            },{
            'label':u'超级管理员',
            'priv' : 'PRIV_ADMIN_SUPER'
            },
       ]

PRIV_PLAN = Priv('PRIV_PLAN')
PRIV_ADMIN = Priv('PRIV_ADMIN')
PRIV_ADMIN_SUPER = Priv('PRIV_ADMIN_SUPER')
PRIV_PLAN_AUDIT=Priv('PRIV_PLAN_AUDIT') 
PRIV_ADMIN_POS=Priv('PRIV_ADMIN_POS')
PRIV_ADMIN_SALE=Priv('PRIV_ADMIN_SALE')


PRIV_ADMIN_ANY = PRIV_ADMIN | PRIV_ADMIN_SUPER
PRIV_ADMIN_ANY = PRIV_ADMIN_ANY | PRIV_PLAN_AUDIT 
PRIV_ADMIN_ANY = PRIV_ADMIN_ANY | PRIV_ADMIN_POS
PRIV_ADMIN_ANY = PRIV_ADMIN_ANY | PRIV_ADMIN_SALE


