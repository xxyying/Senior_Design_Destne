#!/bin/bash
#############################################################################
#			This script takes in the collector IP address                         #
#			and the exporter UDP port. The script    will                         #
#			then edit the corresponding fields in    path                         #
#			/root/destne/mysql-nfacctd.conf.                                      #
#			Author: Ben Sealy (destne)              				                      #
#     Editor: Mackenzie Dougherty                                           #
#			Date: 04/02/16                    								                    #
#			Version: 2.0                 								                          #
#			Changelog: Added the ability to change the sql host address,          #
#     database name, username, and password				                          #
#			filename: mysqlconfig.sh       									                      #
#############################################################################

SCRIPTPATH=$( cd $(dirname $0) ; pwd -P )

if [ -z $1,$2,$3,$4,$5,$6 ]
        then
                exporterIP="*** ERROR ***"
                exporterUDP="*** ERROR ***"
                sqlAddress="*** ERROR ***"
                sqlDatabase="*** ERROR ***"
                sqlUsername="*** ERROR ***"
                sqlPassword="*** ERROR ***"
elif [ -n $1,$2,$3,$4,$5,$6 ]
        then
                exporterIP=$1
                exporterUDP=$2
                sqlAddress=$3
                sqlDatabase=$4
                sqlUsername=$5
                sqlPassword=$6
fi

case $exporterIP in
"") ;;
*) sudo sed -i 's/^nfacctd_ip:.*/nfacctd_ip: '$exporterIP'/g' $SCRIPTPATH/mysql-nfacctd.conf;;
esac

case $exporterUDP in
"") ;;
*) sudo sed -i 's/^nfacctd_port:.*/nfacctd_port: '$exporterUDP'/g' $SCRIPTPATH/mysql-nfacctd.conf;;
esac

case $sqlAddress in
"") ;;
*) sudo sed -i 's/^sql_host:.*/sql_host: '$sqlAddress'/g' $SCRIPTPATH/mysql-nfacctd.conf;;
esac

case $sqlDatabase in
"") ;;
*) sudo sed -i 's/^sql_db:.*/sql_db: '$sqlDatabase'/g' $SCRIPTPATH/mysql-nfacctd.conf;;
esac

case $sqlUsername in
"") ;;
*) sudo sed -i 's/^sql_user:.*/sql_user: '$sqlUsername'/g' $SCRIPTPATH/mysql-nfacctd.conf;;
esac

case $sqlPassword in
"") ;;
*) sudo sed -i 's/^sql_passwd:.*/sql_passwd: '$sqlPassword'/g' $SCRIPTPATH/mysql-nfacctd.conf;;
esac

#END
