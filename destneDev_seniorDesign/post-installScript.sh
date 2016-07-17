#!/bin/bash
echo "Starting install script, make sure you are connected to the internet and remain at the computer to go through the various prompts that will arise..."

echo "Updating System"
#PPAs
sudo add-apt-repository ppa:webupd8team/atom

#System Updates
sudo apt-get update -y &&
sudo apt-get upgrade -y

#INSTALL
MySQL
echo "Installing MySQL"
sudo apt-get install mysql-server -y &&
sudo mysql_secure_installation &&
sudo apt-get install mysql-workbench -y

#Atom.io
echo "Install Atom Editor"
sudo apt-get install atom &&
apm install linter linter-jshint linter-jscs

#Python
echo "Updating Python 2.7"
sudo apt-get install python-dev -y &&
sudo apt-get install python-pip -y &&
sudo apt-get install libmysqlclient-dev libffi-dev -y &&
sudo pip install bcrypt MySQL-python

#Node.js
echo "Installing Node JS and related packages"
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash &&
sudo apt-get install -y nodejs &&
sudo apt-get install -y build-essential &&
sudo ln -s /usr/bin/nodejs /usr/bin/node &&
sudo npm install -g nodemon requiresafe

#Ruby
echo "Installing RVM and Ruby >2.0"
sudo gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 &&
curl -sSL https://get.rvm.io | bash -s stable --rails
source /usr/local/rvm/scripts/rvm

#Git and Repos
echo "Installing Git and setting up Repos"
sudo apt-get install git -y &&
git config --global user.email mldoughe@ncsu.edu &&
git config --global user.name "Mackenzie Dougherty" &&
mkdir ~/destneProj &&
cd ~/destneProj &&
echo -n | openssl s_client -showcerts -connect github.ncsu.edu:443 2>/dev/null | sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' | sudo tee -a /usr/local/share/ca-certificates/ncsuGit.crt &&
sudo update-ca-certificates &&
git clone https://github.ncsu.edu/mldoughe/destneDev.git &&
git clone https://github.ncsu.edu/mldoughe/APIDoc.git &&

#Setup destneDev
echo "Setting up destneDev"
cd ~/destneProj/destneDev/serverDev &&
sudo npm install &&
cd ~/destneProj/destneDev/serverDev/conf &&
make decrypt_conf &&
make generate_key_dev
cd ~/destneProj/destneDev/ &&
echo "Creating MySQL Database" &&
mysql -u root -p < backup.sql

#Setup APIDoc
echo "Setting up APIDoc"
cd ~/destneProj/APIDoc &&
gem install bundler &&
bundle install &&
./deploy.sh

#PMACCT
cd
sudo apt-get install -y libpcap-dev
wget http://www.pmacct.net/pmacct-1.5.3.tar.gz &&
tar -xzvf pmacct* &&
rm pmacct*.tar.gz &&
cd ~/pmacct* &&
./configure --enable-mysql &&
make &&
make install

#Random
echo "Installing miscellaneous packages" && cd
sudo apt-get install hydra -y

#Install Google Chrome
if [[ $(getconf LONG_BIT) = '64' ]]
then
	echo "Installing 64-bit Google Chrome" &&
	wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb &&
	sudo dpkg -i google-chrome-stable_current_amd64.deb
else
	echo "Installing 32-bit Google Chrome" &&
	wget https://dl.google.com/linux/direct/google-chrome-stable_current_i386.deb &&
	sudo dpkg -i google-chrome-stable_current_i386.deb
fi

#UNINSTALL
echo "Uninstalling extra packages"
sudo apt-get remove -y --purge libreoffice* &&
sudo apt-get purge -y firefox &&
sudo rm -r /etc/firefox/ &&
sudo rm -r /usr/lib/firefox &&
sudo rm -r /usr/lib/firefox-addons

#NETWORK
echo "Changing management of eth0 outside of network-manager"
sudo stop network-manager &&
sudo printf '\n%s\n%s\n%s\n%s\n%s\n%s\n%s\n%s\n%s\n' 'auto eth0' 'iface eth0 inet dhcp' '#address' '#netmask' '#network' '#gateway' '#dns-nameservers' | sudo tee -a /etc/network/interfaces &&
sudo ifdown eth0 && sudo ifup eth0

#Cleanup
echo "Cleaning up" &&
sudo apt-get -f -y install &&
sudo apt-get autoremove &&
sudo apt-get -y autoclean && 
sudo apt-get -y clean

#Remove
rm -f google-chrome-stable_current_*

#Settings
echo "Customizing Settings"
gsettings set com.canonical.Unity.Launcher favorites "['application://ubiquity.desktop', 'application://google-chrome.desktop', 'application://mysql-workbench.desktop', 'application://nautilus.desktop', 'application://atom.desktop', 'unity://running-apps', 'unity://expo-icon', 'unity://devices']"
gsettings set com.canonical.Unity.Lenses disabled-scopes "['more_suggestions-amazon.scope', 'more_suggestions-u1ms.scope', 'more_suggestions-populartracks.scope', 'music-musicstore.scope', 'more_suggestions-ebay.scope', 'more_suggestions-ubuntushop.scope', 'more_suggestions-skimlinks.scope']"

echo "Rebooting system"
sudo reboot
