# -*- coding: utf-8 -*-
from libs.privs import Priv


privs_all =[ {
            'lable':u'排产人员',
            'priv' : 'PRIV_PLAN'
            },{
            'lable':u'排产审核',
            'priv' : 'PRIV_ADMIN_CHECK'
            },{
            'lable':u'促销点管理员',
            'priv' : 'PRIV_ADMIN_POS'
            },{
            'lable':u'促销人员管理员',
            'priv' : 'PRIV_ADMIN_SALE'
            },{
            'lable':u'超级管理员',
            'priv' : 'PRIV_ADMIN_SUPER'
            },


        
       ] 

PRIV_PLAN = Priv('PRIV_PLAN')

PRIV_ADMIN = Priv('PRIV_ADMIN')
PRIV_ADMIN_SUPER = Priv('PRIV_ADMIN_SUPER')
PRIV_ADMIN_CHECK=Priv('PRIV_ADMIN_CHECK') 
PRIV_ADMIN_POS=Priv('PRIV_ADMIN_POS')
PRIV_ADMIN_SALE=Priv('PRIV_ADMIN_SALE')




PRIV_ADMIN_ANY = PRIV_ADMIN | PRIV_ADMIN_SUPER
PRIV_ADMIN_ANY = PRIV_ADMIN_ANY | PRIV_ADMIN_CHECK 
PRIV_ADMIN_ANY = PRIV_ADMIN_ANY | PRIV_ADMIN_POS
PRIV_ADMIN_ANY = PRIV_ADMIN_ANY | PRIV_ADMIN_SALE


