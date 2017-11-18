# -*- coding: utf-8 -*-
import os,sys
reload(sys)
sys.setdefaultencoding('utf-8')
import xlrd,xlwt,requests,json
from datetime import date,datetime,time
from ops.models import  Assets,HostInfo

### 从第几行开始
def handle_excel_file(File):
    store = []
    # obj = xlrd.open_workbook('/Users/wupeijin/code3/django-tornado/upload/server_excel/a.xlsx')
    obj = xlrd.open_workbook(File)
    table = obj.sheet_by_index(0)
    nrows = table.nrows ### 行
    ncols = table.ncols ##列
    api = 'http://localhost:8080/api/server/'

    for row in range(1,nrows):
        #print row get the  one line data not column
        ### each column
        for x in range(0,ncols):
            cell = table.cell(row,x).value
            h1=table.cell(0,x).value
            h2=table.cell(1,x).value
            ctype=table.cell(row,x).ctype
            #print str(table.cell(row,x).value)
            if ctype==1:
                #print h1+h2+":"+cell
                #a = u'%s%s%s %s'%(h1,h2,':',str(cell))
                a = u'%s'%(cell)
                #print a
            elif ctype==3:
                d=datetime(*xlrd.xldate_as_tuple(cell,0))
                #a = u'%s%s %s%s' %(h1,h2,':',d.strftime("%Y-%m-%d"))
                a = u'%s' %(d.strftime("%Y-%m-%d"))
                #print a
                #print h1+h2+":"+d.strftime("%Y-%m-%d")
            else:
                #a = u'%s%s%s %s'%(h1,h2,':',str(cell))
                a = u'%s'%(str(int(cell)))
                #print a
                #print h1+h2+":"+str(cell)

            store.append(a)
        # print store
        assets = {
            "assets_type":store[0],
            "name":store[1],
            "sn": store[2],
            "buy_time": store[3],
            "expire_date":store[4],
            "buy_user": store[5],
            "management_ip": store[6],
            "manufacturer":store[7],
            "model":store[8],
            "provider": store[9],
            "status":int(store[10]),
            "put_zone":int(store[11]),
            "group": int(store[12]),
            "business":int(store[13])
        }
        assets_data = {
            "assets":assets,
            "ip":store[14],
            "port":int(store[15]),
            "group": store[16],
            "user": store[17],
            "login_type":store[18],
            "key":store[19],
            "pwd":store[20],
            "us_sudo":store[21],
            "us_su":store[22],
            "sudo":store[23],
            "su":store[24],
            "alive": store[25],
            "bz":store[26]
        }
        # # headers = {'content-type': 'application/json',"X-CSRFToken":"YBujOEghKFEmUEUyyQhvm6skf2UK0uLk"}
        assets_obj = Assets.objects.create(**assets)
        assets_data['assets'] = assets_obj
        HostInfo.objects.create(**assets_data)
        # # data = {}
        # # data['data'] = assets_data
        # # print json.dumps({'data':assets_data})
        # # res = requests.post(api, headers=headers,  data=json.dumps({'data':assets_data}))
        # # print aa
        store=[]
        # res = requests.post(api, headers=headers,  data=assets_data,verify=False)

    # return res
if __name__ == "__main__":
    handle_excel()
