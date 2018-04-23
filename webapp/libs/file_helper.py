# -*- coding: utf-8  -*-


import xlrd

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


