# -*- coding: utf-8 -*-
import unittest
import usersvc
import copy



class UserTest(unittest.TestCase):


    def setUp(self):
        pass

    def tearDown(self):
        pass


    def test_get_channels(self):
        channels = usersvc.get_channels()
        self.assertTrue(type(channels), list)

    def test_get_sales_departs(self):
        channels = usersvc.get_channels()
        for ch in channels:
            departs = usersvc.get_sales_departs(ch['channel_id'])
            self.assertTrue(type(departs), list)



    def test_set_user_base_info(self):
        user_info = {
                'user_id' : 'wangy1214',
                'user_name': u'汪阳',
                'mobile': '18620011607' }
        result = usersvc.set_user_base_info(user_info)
        self.assertTrue(result)
        update_info = copy.deepcopy(user_info) 
        update_info['mobile'] = '1862000000'
        result = usersvc.set_user_base_info(update_info)
        self.assertTrue(result)
        info = usersvc.get_user_local_info(update_info['user_id'])
        self.assertEqual(update_info['mobile'], info['mobile'])
        result = usersvc.set_user_base_info(user_info) 
        self.assertTrue(result)


    def test_get_local_user_info(self):
        wy_info= usersvc.get_user_local_info('wangy1214')
        self.assertIsNotNone(wy_info)
        print wy_info

    def test_set_user_sales_info(self):
        r = usersvc.set_user_sales_info('xiecp', 1, 2, 'wangy1214')
        self.assertTrue(r)
        r = usersvc.set_user_sales_info('wangy1214', 1, 1)
        self.assertTrue(r)

    def test_set_user_privs(self):
        all_privs = usersvc.get_all_privs()
        _privs = [p['priv'] for p in all_privs]
        r = usersvc.set_user_privs('wangy1214', _privs  )
        self.assertTrue(r)
        self.assertIsNone(usersvc.get_user_privs('not_exist_user'))
        db_privs = usersvc.get_user_privs('wangy1214') 

         




if __name__ =='__main__':
    unittest.main()
