#!/bin/bash
#############################################################################
#			This script will start a nfacctd process according to                 #
#     mysql-nfacctd.conf in the same directory                              #
#			Author: Mackenzie Dougherty              				                      #
#			Date: 04/03/16                    								                    #
#			Version: 1.0                 								                          #
#			Changelog:                                                            #
#			filename: killpmacct.sh       									                      #
#############################################################################

#Check if nfacctd is running
if pgrep "nfacctd" > /dev/null
then
  echo "ERROR: Nfacctd process already running"
else
  sudo /usr/local/sbin/nfacctd -d -f ../pmacct/mysql-nfacctd.conf
  sleep 0.1s #Need delay to wait for errors

  #Check to make sure the process actually started
  if pgrep "nfacctd" > /dev/null
  then
    echo "SUCCESS: Nfacctd process begun"
  else
    echo "ERROR: Nfacctd was not able to start, check the input parameters"
  fi
fi
