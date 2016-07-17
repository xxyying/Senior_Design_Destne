#!/bin/bash
#############################################################################
#			This script will kill all process related to nfacctd/pmacct           #
#			Author: Mackenzie Dougherty              				                      #
#			Date: 04/03/16                    								                    #
#			Version: 1.0                 								                          #
#			Changelog:                                                            #
#			filename: killpmacct.sh       									                      #
#############################################################################

#Check if nfacctd is running
if pgrep "nfacctd" > /dev/null
then
  sudo pkill -f nfacctd
  sleep 0.1s #Need delay to wait for errors
  
  #Check to make sure the process ended
  if pgrep "nfacctd" > /dev/null
  then
    echo "ERROR: Nfacctd process could not be stopped, contact an administrator"
  else
    echo "Processes have been killed"
  fi
else
  echo "ERROR: No nfacctd process running"
fi
