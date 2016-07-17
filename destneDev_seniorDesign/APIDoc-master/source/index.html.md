---
title: destne API Reference

language_tabs:
  - http
  - shell

toc_footers:
  - <a href='https://github.com/tripit/slate'>Documentation Powered by Slate</a>

includes:

search: true
---

# Introduction

Welcome to the destne web API! You can use our API to access your destne endpoint, which can provide various sets of information on network analytics. Destne is used in conjunction with NetFlow and NBAR to collect, categorize, and analyze traffic on user-defined interfaces. The API has administrative functions for managing users, devices, and collectors as well as pulling network data.

We have language examples in HTTP and shell as well as the JSON return objects for each call. You can view code examples in the dark area to the right and search for specific functions in the nav bar to the left.

# Authentication
## Basic Authentication
> To be issued a token, use this code:

```http
POST auth HTTP/1.1
Host: localhost:8443
Authorization: Basic base64_encoded_creds
```

```shell
curl --request POST "https://localhost:8443/auth"
  -H "Authorization: Basic base64_encoded_creds"
```

>The following is the format of the returned JSON object where success dictates a successful login or not

```json
  {
    "success": false,
    "message": "Token related message",  
    "token": "JSONWebToken"  
  }  
```



Destne allows for the issuing of API keys that expire after 20 minutes through POSTing credentials over HTTPS. The credentials must already be set within the user database on the destne server. These credentials are sent over a header base64 encoded in the form of

`username:password`

The response sent back from the server will be in JSON format where the message will contain any errors if there were problems with authentication. If the credentials were accepted, a cookie is sent back that stores the token in case you do not want to use the Bearer Authentication method described below.

## Bearer Authentication
> To authorize, use this code:

```http
POST api/* HTTP/1.1
Host: localhost:8443
x-apiauth: 'Bearer JSONWebToken'
```
```http
POST https://localhost:8443/api/* HTTP/1.1
cookie: 'access_token=JSONWebToken'
```

```shell
curl "api_endpoint_here"
  -H "x-apiauth: Bearer JSONWebToken"
```

>The following is the format of the returned JSON object where success dictates a successful login or not

Destne uses API keys (JSON Web Tokens) issued at /auth to authenticate. These keys expire after 20 minutes and require renewal at that point. The keys can be sent in the x-apiauth header with all requests to the API and if invalid, a JSON object will be returned indicating success or failure.

```json
{
  "success": false,
  "message": "No valid token provided"
}
```

Note that the token can also be sent stored in a cookie that looks like the following:

`cookie: access_token=JSONWebToken`

# Analytics
This section details the routes that allow for either raw data or specific analytics to be run on the collected network information. All the routes require authentication but no special privileges to be able to access

## Get Column Information
```http
GET api/v1/netflow/getColumnInfo HTTP/1.1
Host: localhost:8443
x-apiauth: 'Bearer JSONWebToken'
```

```shell
curl "https://localhost:8443/api/v1/netflow/getColumnInfo"
  -H "x-apiauth: Bearer JSONWebToken"
```

>The following is the format of the returned JSON object

```json
[{
  "agent_id": {
    "defaultValue":null,
    "type":"int",
    "maxLength":null,
    "nullable":false
  },
  "ip_src": {
    "defaultValue":null,
    "type":"char",
    "maxLength":15,
    "nullable":false
  },
  "src_port": {
    "defaultValue":null,
    "type":"int",
    "maxLength":null,
    "nullable":false
  }
}]
```

This route shows the column information of the current configuration of destne's database. Some of the fields included are
the name, default value, type of variable, max length, and if it is allowed to be null.

## Get Ingress Top Talkers
```http
GET api/v1/netflow/getIngressTopTalkers HTTP/1.1
Host: localhost:8443
x-apiauth: 'Bearer JSONWebToken'
```

```shell
curl "https://localhost:8443/api/v1/netflow/getIngressTopTalkers"
  -H "x-apiauth: Bearer JSONWebToken"
```

>The following is the format of the returned JSON object

```json
{
  "HostIP":"216.36.159.34",
  "TotalBytes":13500791250,
  "TotalPackets":9528478
}
```

