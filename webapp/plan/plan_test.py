# -*- coding: utf-8 -*- 

import unittest
import plansvc
import copy
import random


class UserTest(unittest.TestCase):


    def setUp(self):

        pass

    def tearDown(self):
        pass

    def get_random_plan(self):
        plan = {
            'channel_id' : random.choice(range(1,4)),
            'sales_depart_id': random.choice(range(4,35)),
            'pos_id': random.choice(range(5,100)),
            'saler_mobiles':[ '1862001'+str(random.choice(range(1000,9999)))\
                                    for i  in range(3,10)],
            'saler_cnt': random.choice(range(2,10)),
            'sales_date': str(random.choice(range(20180421,20180430))),
            'remark': u'这是 this isremark',
                } 
        print plan
        return plan

    def test_add_plan(self):
        plan = self.get_random_plan()
        self.assertTrue(plansvc.add_plan(plan))


    def test_update(self):
        plan = self.get_random_plan()
        plan_id =  plansvc.add_plan(plan)
        self.assertIsNotNone(plan_id)
        update = {'plan_id': plan_id}
        update.update(plan)
        update['status'] = 4
        self.assertTrue(plansvc.update_plan(update)) 




if __name__ =='__main__':
    unittest.main()
