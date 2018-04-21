# -*- coding: utf-8 -*-
import unittest
import possvc
import copy
import random


class UserTest(unittest.TestCase):
 
    def setUp(self):
        pass

    def tearDown(self):
        pass

    def test_get_pos(self):
        pass

    def get_new_pos(self):
        new_pos = dict( pos_type = u'固定点'+str(random.random())[2:5],
            sales_id = 'G220',
            pos_name = 'whf',
            pos_address = u'火星库尔地区火山口',
            channel_id  =  2,
            sales_depart_id = 14,
            #pos_unit = None,
            #pos_code = None
            #eo_data
            #deleted
            #update_time
            #create_time
            #update_user_id

            create_user_id = 'wangy1214' )
        return new_pos

    def test_get_pos_list(self):
        pos_list = possvc.get_pos_list()
        self.assertTrue(type(pos_list)==list and pos_list)
        pos_q = possvc.get_pos_list(u'hi ')
        self.assertTrue(len(pos_q)==1)
        pos_q = possvc.get_pos_list(u'啦啦')
        self.assertTrue(len(pos_q)==1)
        pos_id = possvc.get_pos_list(pos_id=pos_q[0]['pos_id'])
        self.assertTrue(len(pos_id)==1)
        pos_id = possvc.get_pos_list(channel_id=pos_q[0]['channel_id'])
        self.assertTrue(len(pos_id)>=1)
        pos_id = possvc.get_pos_list(sales_depart_id=pos_q[0]['sales_depart_id'])
        self.assertTrue(len(pos_id)>=1)
        pos_del = possvc.get_pos_list(deleted = 0)
        self.assertTrue(len(pos_del)>=1)

    def test_add_pos(self):
        pos = self.get_new_pos()
        pos_id = possvc.add_pos(pos)
        self.assertIsNotNone(pos_id)
        pos_del = possvc.get_pos_list(pos_id=pos_id,deleted=1)
        self.assertTrue(len(pos_del)==0)
        pos_del = possvc.get_pos_list(pos_id=pos_id,deleted=0)
        self.assertTrue(len(pos_del)==1)
        self.assertTrue(possvc.del_pos(pos_id))
        self.assertFalse(possvc.del_pos(pos_id))
        pos_del = possvc.get_pos_list(pos_id=pos_id,deleted=1)
        self.assertTrue(len(pos_del)==1)
        pos_del = possvc.get_pos_list(pos_id=pos_id,deleted=0)
        self.assertTrue(len(pos_del)==0)


    def test_del_pos(self):
        pass

    def test_update_pos(self):
        pos = self.get_new_pos()
        pos_id = possvc.add_pos(pos)
        self.assertIsNotNone(pos_id)
        pos_info = {
                'pos_id': pos_id,
                'wtf':'wtf',
                'pos_name':'this is update pos_name'
                }
        self.assertTrue(possvc.update_pos(pos_info))
        self.assertTrue(possvc.del_pos(pos_id))



    def test_export_pos(self):
        pass

    def test_import_pos(self):
        pass






if __name__ =='__main__':
    unittest.main()