This route displays the top 15 IPs that are sending the most data into your network. The
list is sorted by total bytes however total packets is included as a metric.

## Get Egress Top Talkers
```http
GET api/v1/netflow/getEgressTopTalkers HTTP/1.1
Host: localhost:8443
x-apiauth: 'Bearer JSONWebToken'
```

```shell
curl "https://localhost:8443/api/v1/netflow/getEgressTopTalkers"
  -H "x-apiauth: Bearer JSONWebToken"
```

>The following is the format of the returned JSON object

```json
[
  {
    "HostIP":"10.139.67.149",
    "TotalBytes":13500791250,
    "TotalPackets":9528478
  }
]
```

This route displays the top 15 IPs that are sending the most data out of your network. The
list is sorted by total bytes however total packets is included as a metric.

## Get Top Applications
```http
GET api/v1/netflow/getTopApps HTTP/1.1
Host: localhost:8443
x-apiauth: 'Bearer JSONWebToken'
```

```shell
curl "https://localhost:8443/api/v1/netflow/getTopApps"
  -H "x-apiauth: Bearer JSONWebToken"
```

>The following is the format of the returned JSON object

```json
[{
  "count":1320312,
  "appname": "http"
},
{
  "count":130418,
  "appname": "skype"
}]
```

This route displays the top 15 applications that have the most entries within the
database. **Note that this does not mean they've sent the most bytes or packets**. Instead
this metric shows that the application has had the most recorded instances over a set period of time.
The count field displays how many types it has appeared in the database.

## Most Active Applications
>Ingress URL api/v1/netflow/getIngressMostActiveApps

>Egress URL api/v1/netflow/getEgressMostActiveApps

```http
GET api/v1/netflow/getMostActiveApps HTTP/1.1
Host: localhost:8443
x-apiauth: 'Bearer JSONWebToken'
```

```shell
curl "https://localhost:8443/api/v1/netflow/getMostActiveApps"
  -H "x-apiauth: Bearer JSONWebToken"
```

>The following is the format of the returned JSON object

```json
[{
  "sumcount":88018320452,
  "appname": "youtube"
},
{
  "sumcount": 9825487,
  "appname": "google-docs"
}]
```

This route displays the top 15 applications that have sent the most bytes both in and out of the network.
The sumcount field displays the total amount of bytes for the application. It is possible to display for either
the ingress or egress interfaces by going to the URLs seen in the code example.

## Bytes per Hour
>Ingress URL api/v1/netflow/getIngressBytesPerHour

```http
GET api/v1/netflow/getEgressBytesPerHour HTTP/1.1
Host: localhost:8443
x-apiauth: 'Bearer JSONWebToken'
```

```shell
curl "https://localhost:8443/api/v1/netflow/getEgressBytesPerHour"
  -H "x-apiauth: Bearer JSONWebToken"
```

>The following is the format of the returned JSON object

```json
[
  {
    "TimeofDay":"2015-04-08T03:00:00.000Z",
    "TotalBytes":5324278
  },
  {
    "TimeofDay":"2015-04-08T04:00:00.000Z",
    "TotalBytes":16458224
  },
  {
    "TimeofDay":"2015-04-08T05:00:00.000Z",
    "TotalBytes":940295
  }
]
```

This route allows for users to get information about the traffic over time that is going either out or into their
network. The Time of Day field displays it in the format of year-month-dayTHour:Minute:SecondZ

## Average Packet Size per Application
```http
GET api/v1/netflow/getAvgPacketSizeByAppId HTTP/1.1
Host: localhost:8443
x-apiauth: 'Bearer JSONWebToken'
```

```shell
curl "https://localhost:8443/api/v1/netflow/getAvgPacketSizeByAppId"
  -H "x-apiauth: Bearer JSONWebToken"
```

>The following is the format of the returned JSON object

```json
[
  {
    "avgPacketSize":1492,
    "appname":"binary-over-http"
  },
  {
    "avgPacketSize":1143,
    "appname":"wikipedia"
  }
]
```

This route allows a user to see the average size in bytes of the packets sent by the application stored in the appname field.

## Protocol Distribution
>Ingress URL api/v1/netflow/getIngressProtocolDistribution

>Egress URL api/v1/netflow/getEgressProtocolDistribution

