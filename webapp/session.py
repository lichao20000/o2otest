#-*- coding: utf-8 -*-

import os, sys

_dir = os.path.dirname(os.path.abspath(__file__))

import time
import base64
import json
import re
import hashlib
import random
import redis
import datetime
import uuid
from utils import json_dumps
from Cookie import Cookie as http_cookie
import flask
import config
import sqlite3


COOKIE_NAME = 'o2osalesssid'
DOMAIN_COOKIE_NAME = 'ztunissid'
DOMAIN = '.gz.gd.unicom.local'

def _create_redis_pool():
    if 'unix_socket' in config.session_storage['redis']:
        _path = config.session_storage['redis']['unix_socket']
        return redis.ConnectionPool(
            connection_class=redis.UnixDomainSocketConnection,
            path=_path)
    else:
        _host = config.session_storage['redis']['host']
        _port = config.session_storage['redis']['port']
        _db = config.session_storage['redis']['db']
        return redis.ConnectionPool(host=_host, port=_port, db=_db)

class SessionStorageImpdByRedis(object):

    pool = _create_redis_pool()

    def __init__(self, ttl=None):
        self.pool = self.__class__.pool
        self.conn = redis.Redis(connection_pool=self.pool)
        self.TTL = ttl or 3600 * 24 * 3 # 3 days

    def clear(self, session_id):
        self.conn.expire(session_id, 0)

    def get(self, session_id):
        if not session_id:
            return
        data = self.conn.get(session_id)
        if data:
            return json.loads(data)

    def set(self, session_id, session_dict):
        if not session_id:
            return
        if not session_dict:
            self.clear(session_id)
        data = json_dumps(session_dict)
        self.conn.set(session_id, data)
        self.conn.expire(session_id, self.TTL)

    def extend_session_ttl(self, session_id, seconds):
        ttl = self.conn.ttl(session_id)
        ttl = ttl or 0
        if ttl <= seconds:
            self.conn.expire(session_id, seconds)

    def create(self):
        rnd_str = base64.b64encode(os.urandom(128))
        session_id = hashlib.sha1(rnd_str).hexdigest()[:20]
        # now = datetime.datetime.now()
        # session_id = '%s-%s' % (now.strftime('%Y%m%d%H%M%S'), session_id)
        session = {
            '__session_id__': session_id
            }
        self.set(session_id, session)
        return session_id, session


class SessionStorageImpdBySqlite(object):

    data_dir = os.path.join(_dir, 'sessions')
    data_path = os.path.join(data_dir, 'sessions.db')

    def __init__(self, ttl=None):
        cls = self.__class__
        self.TTL = ttl or 3600 * 24 * 3 # 3 days
        if not os.path.isdir(cls.data_dir):
            os.makedirs(cls.data_dir)
        if not os.path.isfile(cls.data_path):
            # self._init_db()
            pass

    def _conn(self):
        cls = self.__class__
        conn = None
        conn = sqlite3.connect(cls.data_path)
        cur = conn.cursor()
        sql = ("select 1 from sqlite_master ",
               " where type='table' and name=? ")
        cur.execute(''.join(sql), ('t_session', ))
        if not cur.fetchone():
            sql = ('create table t_session ',
                   '( session_id text primary key, ',
                   '  session_data text, ',
                   '  last_update integer ) ',)
            cur.execute(''.join(sql))
        cur.close()
        return conn

    def clear(self, session_id):
        conn, cur = None, None
        try:
            conn = self._conn()
            cur = conn.cursor()
            sql = 'delete from t_session where session_id=?'
            cur.execute(sql, (session_id,))
            conn.commit()
        finally:
            if cur:
                cur.close()
            if conn:
                conn.close()

    def get(self, session_id):
        if not session_id:
            return
        conn, cur = None, None
        try:
            conn = self._conn()
            cur = conn.cursor()
            sql = ('select session_data ',
                   '  from t_session ',
                   ' where session_id=? ',
                   '   and last_update>=? ',)
            t = int(time.time() - self.TTL)
            cur.execute(''.join(sql), (session_id, t, ))
            row = cur.fetchone()
            if row:
                data = row[0]
                if data:
                    return json.loads(data)
        finally:
            if cur:
                cur.close()
            if conn:
                conn.close()

    def set(self, session_id, session_dict):
        if not session_id:
            return
        if not session_dict:
            self.clear(session_id)
        data = json_dumps(session_dict)
        conn, cur = None, None
        try:
            conn = self._conn()
            cur = conn.cursor()
            sql = 'select 1 from t_session where session_id=?'
            cur.execute(sql, (session_id,))
            row = cur.fetchone()
            t = int(time.time())
            if row:
                sql = ('update t_session ',
                       '   set session_data=?, last_update=? ',
                       ' where session_id=?')
                cur.execute(''.join(sql), (data, t, session_id,))
            else:
                sql = ('insert into t_session ',
                       ' (session_id, session_data, last_update) ',
                       ' values ',
                       ' (?, ?, ?) ',)
                cur.execute(''.join(sql), (session_id, data, t))
            conn.commit()
        finally:
            if cur:
                cur.close()
            if conn:
                conn.close()

    def extend_session_ttl(self, session_id, seconds):

        conn, cur = None, None
        try:
            conn = self._conn()
            cur = conn.cursor()
            t = int(time.time())
            sql = ('update t_session ',
                   '   set last_update=? ',
                   ' where session_id=?')
            cur.execute(''.join(sql), (t, session_id,))
            conn.commit()
        finally:
            if cur:
                cur.close()
            if conn:
                conn.close()

    def create(self):
        session_id = uuid.uuid1().hex
        session = {
            '__session_id__': session_id
            }
        self.set(session_id, session)
        return session_id, session


