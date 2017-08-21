#!/usr/bin/python
#coding: utf-8
from subprocess import check_output
import re,sys
def test():
	cmd = './checkcontainer %s'%(sys.argv[1])
	a = check_output(cmd,shell=True)
	b = re.split('(is ' ')',a)[2].strip('\n')
	print b
	if  b == 'alive':
		print 'aaa'
	else:
		print 'sb'

test()
