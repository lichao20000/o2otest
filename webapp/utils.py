#-*- coding: utf-8 -*-

import os
import re
import datetime
import random
import math
import json
from decimal import Decimal

try:
    import xlrd
except ImportError:
    xlrd = None


class CommonJSONEncoder(json.JSONEncoder):
    
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            return obj.strftime('%Y-%m-%d %H:%M:%S')
        if isinstance(obj, datetime.date):
            return obj.strftime('%Y-%m-%d')
        if isinstance(obj, Decimal):
            return float(obj)
        if isinstance(obj, JSONObject):
            return obj.json_object();
        if hasattr(obj, '__json__'):
            return obj.__json__()
        return json.JSONEncoder.default(self, obj);


class JSONObject(object):
    
    def json_object(self):
        raise NotImplementedError('json_object')


def json_dumps(objects):
    return json.dumps(objects, cls=CommonJSONEncoder)

def allowed_file(filename):
    if not filename:
        return
    _, ext = os.path.splitext(filename.lower())
    return ext in ('.jpg', '.png',)

def mask_mobile(mobi):
    pt = r'^(\d+)\d{4}(\d)$'
    masked = re.sub(pt, r'\1****\2', mobi, re.I|re.S)
    return masked

def to_utf8(obj, encoding='utf-8'):
    if isinstance(obj, str):
        return obj.decode(encoding)
    return obj

def to_utf8_dict(d, encoding='utf-8'):
    assert hasattr(d, 'iteritems')
    return dict([(k, to_utf8(v, encoding=encoding)) \
                     for k, v in d.iteritems()])

def is_nan(a):
    return (isinstance(a, float) and math.isnan(a)) or a!=a

def _float(text):
    if not text:
        return 0.0
    if isinstance(text, Decimal):
        return float(text)
    if isinstance(text, float) or isinstance(text, int):
        return text
    if re.match(r'^(?:[-+])?\d+(?:\.\d+)?$', text):
        return float(text)
    return 0.0

def _int(text):
    if not text:
        return 0
    if isinstance(text, Decimal):
        return int(text)
    if isinstance(text, int):
        return text
    if re.match(r'^(?:[-+])?\d+$', text):
        return int(text)
    return 0

def _int_default(text,default=None):
    try:
        return int(text)
    except:
        return default

def _date(text):
    u'''dirty but works great'''
    pt_date_1 = r'^(?P<y>\d{4})(?P<mon>\d{2})(?P<d>\d{2})'
    pt_date_2 = r'^(?P<y>\d{4})[./-](?P<mon>\d{1,2})[./-](?P<d>\d{1,2})'
    pt_time = r'(?P<hh>\d+)\:(?P<mm>\d+)\:(?P<ss>\d+)'
    pts = (pt_date_2 + r'\s+' + pt_time,
           pt_date_2,
           pt_date_1,
           )
    for pt in pts:
        m = re.search(pt, text, re.I|re.S)
        if m:
            _m = m.groupdict()
            if 'y' in _m:
                y = int(_m['y'])
                mon = int(_m['mon'])
                d = int(_m['d'])
                if 'hh' in _m:
                    hh = int(_m['hh'])
                    mm = int(_m['mm'])
                    ss = int(_m['ss'])
                    return datetime.datetime(y, mon, d, hh, mm, ss)
                else:
                    return datetime.datetime(y, mon, d, 0, 0, 0)
    pt_yyyymm = r'^(?P<y>\d{4})(?P<mon>\d{2})$'
    m = re.search(pt_yyyymm, text, re.I|re.S)
    if m:
        _m = m.groupdict()
        y, mon = int(_m['y']), int(_m['mon'])
        return datetime.datetime(y, mon, 1, 0, 0, 0)

def _xls_text(v):
    if not v:
        return v
    if isinstance(v, str) or isinstance(v, unicode):
        pt = r'^\d+(?:\.0+)$'
        if re.search(pt, v):
            pt = r'\.0+$'
            return re.sub(pt, '', v)
    if isinstance(v, float):
        return _xls_text('%s' % v)
    elif isinstance(v, int) or isinstance(v, long):
        return '%s' % v
    return v

def open_excel(filepath, all_sheets=True):
    if not os.path.isfile(filepath):
        return
    book = xlrd.open_workbook(filepath)
    sheets = book.sheets()
    if len(sheets) <= 0:
        return
    for sheet in sheets:
        for i in xrange(0, sheet.nrows):
            row = sheet.row(i)
            yield i, [_xls_text(c.value) for c in row]
        if not all_sheets:
            break

def read_iter(file_path):
    _, ext = os.path.splitext(file_path.lower())
    if ext == '.xls':
        for i, row in open_excel(file_path, all_sheets=False):
            yield i, row
    else:
        for i, row in open_csv(file_path):
            yield i, row

class Counter(object):

    def __init__(self, items_it):
        self.d = {}
        for item in items_it:
            if item not in self.d:
                self.d[item] = 1
            else:
                self.d[item] += 1

    def keys(self):
        return self.d.keys()

    def values(self):
        return self.d.values()

    def __getitem__(self, key):
        return self.d[key]

    def __iter__(self):
        for k in self.d:
            yield k

    def __repr__(self):
        return repr(self.d)


if __name__ == '__main__':
    print _date('2014/5/22')
    print _date('2014-05-22')
    print _date('20140522')
    print _date('2014522')
    print _date('2014/5/22 22:36:04')
    for i, row in open_excel(r'd:\201312.xlsx'):
        print i, row
        break
    c = Counter([1,2,3,3,4,1,2,2,2])
    print c
