from privs import *



items = [{
        'label': u'促销排产',
        'items': [{
            'label': u'排产',
            'url': '/plan/arrange/',
            'priv': PRIV_PLAN_ARRANGE,
            }, {
            'label': u'排产历史',
            'url': '/plan/history/',
            'priv':  PRIV_PLAN,
            } ],
        'open': True,
        'icon': 'ActionGrade',
        'priv': PRIV_PLAN
        } , {
        'label': u'管理',
        'priv': PRIV_ADMIN_ANY,
        'items': [{
            'label': u'排产审核',
            'url': '/plan/check/',
            'priv': PRIV_ADMIN_CHECK,
            }, {
            'label': u'促销点管理',
            'url': '/pos/manager/',
            'priv': PRIV_ADMIN_POS,
            } , {
                'label': u'促销人员管理',
                'url': '/saler/manager/',
                'priv': PRIV_ADMIN_SALE,
                },
            'open': True,
            'icon': 'fa-user',
         },{
        'label': u'我',
        'url': '/user/mine/',
        }
]
 