class SessionStorageImpdByFile(object):
    
    def __init__(self, ttl=None):
        _dir = os.path.dirname(os.path.abspath(__file__))
        self.folder = os.path.join(_dir, 'sessions')
        self.folder = os.path.abspath(self.folder)

    def _check_folder(self):
        if not os.access(self.folder, os.F_OK):
            os.makedirs(self.folder)

    def clear(self, session_id):
        assert session_id
        self._check_folder()
        data_path = os.path.join(self.folder, session_id)
        if os.access(data_path, os.F_OK):
            os.unlink(data_path)

    def get(self, session_id):
        assert session_id
        session = {
            '__session_id__': session_id
            }
        self._check_folder()
        data_path = os.path.join(self.folder, session_id)
        if os.access(data_path, os.F_OK):
            with open(data_path, 'rb') as f:
                _session_str = f.read()
                if _session_str:
                    session.update(json.loads(_session_str))
                f.close()
        return session

    def set(self, session_id, session_dict):
        assert len(session_id)>0
        self._check_folder()
        data_path = os.path.join(self.folder, session_id)
        if len(session_dict) >= 1:
            with open(data_path, 'wb+') as f:
                f.write(json_dumps(session_dict))
                f.close()
        else:
            if os.access(data_path, os.F_OK):
                os.unlink(data_path)

    def extend_session_ttl(self, session_id, seconds):
        pass

    def create(self):
        rnd_str = None
        session_id = None
        while True:
            rnd_str = base64.b64encode(os.urandom(128))
            session_id = hashlib.sha1(rnd_str).hexdigest()[:16]
            if not os.access(os.path.join(self.folder, session_id), 
                             os.F_OK):
                break
        return session_id, {
            '__session_id__': session_id
            }

#class SessionStorage(SessionStorageImpdByRedis): pass
#class SessionStorage(SessionStorageImpdByFile): pass



if config._debug_ and not config.session_force_use_redis:
    print  ' * Session usesqlite....'
    class SessionStorage(SessionStorageImpdBySqlite): pass
else:
    print  ' * Session user edis....'
    class SessionStorage(SessionStorageImpdByRedis): pass



class StandaloneSession(object):

    def __init__(self, session_id, ttl=None):
        self.session_id = session_id
        self.storage = SessionStorage(ttl=ttl)
        self.session = None
        if self.session_id:
            self.session = self.storage.get(self.session_id)
        if not self.session:
            self.session_id, self.session = self.storage.create()

    def has_key(self, key):
        return self.session.has_key(key)

    def __getitem__(self, key):
        return self.session[key] if key in self.session else None

    def __setitem__(self, key, val):
        self.session[key] = val

    def __contains__(self, key):
        return key in self.session

    def __iter__(self):
        for k in self.session:
            yield k

    def __delitem__(self, key):
        if key in self.session:
            del self.session[key]

    def extend_ttl(self, seconds):
        self.storage.extend_session_ttl(self.session_id, seconds)

    def save(self):
        self.storage.set(self.session_id, self.session)

    def clear(self):
        # self.storage.clear(self.session_id)
        self.session = {
            '__session_id__': self.session_id
            }

def get_raw_session(session_id, ttl=None):
    storage = SessionStorage(ttl=ttl)
    return storage.get(session_id)

def get_session(session_id, ttl=None):
    return StandaloneSession(session_id, ttl=ttl)


