# -*- coding: utf-8  -*-
import xlrd
import xlwt
import os
import sys
_dir = os.path.abspath(os.path.join(__file__, '..'))
_updir = os.path.abspath(os.path.join(_dir, '..'))
if _updir not in sys.path:
    sys.path.insert(0, _updir)
import xlsxwriter

def excel_reader(file_path=None , book =None):
    w_book = None
    result, rows = False, []
    try:
        if file_path:
            w_book = xlrd.open_workbook(file_path)
        if book:
            w_book = book
        table = book.sheets()[0]          
        nrows = table.nrows
        ncols = table.ncols
        for i in range(nrows ):
            rows.append(table.row_values(i))
        result = True
    except Exception,e :
        print e
    return result , rows

def excel_write(file_name, rows, headers=None, sheet_name='sheet1'):
    # headers = [('display_col': 'col_val_in_row_key')]
    # if  headers  not none , headers'items  should be  containered
    # by the item in the  rows  as the key
    # if headers is none the display col is key
    try:
        if type(file_name) in (str, unicode):
            path, fname = os.path.split(file_name)
            if not path:
                path = _dir
                file_name=os.path.join(path, fname).encode('utf-8')
        workbook = xlsxwriter.Workbook(file_name)
        worksheet=workbook.add_worksheet()
        if not headers:
            headers = []
            for row in rows:
                for key in row:
                    if key not in headers:
                        headers.append(key)
            headers = [(h, h) for h in headers]
        for i, h in enumerate(headers):
            worksheet.write(0, i, h[0])
        for row_num, r in enumerate(rows):
            for col_num, h in enumerate(headers):
                val = r.get(h[1],'')
                worksheet.write(row_num+1, col_num, val)
        workbook.close()
        return True
    except Exception,e:
        print e
        return False


            




def test():
    import config 
    import pg_helper as pg
    conn = pg.connect(**config.pg_main)
    cur = conn.cursor()
    cur.execute('select *from t_sales_depart')
    rows = pg.fetchall(cur)
    excel_write('fuck.xls',rows) 
                                            

if __name__ == '__main__':
    test()