```http
GET api/v1/netflow/getProtocolDistribution HTTP/1.1
Host: localhost:8443
x-apiauth: 'Bearer JSONWebToken'
```

```shell
curl "https://localhost:8443/api/v1/netflow/getProtocolDistribution"
  -H "x-apiauth: Bearer JSONWebToken"
```

>The following is the format of the returned JSON object

```json
[
  {
    "protocal":"udp",
    "TotalRecordedInstances":179727
  },
  {
    "protocal":"tcp",
    "TotalRecordedInstances":13292
  }
]
```

This route displays the protocol distribution within the database by summing up the number of bytes for each protocol.
Often times this could be used in the form of percentages to show how much each protocol is using in your network.

## Packets Sent per Application
```http
GET api/v1/netflow/getPacketPerAppID HTTP/1.1
Host: localhost:8443
x-apiauth: 'Bearer JSONWebToken'
```

```shell
curl "https://localhost:8443/api/v1/netflow/getPacketsPerAppID"
  -H "x-apiauth: Bearer JSONWebToken"
```

>The following is the format of the returned JSON object

```json
[
  {
    "packetsum":773576,
    "appname":"ping"
  },
  {
    "packetsum":15856,
    "appname":"amazon-web-services"
  }
]
```

This route shows the sum of packets sent across both interfaces for each application. Only
the top 15 applications are displayed ordered by amount of packets.

# Admin Calls

>If a user attempts to access without admin privileges they get the following return

```json
{
  "success": false,
  "message": "Administrative privileges required"
}
```

