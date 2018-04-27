#-*- coding: utf-8 -*-

import psycopg2 as pg



def to_utf8(obj, encoding='utf-8'):
    if isinstance(obj, str):
        return obj.decode(encoding)
    return obj

def _to_utf8_row(row, encoding='utf-8'):
    return [to_utf8(v, encoding=encoding) for v in row]

def fetchall(cur, encoding='utf-8'):
    keys = map(lambda k: k[0].lower(), cur.description)
    rows = cur.fetchall()
    rows = map(lambda row: \
                   dict(zip(_to_utf8_row(keys, encoding), _to_utf8_row(row, encoding=encoding))), rows)
    return rows


class _WrappedCursor(pg._psycopg.cursor):

    def __init__(self, *args, **kargs):
        super(_WrappedCursor, self).__init__(*args, **kargs)

    def __enter__(self):
        return self

    def __exit__(self, t, v, tb):
        self.close()


def get_conn_class(schema):

    class _WrappedConn(pg._psycopg.connection):

        def __init__(self, *args, **kargs):
            self.schema= schema
            super(_WrappedConn, self).__init__(*args,**kargs)

        def __enter__(self):
            return self

        def __exit__(self, t, v, tb):
            self.close()

        def cursor(self, *args, **kargs):
            kargs['cursor_factory'] = _WrappedCursor
            cur = super(_WrappedConn, self).cursor(*args, **kargs)
            if self.schema:
                cur.execute("set search_path to %s" %(self.schema,))
            return cur
    return _WrappedConn

    


def connect(**kargs):
    schema = kargs.get('schema')
    _kargs = {}
    _kargs.update(kargs)
    if 'schema' in _kargs:
        del _kargs['schema']
    _kargs['connection_factory'] = get_conn_class(schema)
    conn = pg.connect(**_kargs)
    return conn


if __name__ == '__main__':
    profile = {
        'host': '10.210.24.242',
        'user': 'gapp',
        'password': '',
        'database': 'gis_sub_app',
        'port': 5432
        }
    # with connect(**profile) as conn, conn.cursor() as cur:
    # # with connect(**profile) as conn:
    #     raise Exception('abort.')
    #     print conn
    #     print cur
    #     print 'do something.'
