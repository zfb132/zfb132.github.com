---
layout: post
title: 使用frp实现内网穿透
subtitle: "内网服务器和云主机都是Linux系统，用户只需拥有ssh即可连接"
category : [Ubuntu,Windows]
tags : [Ubuntu,Windows]
date:       2020-07-05 13:50:18 +08:00
author:     "晨曦"
header-img: "/img/post/ubuntu-canonical-bg.png"
description:  "用户在其他地方可以通过云主机随时随地对内网服务器进行ssh访问"
---
  
# 目录
{: .no_toc}

* 目录
{:toc}

## 1. 目的和机器信息
云主机A（**服务端**），购买于云服务器提供商，以下IP、端口、用户名、密码均为示例：  
```txt
IP: 67.89.12.34
默认开启ssh的22端口，用户名为ubuntu，密码为Test&123456+pwd
手动配置安全组，放通7000、8000-8100、8888端口的TCP连接（端口可任意设置，不与其他服务冲突即可）
7000端口用于服务端（frps.ini中的bind_port）与客户端（frpc.ini中的server_port）建立基本通信、鉴权等
         一个服务端可以用同一个端口连接不同的客户端
8000-8100端口用来进行转发，只在客户端的配置文件frpc.ini中设置remote_port，每个端口转发不同的服务
         可以是一台内网服务器有多个服务；也可以是多台内网服务器，每台有不同数量的服务
8888端口用来配置frps的管理面板（80、443端口默认开启）
```
内网服务器B（**客户端**），自己购买的配置较高的服务器，但是没有公网地址，所以只能局域网访问，[安装ssh](https://blog.whuzfb.cn/blog/2020/07/05/ubuntu_commands/#1-ubuntu%E6%A1%8C%E9%9D%A2%E7%89%88%E5%AE%89%E8%A3%85ssh)以便于其他用户可以ssh连接到本机：  
```txt
IP: 192.160.0.135
内网服务器B安装ssh，选择22端口，用户名为myserver，密码为Myser123456ver
将内网服务器B的22端口，转发到云主机A的8000端口
    则用户C可以使用如下代码来远程ssh连接内网服务器B
    ssh -p 8000 myserver@67.89.12.34
    使用如下代码来将内网服务器B的/home/myserver/test.txt文件下载到用户C的机器上
    scp -P 8000 myserver@67.89.12.34:/home/myserver/test.txt ./Desktop/
```
用户C（**用户端**），只需要**具备ssh连接的软件**和**Xming软件**（用于显示内网服务器B的GUI，若只需要访问内网服务器B的终端，则用户不需要安装此软件）  
frp的系统架构和最终实现的效果如下图  
<img src="/img/post/frp-architecture.png" width="768px" alt="frp内网穿透">

## 2. 云主机A下载和配置frp-server
在github仓库[frp]("https://github.com/fatedier/frp/releases")下载`linux-amd64`版本，解压为文件夹`frp_linux_amd64`并放在`/home/ubuntu/`目录下，在`frp_linux_amd64`文件夹创建`log`目录用于保存日志。修改`frps.ini`文件为如下
```conf
[common]
# 绑定的IP地址，支持IPv6，不指定默认0.0.0.0
bind_addr = 0.0.0.0
# 服务端口
bind_port = 7000

# 设置服务器与客户端的鉴权方式
authentication_method = token
# 客户端与服务端通信的身份验证令牌
token = ToKen&pwd+123for56

# 开启frps仪表盘可以检查frp的状态和代理的统计信息
# frps仪表盘绑定的地址
dashboard_addr = 0.0.0.0
# frps仪表盘绑定的端口
dashboard_port = 8888
# 访问frps仪表盘的用户 
dashboard_user = example_admin
# 用户密码 
dashboard_pwd = AdMinVgfsHT67TFg
# 仪表盘页面文件目录，只适用于调试
# assets_dir = ./static

# 日志配置文件
# 日志文件,不指定日志信息默认输出到控制台
log_file = /home/ubuntu/frp_linux_amd64/log/frps.log
# 日志等级，可用等级“trace, debug, info, warn, error”
log_level = info
# 日志保存最大保存时间
log_max_days = 7

# 每个客户端连接服务端的最大连接数
max_pool_count = 5
# 每个客户端最大可以使用的端口，0表示无限制
max_ports_per_client = 0
# 自定义子域名，需要在dns中将域名解析为泛域名
# subdomain_host = example.cn
# 是否使用tcp复用，默认为true
tcp_mux = true
```
## 3. 云主机A安装使用nginx（dashboard自定义域名，可选）
更新软件源：`sudo apt-get update`  
安装nginx：`sudo apt-get install nginx`  
访问云主机的ip确认nginx安装成功  
修改nginx配置文件：`sudo vi /etc/nginx/nginx.conf`  
在`http{}`合适位置添加以下代码，这里的`8888`端口与`frps.ini`的`dashboard_port`一致  
**一定要将`http{}`里面的最后两个include行注释掉，修改才会生效**  
```conf
    server{
        listen 80;
        server_name frp.example.cn;
        access_log /home/ubuntu/frp_linux_amd64/log/access.log;
        error_log /home/ubuntu/frp_linux_amd64/log/error.log;
        location /{
            proxy_set_header Host $host;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_redirect off;
            proxy_buffering off;
            proxy_pass http://127.0.0.1:8888;
        }
    }
```
不重启重新载入最新配置文件内容：`sudo service nginx reload`  
停止nginx服务：`sudo service nginx stop`  
重启nginx服务：`sudo service nginx restart`  
**为域名example.cn添加一条名为frp的A记录解析到67.89.12.34**  
## 4. 云主机A设置frps开机自启动（/etc/systemd/system/）
打开`frp_linux_amd64`文件夹下的`systemd`目录，编辑`frps.service`文件（`frps@.service`文件只是多了个自定义ini文件的功能），将其中的`user=nobody`改为`user=ubuntu`（即本机的用户名），**如果不改，启动时候会报错无法写入日志文件，权限禁止**  
然后修改`ExecStart、ExecReload`中的路径为自己的文件路径  
将修改后的`frps.service`文件复制到`/etc/systemd/system/`：`sudo cp ./frps.service /etc/systemd/system/`  
激活frps开机启动：`systemctl enable frps`  
手动运行frps服务：`systemctl start frps`或`service frps start`  
手动停止frps服务：`systemctl stop frps`或`service frps stop`  
手动重启frps服务：`systemctl restart frps`或`service frps restart`  
查看frps运行状态：`systemctl status frps`或`service frps status`  
**关闭frps开机启动**：`systemctl disable frps`  
## 5. 云主机A设置frps开机自启动（/etc/init.d/）
创建`start_frp.sh`文件：`vi start_frp.sh`，内容如下（注释不可删除）：  
```bash
#!/bin/sh
### BEGIN INIT INFO
# Provides:          svnd.sh
# Required-start:    $local_fs $remote_fs $network $syslog
# Required-Stop:     $local_fs $remote_fs $network $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: starts the svnd.sh daemon
# Description:       starts svnd.sh using start-stop-daemon
### END INIT INFO
/home/ubuntu/frp_linux_amd64/frps -c /home/ubuntu/frp_linux_amd64/frps.ini
```
给予执行权限： `chmod 775 start_frp.sh`  
复制到指定位置：  `sudo cp ./start_frp.sh /etc/init.d/`  
刷新即可：  `sudo update-rc.d start_frp.sh defaults 90`  
重启即可发现自启动进程：  `ps -ef | grep frp`  
**取消frps自启动（/etc/init.d/）**  
```bash
sudo rm /etc/init.d/start_frp.sh
sudo update-rc.d -f start_frp remove
```
## 6. 在内网服务器B安装配置frp-client
在github仓库[frp]("https://github.com/fatedier/frp/releases")下载`linux-amd64`版本，解压为文件夹`frp_linux_amd64`并放在`/home/myserver/`目录下，在`frp_linux_amd64`文件夹创建`log`目录用于保存日志。修改`frpc.ini`文件为如下  
```conf
[common]
# 云主机的公网ip
server_addr = 67.89.12.34
# 云主机端frps.ini文件中的bind_port
server_port = 7000

# 客户端与服务端通信的身份验证令牌
token = ToKen&pwd+123for56

# 设置管理地址，用于通过http api控制frpc的动作，如重新加载
# admin_addr = 127.0.0.1
# admin_port = 7400
# admin_user = admin
# admin_passwd = admin

# 初始连接池的数量，默认为0
pool_count = 5

# 客户端日志存储位置
log_file = /home/myserver/frp_linux_amd64/log/frpc.log
# 保存日志的等级trace, debug, info, warn, error
log_level = info
# 最大保存天数
log_max_days = 7

# 是否启用tcp复用，默认为true
tcp_mux = true

# 代理配置段名称，如果上面配置user=your_name,则显示为your_name.ssh
[ssh_B1_00]
# 协议默认tcp,可选tcp,udp,http,https,stcp,xtcp
type = tcp
# 本地地址
local_ip = 127.0.0.1
# 本地端口
local_port = 22
# 在服务器端开启的远程端口，即用户使用自己电脑ssh连接时的端口
remote_port = 8000
	
# 云服务器管理面板创建安全组
# 0.0.0.0/0	TCP:7000,8000-8100,8888	允许

# 从第三台机器上直接用ssh即可连接本机，即:
# 云主机A安装frps，内网自己配的服务器B安装frpc
# 用户不需要安装frp，用户直接使用ssh连接即可
# ssh -p 8000 myserver@67.89.12.34
# 此命令实现用户C在他的电脑上远程登录到内网服务器B，
# myserver是内网服务器B的用户名，67.89.12.34是云主机A的ip
# scp -P 8000 ./1.deb myserver@67.89.12.34:/home/myserver/Desktop/
# 此命令实现用户本机文件上传到内网服务器B

# 若内网还有服务器B2,则云主机A的frps不需要动
# 在内网服务器B2上面安装frpc即可，注意其配置为:
# [common]
# server_addr = 67.89.12.34
# server_port = 7000
# 不要与内网服务器B重名
# [ssh_B2_00]   
# type = tcp
# local_ip = 127.0.0.1
# local_port = 22
# 新的用于ssh访问内网服务器B2的端口
# remote_port = 8001
```
## 7. 内网服务器B设置frpc开机自启动（/etc/systemd/system/）
打开`frp_linux_amd64`文件夹下的`systemd`目录，编辑`frpc.service`文件（`frpc@.service`文件只是多了个自定义ini文件的功能），将其中的`user=nobody`改为`user=myserver`（即本机的用户名），**如果不改，启动时候会报错无法写入日志文件，权限禁止**
然后修改`ExecStart、ExecReload`中的路径为自己的文件路径
将修改后的`frpc.service`文件复制到`/etc/systemd/system/`：`sudo cp ./frpc.service /etc/systemd/system/`
激活frpc开机启动：`systemctl enable frpc`
手动运行frpc服务：`systemctl start frpc`或`service frpc start`
手动停止frpc服务：`systemctl stop frpc`或`service frpc stop`
手动重启frpc服务：`systemctl restart frpc`或`service frpc restart`
查看frpc运行状态：`systemctl status frpc`或`service frpc status`
**关闭frpc开机启动**：`systemctl disable frpc`
## 8. 内网服务器B设置frpc开机自启动
创建start_frp.sh文件：`vi start_frp.sh`，内容如下（注释不可删除）：  
```bash
#!/bin/sh
### BEGIN INIT INFO
# Provides:          svnd.sh
# Required-start:    $local_fs $remote_fs $network $syslog
# Required-Stop:     $local_fs $remote_fs $network $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: starts the svnd.sh daemon
# Description:       starts svnd.sh using start-stop-daemon
### END INIT INFO
/home/myserver/frp_linux_amd64/frpc -c /home/myserver/frp_linux_amd64/frpc.ini
```
给予执行权限： `chmod 775 start_frp.sh`  
复制到指定位置：  `sudo cp ./start_frp.sh /etc/init.d/`  
刷新即可：  `sudo update-rc.d start_frp.sh defaults 90`  
重启即可发现自启动进程：  `ps -ef | grep frp`  
**取消frpc自启动（/etc/init.d/）**   
```bash
sudo rm /etc/init.d/start_frp.sh
sudo update-rc.d -f start_frp remove
```
## 6. SSH保活的几种方法
见[ssh保活](https://blog.whuzfb.cn/blog/2020/07/05/ubuntu_commands/#2-ssh%E4%BF%9D%E6%B4%BB%E7%9A%84%E5%87%A0%E7%A7%8D%E6%96%B9%E6%B3%95)
## 7. 测试内网穿透
保证`frps.service`与`frpc.service`处于运行状态，用户C（可以是linux系统、Windows系统等）在本机使用ssh命令即可连接到内网服务器B：  
* 使用如下代码来远程ssh连接内网服务器B  
`ssh -p 8000 myserver@67.89.12.34`  
* 使用如下代码来将内网服务器B的`/home/myserver/test.txt`文件下载到用户C的机器上  
`scp -P 8000 myserver@67.89.12.34:/home/myserver/test.txt ./Desktop/`  
