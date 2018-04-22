# -*- coding: utf-8 -*-
import unittest
import salersvc
import copy
import random


class UserTest(unittest.TestCase):
 
    def setUp(self):
        self.set_test_data()
        pass

    def tearDown(self):
        pass

    def get_random_saler(self):
        return {
                'mobile': str(random.random())[2:13],
                'channel_id': random.choice((1,2,3)),
                'create_user_id':'wangy1214',
                'sales_depart_id': random.choice(range(4,39)),
                'saler_name': random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ') \
                             + str(random.random())[2:5] }

    def set_test_data(self, cnt=100):
        salers = [self.get_random_saler()  for i in range(cnt)]
        results = [salersvc.add_saler(s)  for s in salers]
        self.assertTrue(reduce(lambda x,y :x and y , results))


    def test_add_saler(self):
        saler = self.get_random_saler()
        self.assertTrue(salersvc.add_saler(saler))
 


    def test_get_saler_list(self):
        salers, has_more = salersvc.get_saler_list(q='A', page_size=1)
        self.assertTrue(has_more)
        self.assertTrue(len(salers)==1)
        salers, has_more = salersvc.get_saler_list(q='A', page_size=1, page=2)
        self.assertTrue(len(salers)==1)
        salers, has_more = salersvc.get_saler_list(q='00', page_size=1, page=1)
        self.assertTrue(len(salers)==1)
        salers, has_more = salersvc.get_saler_list(channel_id=1, page_size=1, page=1)
        self.assertTrue(len(salers)==1)
        mobile = salers[0]['mobile']
        salers, has_more = salersvc.get_saler_list(mobile=mobile)
        self.assertTrue(len(salers)==1)

    def test_update_saler(self):
        u' update and deleted together in this function'
        salers, has_more = salersvc.get_saler_list(q='X', page_size=1)
        self.assertTrue(len(salers)==1)
        saler = salers[0] 
        mobile = saler['mobile']
        update = {}
        update.update(saler)
        update['update_user_id'] = 'xcp'
        update['deleted'] =  1
        self.assertTrue(salersvc.update_saler(update))
        _update, _= salersvc.get_saler_list(mobile=update['mobile'])
        self.assertTrue(len(_update)==1)
        _update = _update[0]
        keys = (  'saler_name', 'channel_id','deleted' ,
                'sales_depart_id', 'unit', 'update_user_id')
        for key in keys:
            self.assertEqual(_update[key], update[key])




if __name__ =='__main__':
    unittest.main()
