#!/bin/bash
#############################################################################
#                       This script takes in the testing state [0 | 1]                  #
#                       The script will start or stop the destne collector                              #
#                       action.                                                                                                 #
#                                                                                                                                   #
#                                                                                                                       #
#                       Author: Ben Sealy (destne)                                                      #
#                       Editor: Bradford Ingersoll (destne)
#                               Mackenzie Dougherty (destne)
#                       Date: 03/22/15                                                                                  #
#                       Version: 2.0                                                                               #
#                       Changelog:
#                         2.0 - Changed script to work with Ubuntu 14.04 (03/03/16)                                                                                  #
#                       filename: change_ip.sh                                                                          #
#                       Variables: change state, ipaddress, netmask, network, gateway   #
#                       FQDN, nameserver1, nameserver2                                                                  #
#############################################################################

#test static to static : ./change_network.sh static 176.122.10.12 255.255.255.0 176.122.10.0 176.122.10.1 8.8.8.8 8.8.4.4
if [ -z $1,$2,$3,$4,$5,$6,$7 ]
        then
                state=
                ipaddress=
                netmask=
                network=
                gateway=
                nameserver1=
                nameserver2=

elif [ -n $1,$2,$3,$4,$5,$6,$7 ]
        then
                state=$1
                ipaddress=$2
                netmask=$3
                network=$4
                gateway=$5
                nameserver1=$6
                nameserver2=$7
fi

#Stop network interface
sudo ifdown eth0

case $state in
"static")

#STATIC /etc/network/interfaces
sudo sed -i 's/^iface eth0 inet.*/iface eth0 inet static/' /etc/network/interfaces
sudo sed -i '0,/^[ \t]*address/s/^[ \t]*#\?address.*/  address '$ipaddress'/' /etc/network/interfaces
sudo sed -i '0,/^[ \t]*netmask/s/^[ \t]*#\?netmask.*/  netmask '$netmask'/' /etc/network/interfaces
sudo sed -i '0,/^[ \t]*network/s/^[ \t]*#\?network.*/  network '$network'/' /etc/network/interfaces
sudo sed -i '0,/^[ \t]*gateway/s/^[ \t]*#\?gateway.*/  gateway '$gateway'/' /etc/network/interfaces
sudo sed -i '0,/^[ \t]*dns-nameservers/s/^[ \t]*#\?dns-nameservers.*/  dns-nameservers '$nameserver1' '$nameserver2'/' /etc/network/interfaces

;;
"dhcp")
#DHCP /etc/network/interfaces
sudo sed -i 's/^iface eth0 inet.*/iface eth0 inet dhcp/' /etc/network/interfaces
sudo sed -i '0,/^[ \t]*address/s/^[ \t]*address.*/#address /' /etc/network/interfaces
sudo sed -i '0,/^[ \t]*netmask/s/^[ \t]*netmask.*/#netmask /' /etc/network/interfaces
sudo sed -i '0,/^[ \t]*network/s/^[ \t]*network.*/#network /' /etc/network/interfaces
sudo sed -i '0,/^[ \t]*gateway/s/^[ \t]*gateway.*/#gateway /' /etc/network/interfaces
sudo sed -i '0,/^[ \t]*dns-nameservers/s/^[ \t]*dns-nameservers.*/#dns-nameservers /' /etc/network/interfaces
;;
esac

echo "Restarting Network......"
sudo ifup eth0
echo "Finished!"
