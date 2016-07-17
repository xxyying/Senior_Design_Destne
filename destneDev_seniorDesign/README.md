# destne

##Overview
***
This codebase is for destne, a network visualiztion tool that processes information from a MySQL database and converts it to visual analytics. Specifially the information is collected using Cisco NetFlow on an edge router, classified using NBAR and then stored in the MySQL database using [PMACCT](http://www.pmacct.net/). Once collected and classified, destne runs custom analytics which can be accessed via a RESTful API and then converted to a visualization platform of your choosing. In this codebase is a client and server packaged together however only the server is needed to use the API.

##Installation Steps
***
To start using destne you will need Node v4.x on your system as well as the Node Package Manager (NPM) and MySQL. It is also helpful to have the programs listed in the post-installscript.sh in the base directory but not required. Once Node is on your system follow these simple steps:

1. Clone the repository onto your local system
2. Navigate into the 'serverDev/conf' folder and run 'make decrypt_conf' (Note you will need a password that should be known)
3. Navigate into the 'severDev/conf' folder and run 'make generate_key_dev'
4. Navigate into the 'serverDev' folder and run 'npm install' to get all the local packages
5. Navigate to the base directory and import the sql file using 'mysql -u root -p < backup.sql' (modifying the username as necessary)
6. Navigate to the 'serverDev/conf' directory and edit the settings.json file with your MySQL username, password, hostname, etc. to reflect any changes made from the default
7. In the serverDev folder run 'sudo node index.js'
8. destne should now have started and the API is accessible at (https://localhost:8443/api/v1/) and the client at (https://localhost:8443/auth)
9. To use the API you must authenticate by doing a POST request at (https://localhost:8443/auth), more information is in the API Documentation

##API
***
The API has a full documenation guide in another repo and requies Ruby >= v2.0 to run. It has routes for authentication, analytics, device management, collector management, and finally user management. It can be used with other applications to leverage the destne collection platform and uses token-based authentication and role based access (Administrator and User roles).

##Client
***
The client is a visulization platform for destne. The main analytics page requires users to authenticate but shows graphs based on application summaries, average packet size, bytes per hour, and top talking hosts. Other pages include user/device/collector management, and a configuration wizard for setting up destne. Note that to login to the client for the first time the default username and password is destneAdmin and pasSW0rd!12 respectively. 

##Contact
***
destne is part of a project at NC State University and the owners of this project can be contacted using the about information in the client
