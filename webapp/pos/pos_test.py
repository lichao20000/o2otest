# -*- coding: utf-8 -*-
import unittest
import possvc
import copy



class UserTest(unittest.TestCase):


    def setUp(self):
        pass

    def tearDown(self):
        pass

    def test_get_pos(self):
        pass

    def test_get_pos_list(self):
        pos_list = possvc.get_pos_list()
        self.assertTrue(type(pos_list)==list and pos_list)
        pos_q = possvc.get_pos_list(u'a')
        self.assertTrue(len(pos_q)==3)
        pos_q = possvc.get_pos_list(u'hi')
        self.assertTrue(len(pos_q)==1)
        pos_q = possvc.get_pos_list(u'啦啦')
        self.assertTrue(len(pos_q)==1)
        pos_id = possvc.get_pos_list(pos_id=pos_q[0]['pos_id'])
        self.assertTrue(len(pos_id)==1)
        pos_id = possvc.get_pos_list(channel_id=pos_q[0]['channel_id'])
        self.assertTrue(len(pos_id)>=1)
        pos_id = possvc.get_pos_list(sales_depart_id=pos_q[0]['sales_depart_id'])
        self.assertTrue(len(pos_id)>=1)

    def test_add_pos(self):
        pos = dict( pos_type = u'固定点1',
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
        self.assertTrue(possvc.add_pos(pos))




    def test_del_pos(self):
        pass

    def test_update_pos(self):
        pass

    def test_export_pos(self):
        pass

    def test_import_pos(self):
        pass






if __name__ =='__main__':
    unittest.main()


