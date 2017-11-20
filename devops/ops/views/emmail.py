#/usr/bin/python env
#-*- coding=utf8 -*-
import os,sys
reload(sys)
sys.setdefaultencoding("utf-8")
import poplib
import email
from email.parser import Parser
from email.header import decode_header
from email.utils import parseaddr
import re

def guess_charset(msg):
    charset = msg.get_charset()
    if charset is None:
        content_type = msg.get('Content-Type', '').lower()
        pos = content_type.find('charset=')
        if pos >= 0:
            charset = content_type[pos + 8:].strip()
    return charset

def decode_str(s):
    value, charset = decode_header(s)[0]
    if charset:
        value = value.decode(charset)
    return value

def print_info(msg, indent=0):
    if indent == 0:
        for header in ['From', 'To','Cc', 'Subject']:
            value = msg.get(header, '')
            if value:
                if header=='Subject':
                    value = decode_str(value)
                else:
                    hdr, addr = parseaddr(value)
                    name = decode_str(hdr)
                    value = u'%s <%s>' % (name, addr)
            print('%s%s: %s' % ('  ' * indent, header, value))
    if (msg.is_multipart()):
        parts = msg.get_payload()
        for n, part in enumerate(parts):
		#print('%spart %s' % ( indent, n))
       		#print('%s' % (indent))
       		print_info(part, indent + 1)

    else:
        content_type = msg.get_content_type()
        if content_type=='text/plain' or content_type=='text/html':
            content = msg.get_payload(decode=True)
            charset = guess_charset(msg)
            if charset:
                content = content.decode(charset)
	    a = content.split('<div')[0]
	    b = a.replace('-','')
	    print b

def GetMiddleStr(msg,startStr,endStr):
  startIndex = msg.index(startStr)
  if startIndex>=0:
    startIndex += len(startStr)
  endIndex = msg.index(endStr)
  return msg[startIndex:endIndex]

if __name__ == "__main__":
     pop3_server = 'pop.sina.com'
     if len(sys.argv) > 1:
         email = sys.argv[1]
         password=sys.argv[2]
     else:
         email = 'w1p1j1@sina.com'
         password = 'jinjin123'

     server = poplib.POP3(pop3_server)
     server.user(email)
     server.pass_(password)
    #  print('第%s:条. Size: %s' % server.stat())
     resp, mails, octets = server.list()
     resp, lines, octets = server.retr(len(mails))
    #  resp, lines, octets = server.retr(1794)
     msg = Parser().parsestr('\r\n'.join(lines))
     print_info(msg)
     server.quit()