All the routes below this section can only be accessed by administrators. Administrative roles can be added to users using the API which can be seen in the 'User Role' section below. The starting point for admin routes is api/v1/admin/*


# Users
Destne allows the following information about users to be accessed and changed via the API for those with administrative privileges:

* username
* hashed password
* roles
* real name
* email

*Note that real name, and email are optional fields. If they do not exist for a user they will show up as null*

Valid usernames can only contain letters and numbers and must not be longer than 100 characters.

Valid passwords must be at least 10 characters and have three of the four following requirements. There also may not be three repeating characters

* Lowercase Letter
* Uppercase Letter
* Numbers
* Special Character

Valid first or last names cannot be longer than 45 characters in length and can only contain letters and dashes.

Valid emails cannot be longer than 100 characters in length and must be in the format of an email address (something@stuff.suffix)

Modifying only a specific user can be done by accessing api/v1/admin/user/:userid where userId is a positive, non-zero integer.

*All API calls for a user are accessible at api/v1/admin/user*

## Get All Users
```http
GET api/v1/admin/user HTTP/1.1
Host: localhost:8443
x-apiauth: 'Bearer JSONWebToken'
```

```shell
curl "https://localhost:8443/api/v1/admin/user"
  -H "x-apiauth: Bearer JSONWebToken"
```

>The following is the format of the returned JSON object

```json
{
  "users":
  [
    {
      "userId": 1,
      "username": "firstUser",
      "password": "passwordHash",
      "firstname": "myName",
      "lastname": "isFirst",
      "email": "firstuser@destne.com",
      "role": ["User", "Administrator"]
    },
    {
      "userId": 2,
      "username": "secondUser",
      "password": "passwordHash",
      "firstname": "null",
      "lastname": "null",
      "email": "null",
      "role": []
    }
  ]
}
```

This route retrieves all the users contained within the destne database and their userId, username, hashed password, real name, email, and roles

## Get A Specific User

```http
GET api/v1/admin/user/1 HTTP/1.1
Host: localhost:8443
x-apiauth: 'Bearer JSONWebToken'
```

```shell
curl "https://localhost:8443/api/v1/admin/user/1"
  -H "x-apiauth: Bearer JSONWebToken"
```

>The following is the format of the returned JSON object

```json
  {
    "userId": 1,
    "username": "firstUser",
    "role":["User"],
    "unassignedRole": ["Administrator"],
    "firstname": "first",
    "lastname": "user",
    "email": "firstisBest@destne.com"
  }
```

This route retrieves a specific user specified by the non-zero, positive, integer **userId**

## Add A User

```http
POST /api/v1/admin/user HTTP/1.1
Host: localhost:8443
x-apiauth: 'Bearer JSONWebToken'
Content-Type: application/x-www-form-urlencoded

username=thirdUser&password=th!s1s@paSw0RD
```

```shell
curl -d "username=thirdUser&password=th!s1s@paSw0RD"
  "https://localhost:8443/api/v1/admin/user"
  -H "x-apiauth: Bearer JSONWebToken"
```

> JSON Object upon success

```json
{
  "message": "User created!"
}
```

> JSON Object upon failure

```json
{
  "error": "Invalid Characters in Username"
}
```

This route allows for the creation of a new user whose userId will automatically be assigned to the next integer value. Required fields for this route are username and password which must meet the requirements listed in the 'User' section above.

Optional fields that can be added to the POST request are email, and first/last name which are also restricted by the requirements in the 'User' section. Note that multiple errors can be returned and will be in the form of a JSON array.

## Modify A User

```http
PUT /api/v1/admin/user/1 HTTP/1.1
Host: localhost:8443
x-apiauth: 'Bearer JSONWebToken'
Content-Type: application/x-www-form-urlencoded

username=changedUsername&addRole=Administrator
```

```shell
curl -X PUT -d "username=thirdUser&deleteRole=User"
  "https://localhost:8443/api/v1/admin/user/1"
  -H "x-apiauth: Bearer JSONWebToken"
```

> JSON Object upon success

```json
{
  "message": "User updated!"
}
```

> JSON Object upon failure

```json
{
  "error": "Your password contains three repeating characters"
}
```

This route allows for changing any field of a user specified by their userID. Possible fields for change are listed in the 'User' section above along with their requirements. Any errors returned will be sent in the form of an array unless there is only one error.

Unique to the PUT request is the ability to add roles or remove them via the 'addRole' or 'deleteRole' fields respectively. Roles are specified by their names which can be found by doing a GET request for a specific user. If a role does not exist or the user already has the role assigned to them an error will be returned.  

## Delete A User

```http
DELETE /api/v1/admin/user/1 HTTP/1.1
Host: localhost:8443
x-apiauth: 'Bearer JSONWebToken'
Content-Type: application/x-www-form-urlencoded
```

```shell
curl -X DELETE "https://localhost:8443/api/v1/admin/user/1"
  -H "x-apiauth: Bearer JSONWebToken"
```

> JSON Object upon success

```json
{
  "message": "Successfully deleted!"
}
```

> JSON Object upon failiure

```json
{
  "message": "No User found with that ID"
}
```

This route allows for deleting a user with the specified userId, this will also remove all assigned roles to the user and any other connected information.

# User Roles
Destne allows user roles to be viewed and changed via the API for those with administrative privileges. The userId for the user must be a non-zero, positive integer while the roleName must already exist as an assignable role. In the case of all but PUT, the roleName must already be assigned to the user.

Modifying roles for a specific user can be done by accessing api/v1/admin/user/:userid/role/:roleName or through a PUT request to api/v1/admin/user/:userid

## Get Roles For A Specific User

```http
GET api/v1/admin/user/1/role HTTP/1.1
Host: localhost:8443
x-apiauth: 'Bearer JSONWebToken'
```

```shell
curl "https://localhost:8443/api/v1/admin/user/1/role"
  -H "x-apiauth: Bearer JSONWebToken"
```

>The following is the format of the returned JSON object

```json
  {
    "userId": 1,
    "username": "firstUser",
    "roles":[
      "Administrator",
      "User"
    ]
  }
```

This route retrieves a specific user specified by the non-zero, positive, integer userId and returns the roles assigned to them.

## Add A Role To A User

```http
PUT /api/v1/admin/user/1/role/Administrator HTTP/1.1
Host: localhost:8443
x-apiauth: 'Bearer JSONWebToken'
```

```shell
curl -X PUT "https://localhost:8443/api/v1/admin/user/1/Administrator"
  -H "x-apiauth: Bearer JSONWebToken"
```

> JSON Object upon success

```json
{
  "message": "Role - Administrator added to User - firstUser"
}
```

> JSON Object upon failure

```json
{
  "message": "User - firstUser already has role - Administrator"
}
```

This route allows adding a role specified by :roleName to an existing user specified by their userId. The roleName must already exist as an assignable role.

## Delete A Role From A User

```http
DELETE /api/v1/admin/user/1/Administrator HTTP/1.1
Host: localhost:8443
x-apiauth: 'Bearer JSONWebToken'
```

```shell
curl -X DELETE "https://localhost:8443/api/v1/admin/user/1/Administrator"
  -H "x-apiauth: Bearer JSONWebToken"
```

> JSON Object upon success

```json
{
  "message": "Role - Administrator deleted from User - firstUser"
}
```

> JSON Object upon failure

```json
{
  "message": "User - firstUser does not have role Administrator"
}
```

This route allows for deleting an already assigned role from a user with the specified userId. The role must already exist as an assignable role.

# Device Management
In this category are all the routes that involve device management. While most of the routes are just for collecting information, there are several that allow for changes to the device. Exercise caution when using these routes as it could cause connection loss to end users and require administrative work on the device itself to restore service.

## Get System Information

```http
GET api/v1/admin/device/system HTTP/1.1
Host: localhost:8443
x-apiauth: 'Bearer JSONWebToken'
```

```shell
curl "https://localhost:8443/api/v1/admin/device/system"
  -H "x-apiauth: Bearer JSONWebToken"
```

>The following is the format of the returned JSON object

```json
  {
    "hostname": "destne",
    "os": "Linux",
    "kernel": "3.19.0-56-generic",
    "nodeVersion": "v4.4.1",
    "uptime": 2735
  }
```

This route gets the current information of the device where nodeVersion relates to nodeJS and uptime is given in seconds

## Get CPU Load

```http
GET api/v1/admin/device/cpuLoad HTTP/1.1
Host: localhost:8443
x-apiauth: 'Bearer JSONWebToken'
```

```shell
curl "https://localhost:8443/api/v1/admin/device/cpuLoad"
  -H "x-apiauth: Bearer JSONWebToken"
```

>The following is the format of the returned JSON object

```json
  {
    "cpuLoad": [
      0.7373,
      0.9716,
      1.0581
    ]
  }
```

This route gets the current cpu load from the device where the intervals given are for the 1-minute, 5-minute, and 15-minute average respectively

## Get System Storage

```http
GET api/v1/admin/device/storage HTTP/1.1
Host: localhost:8443
x-apiauth: 'Bearer JSONWebToken'
```

```shell
curl "https://localhost:8443/api/v1/admin/device/storage"
  -H "x-apiauth: Bearer JSONWebToken"
```

>The following is the format of the returned JSON object

```json
  {
    "freeStorage": 10347,
    "usedStorage": 8107,
    "totalStorage": 18454
  }
```

This route gets the current storage information based on the primary home partition (/). The numbers returned are specified in MegaBytes.

## Get Memory (RAM) Information

```http
GET api/v1/admin/device/memory HTTP/1.1
Host: localhost:8443
x-apiauth: 'Bearer JSONWebToken'
```

```shell
curl "https://localhost:8443/api/v1/admin/device/memory"
  -H "x-apiauth: Bearer JSONWebToken"
```

>The following is the format of the returned JSON object

```json
  {
    "freeMemory": 161247232,
    "usedMemory": 2465263616,
    "totalMemory": 2626510848
  }
```

This route gets the current information of the memory from RAM that is available and currently being used. The numbers returned are specified in bytes

## Get Device Statistics

```http
GET api/v1/admin/device/devStats HTTP/1.1
Host: localhost:8443
x-apiauth: 'Bearer JSONWebToken'
```

```shell
curl "https://localhost:8443/api/v1/admin/device/devStats"
  -H "x-apiauth: Bearer JSONWebToken"
```

>The following is the format of the returned JSON object

```json
  {
    "hostname": "destne",
    "os": "Linux",
    "kernel": "3.19.0-56-generic",
    "nodeVersion": "v4.4.1",
    "uptime": 2735,
    "cpuLoad": [
      1.9001,
      1.3438,
      1.1748
    ],
    "freeStorage": 10347,
    "usedStorage": 8107,
    "totalStorage": 18454,
    "freeMemory": 164868096,
    "usedMemory": 2461642752,
    "totalMemory": 2626510848
  }
```

This route gets all the information from the previous routes combined and is primarily used for client-side calls.

## Get DNS Information

```http
GET api/v1/admin/device/dns HTTP/1.1
Host: localhost:8443
x-apiauth: 'Bearer JSONWebToken'
```

```shell
curl "https://localhost:8443/api/v1/admin/device/dns"
  -H "x-apiauth: Bearer JSONWebToken"
```

>The following is the format of the returned JSON object

```json
  {
    "dnsServers": [
      {"server": "8.8.8.8"},
      {"server": "8.8.4.4"}
    ]
  }
```

This route gets the currently used DNS information used on the ethernet interface (eth0). An array is returned for all the DNS servers in use in order of first used to last.

## Get Network Information

```http
GET api/v1/admin/device/network HTTP/1.1
Host: localhost:8443
x-apiauth: 'Bearer JSONWebToken'
```

```shell
curl "https://localhost:8443/api/v1/admin/device/network"
  -H "x-apiauth: Bearer JSONWebToken"
```

>The following is the format of the returned JSON object

```json
  {
    "name": "eth0",
    "ip_address": "10.0.2.12",
    "mac_address": "DE:AD:BE:EF:CA:FE",
    "type": "Wired",
    "netmask": "255.255.255.0",
    "gateway_ip": "10.0.2.2",
    "networkType": "static",
    "dnsServers": [
      {"server": "8.8.8.8"},
      {"server": "8.8.8.8"}
    ]
  }
```

This route gets the current network information for the device along with any DNS Servers currently in use. Note that the "networkType" field can be the values of static, dhcp, or ERROR if something went wrong. If you see the ERROR field appear check to make sure that the destne server does not have the network-manager service running

## Change Network Information

```http
PUT api/v1/admin/device/network HTTP/1.1
Host: localhost:8443
x-apiauth: 'Bearer JSONWebToken'
Content-Type: application/x-www-form-urlencoded

state=static&ipaddress=192.1.1.18&netmask=255.255.255.0&
network=192.1.1.0&gateway=192.1.1.1&nameserver1=8.8.8.8&
nameserver2=8.8.4.4
```

```shell
curl -X PUT -d "state=dhcp"
  "https://localhost:8443/api/v1/admin/device/network"
  -H "x-apiauth: Bearer JSONWebToken"
```

> JSON Object upon success

```json
  {
    "message": "Static Network configured successfully!"
  }
```

> JSON Object upon failure

```json
  {
    "error": "Network not set, information is invalid please check format"
  }
```

This route allows you to change the network information about the device including the IP Address (IPv4), Netmask, Network, Gateway, and DNS addresses. When it is called the network will go down for about a minute while it sets the new parameters so the API *will* be inaccessible during that time. If it is still inaccessible after several minutes, the network parameters were most likely incorrect.

If static is specified as the state all parameters listed must be included, however if dhcp is specified no other parameters will be used.

**This route can be dangerous and cause connection loss. Please input the correct parameters or the API will not be accessible anymore until the device is reconfigured manually**

## Restart Device

```http
GET api/v1/admin/device/restart HTTP/1.1
Host: localhost:8443
x-apiauth: 'Bearer JSONWebToken'
```

```shell
curl "https://localhost:8443/api/v1/admin/device/restart"
  -H "x-apiauth: Bearer JSONWebToken"
```

> JSON Object upon success

```json
  {
    "message": "Device is rebooting, please wait a minute and refresh the browser"
  }
```
> JSON Object upon failure

```json
  {
    "error": "Unable to reboot device"
  }
```

This route allows for rebooting the device upon calling it. Note that currently the device does not restart the destne server which will need to be manually done before it is available for use

**This route will cause connection loss upon use, use caution when calling it**

## Shutdown Device

```http
GET api/v1/admin/device/shutdown HTTP/1.1
Host: localhost:8443
x-apiauth: 'Bearer JSONWebToken'
```

```shell
curl "https://localhost:8443/api/v1/admin/device/shutdown"
  -H "x-apiauth: Bearer JSONWebToken"
```

> JSON Object upon success

```json
  {
    "message": "Device is shutting down... to use destne again manually power the machine back on"
  }
```
> JSON Object upon failure

```json
  {
    "error": "Unable to shutdown device"
  }
```

This route allows for shutting down the device upon calling it. Note that the device and server will have to be manually powered on at this point for it to be usable again.

**This route will cause connection loss upon use, use caution when calling it**

# Collector Management

The routes in this section relate to the collector used for destne which is a combination of the Cisco router with NetFlow and the destne server. Note that using some of these API calls can modify the analytics being captured by destne which could cause issues in user applications. Ensure caution when using these routes.

## Start Collector

```http
GET api/v1/admin/collector/start HTTP/1.1
Host: localhost:8443
x-apiauth: 'Bearer JSONWebToken'
```

```shell
curl "https://localhost:8443/api/v1/admin/collector/start"
  -H "x-apiauth: Bearer JSONWebToken"
```

> JSON Object upon success

```json
  {
    "message": "Collector successfully started"
  }
```
> JSON Object upon failure

```json
  {
    "error": "Nfacctd process already running"
  }
```

This route starts the PMACCT process on the destne server which collects NetFlow information from the Cisco router. The process is started using the information from the 'config' route and any errors will be returned in the JSON object. If there were errors the process is killed and PMACCT will not be running on the device

## Stop Collector

```http
GET api/v1/admin/collector/stop HTTP/1.1
Host: localhost:8443
x-apiauth: 'Bearer JSONWebToken'
```

```shell
curl "https://localhost:8443/api/v1/admin/collector/stop"
  -H "x-apiauth: Bearer JSONWebToken"
```

> JSON Object upon success

```json
  {
    "message": "Collector successfully stopped"
  }
```
> JSON Object upon failure

```json
  {
    "error": "No nfacctd process running"
  }
```

This route stops the PMACCT process running on the device and will return an error if there was no process or it was unable to quit.  

**Note that once stopped, live data will no longer be captured on destne which will affect displayed analytics**

## Get Collector Configuration

```http
GET api/v1/admin/collector/config HTTP/1.1
Host: localhost:8443
x-apiauth: 'Bearer JSONWebToken'
```

```shell
curl "https://localhost:8443/api/v1/admin/collector/config"
  -H "x-apiauth: Bearer JSONWebToken"
```

> Format of returned JSON Object

```json
  {
    "collectorIP": "10.0.2.15",
    "collectorPort": 8887,
    "sqlDB": "destne",
    "sqlHost": "127.0.0.1",
    "sqlUser": "root",
    "status": "Stopped"
  }
```

This route gets the configuration information for the collector stored in the mysql-nfacctd.conf file which can be modified through the API. An error will be thrown if the file does not exist or corrupted

## Modify Collector Configuration

```http
PUT api/v1/admin/collector/config HTTP/1.1
Host: localhost:8443
x-apiauth: 'Bearer JSONWebToken'
Content-Type: application/x-www-form-urlencoded

collectorIP=10.0.2.16&collectorPort=8889&sqlDB=destne2
&sqlHost=127.0.0.1&sqlUser=root&sqlPassword=password
```

```shell
curl -x PUT -d "collectorIP=10.0.2.22&collectorPort=9922"
  "https://localhost:8443/api/v1/admin/collector/config"
  -H "x-apiauth: Bearer JSONWebToken"
```
> JSON Object upon success

```json
  {
    "message": "Collector parameters updated"
  }
```

> JSON Object upon failure

```json
  {
    "error": [
      {"collectorIP": "Invalid IP Address (IPv4)"}
    ]
  }
```

This route modifies the collector information stored in the mysql-nfacctd.conf file however **it does not change the current running instance of the collector on destne**. To start collection with the new parameters you must stop and start the collector again before they take effect. All parameters are optional and are as follows:

- *collectorIP*: The IP address from where the NetFlow information will come from (generally the Cisco Router)
- *collectorPort*: The port that the Cisco Router is configured to send NetFlow info on
- *sqlDB*: The database name that will store the NetFlow Information
- *sqlHost*: The IPv4 address of the database (typically localhost 127.0.0.1)
- *sqlUser*: The username for the specified database
- *sqlPassword*: The password for the specified database

**Some of these changes (like modifying port or IP) could require further network configurations outside of destne. Make sure that the Cisco Router with NetFlow still has the correct configuration