class SessionUser(object):

    _keys = ('user_id', 
             'user_name',
             'user_info',

             'current_section',
             'current_section_name',

             'privs',
             'admin_privs',)

    def __str__(self):
        return '<SessionUser ' \
            + ('authorized' if self.authenticated else 'unauthorized') \
            + ', ' + self.user_label \
            + '>'

    def __init__(self, session):
        self.session = session

    @property
    def session_id(self):
        return self.session.session_id

    def get_dict(self):
        return dict([(k, self[k]) for k in self.__class__._keys])

    def get_value(self, key):
        if key in self.__class__._keys:
            _key = 'user:%s' % key
            if _key in self.session:
                return self.session[_key]
            return None

    def set_value(self, key, value):
        if key in self.__class__._keys:
            _key = 'user:%s' % key
            self.session[_key] = value

    def __getattr__(self, key):
        if key in self.__class__._keys:
            return self.get_value(key)
        return super(SessionUser, self).__getattr__(key)
    
    def __setattr__(self, key, value):
        if key in self.__class__._keys:
            self.set_value(key, value)
        super(SessionUser, self).__setattr__(key, value)

    def __getitem__(self, key):
        return self.get_value(key)

    def __setitem__(self, key, value):
        self.set_value(key, value)

    def __contains__(self, key):
        return key in self.__class__._keys and key in self.session

    def clear(self):
        self.session.clear()
        self.session.save()

    # @property
    # def user_id(self):
    #     return self.user_id

    @property
    def user_label(self):
        return self.user_id if self.authenticated else u''

    @property
    def privileges(self):
        privs = []
        privs.extend(self.privs if self.privs else [])
        privs.extend(self.admin_privs if self.admin_privs else [])
        return privs

    def has(self, priv):
        return self.has_privilege(priv)

    def has_privilege(self, privilege):
        '''检查是否拥有指定的权限'''
        if not self.privileges:
            return False
        if isinstance(privilege, tuple) and len(privilege)>=2:
            return self.has_privilege(privilege[1])
        if hasattr(privilege, 'code'):
            return self.has_privilege(privilege.code)
        assert isinstance(privilege, str) or isinstance(privilege, unicode)
        return privilege in self.privileges

    @property
    def authenticated(self):
        if self.user_id: # and self.user_info:
            return True
        return False

    def save_to_session(self):
        if hasattr(self.session, 'save'):
            self.session.save()


class SessionMiddleware(object):
    
    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        # ---- no cookies for static contents ----
        request_path = environ['PATH_INFO']
        is_static = request_path.lower().startswith('/static/')
        if is_static:
            return self.app(environ, start_response)
        # ----
        ua = None
        if 'HTTP_USER_AGENT' in environ:
            ua = environ['HTTP_USER_AGENT']
        ua = ua or ''
        is_mobi = re.search(r'iphone|android', ua, re.I|re.S)
        cookies = http_cookie()
        raw_req_cookies = ''
        if environ.has_key('HTTP_COOKIE'):
            raw_req_cookies = environ['HTTP_COOKIE']
        try:
            cookies.load(raw_req_cookies)
        except Exception, e:
            print >> sys.stderr, '-'*40
            print >> sys.stderr, 'cookies load error.'
            print >> sys.stderr, e.message
        write_rssid = False # should overwrite rss-id
        ttl = 3600 * 24 * 3
        ttl_step = 60 * 30
        if is_mobi:
            ttl = 3600 * 24 * 15
            ttl_step = 3600 * 24 * 7
        # ----------------------------------------
        # Two ways to get session_id:
        #
        # (1) from cookies
        cookie_names = (DOMAIN_COOKIE_NAME, COOKIE_NAME,)
        session_id = None
        for name in cookie_names:
            if cookies.has_key(name):
                session_id = cookies[name].coded_value
                if session_id:
                    break
        # (2) from header "x-session-id"
        if not session_id:
            checking = ('x_session_id', 'http_x_session_id',)
            hkeys = dict([(k.lower(), k) for k in environ.keys()])
            for k in checking:
                if k in hkeys:
                    session_id = environ[hkeys[k]]
                    if session_id:
                        break
        # ----------------------------------------
        if session_id:
            session = get_session(session_id, ttl=ttl)
            if session_id != session.session_id:
                session_id = session.session_id
                write_rssid = True
            environ['session'] = session
        else:
            session = get_session(None, ttl=ttl)
            session_id = session.session_id
            environ['session'] = session
            write_rssid = True
        # extend the ttl of session
        session.extend_ttl(ttl_step)
        environ['user'] = SessionUser(session)
        def _start_response(status, headers, exc_info=None):
            if write_rssid:
                max_age = int(ttl * 1.5)
                # --
                rssid_str = '%s=%s; path=/; max-age=%d; httponly' % (
                    COOKIE_NAME, session_id, max_age)
                headers.append(('set-cookie', rssid_str))
                # --
               # domain = 'gz.gd.unicom.local'#'.zootopia.unicom.local'
               # dssid_str = '%s=%s; path=/; max-age=%d; domain=%s; httponly'
               # dssid_str = dssid_str % (
               #     DOMAIN_COOKIE_NAME, session_id, max_age, domain)
               # headers.append(('set-cookie', dssid_str))
               # # --
               # domain = '.sit.zootopia.unicom.local'
               # dssid_str = '%s=%s; path=/; max-age=%d; domain=%s; httponly'
               # dssid_str = dssid_str % (
               #     DOMAIN_COOKIE_NAME, session_id, max_age, domain)
               # headers.append(('set-cookie', dssid_str))
            return start_response(status, headers)
        return self.app(environ, _start_response)



