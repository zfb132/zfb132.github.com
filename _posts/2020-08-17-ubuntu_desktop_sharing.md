---
layout: post
title: ubuntu系统共享桌面的使用和配置
subtitle: "共享桌面配置为RDP协议，方便其他系统连接"
category : [Ubuntu,Linux,Windows,Android]
tags : [Ubuntu,Linux,Windows,Android]
date:       2020-08-17 16:37:28 +08:00
author:     "晨曦"
header-img: "/img/post/ubuntu-canonical-bg.png"
description:  "可以搭配frp内网穿透实现在公网环境访问桌面，作为TeamViewer、向日葵等远程控制软件的替代"
---
  
## 目录
{: .no_toc}

* 目录
{:toc}

## 1. ubuntu共享桌面
在ubuntu桌面发行版打开`屏幕共享`功能，步骤如下：  
```txt
设置-->共享-->屏幕共享
    打开总开关
    允许连接控制屏幕
    需要密码（自己设置密码，最多8位）
    网络打开
设置-->共享-->远程登录
    打开总开关
```
查看当前用户占用的共享桌面端口`lsof -i:5900`  
```text
zfb@my-Server:~/build$ lsof -i:5900
COMMAND    PID USER  FD   TYPE   DEVICE SIZE/OFF NODE NAME
vino-serv 4308 zfb   11u  IPv6 12350285      0t0  TCP *:5900 (LISTEN)
vino-serv 4308 zfb   12u  IPv4 12350286      0t0  TCP *:5900 (LISTEN)
```
本用户只能看到自己占用的端口，一般从`5900`开始，一个用户占用一个，只有开启共享的用户才占用。例如，用户`root1`和用户`zfb`都开启了共享，则用户`zfb`执行命令`lsof -i:5900`、`lsof -i:5901`和`lsof -i:5902`，只有一个命令有返回结果，即自己占用的那个端口。但是，使用命令`ss -lnt`可以看到`5900-5902`端口都在被占用，只是无法看到具体进程和用户
## 2. 局域网登录远程桌面
### 2.1 ubuntu使用remmina登录远程桌面
打开软件`remmina`，选择`VNC`协议，输入要连接的机器的地址`192.168.10.11:5900`（附带端口），然后会提示输入密码，这里要输入`5900`端口对应的那个用户的密码（共享桌面密码，不是用户密码），即可成功看到桌面。
### 2.2 在windows登录远程桌面
下载[vnc viewer](https://www.realvnc.com/en/connect/download/viewer/windows/)并安装，打开软件，根据提示输入ip地址`192.168.10.11:5900`，如果提示加密策略不一致。那么需要回到开启桌面共享的ubuntu机器上，输入以下命令关闭加密即可  
`gsettings set org.gnome.Vino require-encryption false`  
或者安装`dconf-editor`工具进行配置，输入以下命令即可安装：  
`sudo apt-get install dconf-editor`  
然后桌面搜索`dconf-editor`打开，依次展开`org->gnome->desktop->remote-access`，然后取消`requlre-encryption`的勾选即可
### 2.3 Android使用RD Client登录远程桌面
下载安装`Microsoft Remote Desktop`软件，打开软件添加`Desktop`，设置`PC name`为`192.168.10.11:5900`，`Additional Options`根据需要设置，然后保存，单击即可连接
## 3. 外网登录远程桌面
### 3.1 方法一
前提：  
* 可以在外网使用ssh访问内网的ubuntu机器（比如使用frp进行内网穿透，公网云主机的ip为`56.78.12.34`，这台内网服务器的`frpc.ini`文件中配置的远程ssh端口为`7001`）
* 内网ubuntu服务器已经开启桌面共享

使用如下代码通过公网云主机ssh远程连接到内网的ubuntu服务器，并且把服务器的5901端口映射到用户本地的8080端口  
`ssh -p 7001 -NL localhost:8080:localhost:5900 zfb@56.78.12.34`  
此命令无回显输出，用户直接使用支持vnc的软件在本地打开即可，远程地址填写为`127.0.0.1:8080`，根据提示输入密码（内网ubuntu机器开启桌面共享时设置的密码）  
**特点：** 此方法可以使用`zfb`的用户名和密码查看其他用户（例如`root`）的远程桌面，命令如下  
`ssh -p 7001 -NL localhost:8080:localhost:5901 zfb@56.78.12.34`  
相比上一条命令，只是修改为5901端口（`root`用户的监听端口）
### 3.2 方法二
使用frp转发此端口（远程桌面监听的端口，一般从5900开始），具体方法为：  
* 若已配置过frp转发ssh内网穿透，则云主机的`frps.ini`不需要任何变化
* 此方法的所有修改仅限于内网机器的`frpc.ini`文件，在文件中添加以下内容：  
```ini
[rdp]
type = tcp
local_ip = 127.0.0.1
# 假如只需要转发占用5901端口的用户的桌面
local_port = 5900
# 可以任意设置公网云主机的端口，不要与其他服务冲突即可
remote_port = 9901
```
* 公网云主机安全策略要放通9901端口

用户直接使用支持vnc的软件在本地打开即可，远程地址填写为`56.78.12.34:9901`，根据提示输入密码（内网ubuntu机器开启桌面共享时设置的密码）  
**注意：** 2、3和4都只能在用户登录之后（显示屏上的桌面为该用户时）才能显示画面，否则不行
## 4. 安装xrdp实现多用户登录远程桌面
根据[教程](https://c-nergy.be/blog/?p=14888)，下载[压缩包](http://c-nergy.be/downloads/xRDP/xrdp-installer-1.2.zip)解压得到脚本，（最好在`root`用户）执行即可。然后登出桌面环境，此时即可通过3389端口利用rdp协议登录xorg桌面，多个用户都可以登录，且可以同时登录，但是物理机器要保留在登录界面  
**注意：** 同一个用户，本地和远程同时只能登录一个  
  
此步骤与前面不冲突，是一种新的方法（也许依赖第一步），VNC仍然需要登录才可用  
  
使用frp对本地3389端口进行内网穿透，只需要修改frp客户端配置  
```ini
[rdp]
type = tcp
local_ip = 127.0.0.1
# 假如只需要转发占用3389端口的用户的桌面
local_port = 3389
# 可以任意设置公网云主机的端口，不要与其他服务冲突即可
remote_port = 6689
```
在远程桌面遇到终端报错`Transport endpoint is not connected`，且看到桌面有`thinclient_drives`驱动器时的解决办法  
可以使用代码`sudo umount -f thinclient_drives`来解决，但是此时共享剪切板和跨设备复制粘贴文件就不能用了  
最好可以重新登陆一次，也许就正常了  