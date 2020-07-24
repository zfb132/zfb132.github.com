---
layout: post
title: 远程访问安装xfce4的内网服务器
subtitle: "内网服务器是已安装xfce4的Linux系统"
category : [Ubuntu,Windows]
tags : [Ubuntu,Windows]
date:       2020-07-05 14:18:04 +08:00
author:     "晨曦"
header-img: "/img/post/ubuntu-canonical-bg.png"
description:  "用户在其他地方可以通过云主机随时随地对内网服务器进行ssh访问或打开其软件"
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
手动配置安全组，放通7000、8000-8100端口的TCP连接（端口可任意设置，不与其他服务冲突即可）
7000端口用于服务端（frps.ini中的bind_port）与客户端（frpc.ini中的server_port）建立基本通信、鉴权等
         一个服务端可以用同一个端口连接不同的客户端
8000-8100端口用来进行转发，只在客户端的配置文件frpc.ini中设置remote_port，每个端口转发不同的服务
         可以是一台内网服务器有多个服务；也可以是多台内网服务器，每台有不同数量的服务
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

## 2. 云主机A安装与启动frps
步骤见[云主机安装frp-server](https://blog.whuzfb.cn/blog/2020/07/05/frp_install/#2-%E4%BA%91%E4%B8%BB%E6%9C%BAa%E4%B8%8B%E8%BD%BD%E5%92%8C%E9%85%8D%E7%BD%AEfrp-server)
## 3. 客户端B下载与配置frpc
在github仓库[frp](https://github.com/fatedier/frp/releases)根据本机版本（64位linux）下载`linux-amd64`版本（不需要客户端与云主机的CPU位宽一致，但是frp的版本号尽量保持一致），解压为文件夹`frp_linux_amd64`并放在`/home/myserver/`目录下，在`frp_linux_amd64`文件夹创建`log`目录用于保存日志。修改`frpc.ini`文件为如下  
```conf
[common]
# 云主机A的公网ip
server_addr = 67.89.12.34
# 与云主机端frps.ini文件中的bind_port保持一致
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
# 保证所有的客户端Bi的所有frpc.ini文件中的配置端的名称都不要重复
[ssh_B1_01]
# 协议默认tcp,可选tcp,udp,http,https,stcp,xtcp
type = tcp
# 本地地址
local_ip = 127.0.0.1
# 本地端口
local_port = 22
# 在服务器端开启的远程端口，即用户使用自己电脑ssh连接时的端口
remote_port = 8000
```
## 4. 设置frpc开机自启动（systemd）
打开`frp_linux_amd64`文件夹下的`systemd`目录，编辑`frpc.service`文件（`frpc@.service`文件只是多了个自定义ini文件的功能），将其中的`user=nobody`改为`user=myserver`（即本机的一个用户名），**如果不改，启动时候会报错无法写入日志文件，权限禁止**  
然后修改`ExecStart、ExecReload`中的路径为自己的文件路径  
将修改后的`frpc.service`文件复制到`/etc/systemd/system/`：`sudo cp ./frpc.service /etc/systemd/system/`  
激活frpc开机启动：`systemctl enable frpc`  
手动运行frpc服务：`systemctl start frpc`或`service frpc start`  
手动停止frpc服务：`systemctl stop frpc`或`service frpc stop`  
手动重启frpc服务：`systemctl restart frpc`或`service frpc restart`  
查看frpc运行状态：`systemctl status frpc`或`service frpc status`  
关闭frpc开机启动：`systemctl disable frpc`  
## 5. 测试ssh连接内网机器
保证`frps.service`与`frpc.service`处于运行状态，用户C在本机使用ssh命令即可连接到内网服务器B：  
* 使用如下代码来远程ssh连接内网服务器B  
`ssh -p 8000 myserver@67.89.12.34`  
* 使用如下代码来将内网服务器B的`/home/myserver/test.txt`文件下载到用户C的机器上  
`scp -P 8000 myserver@67.89.12.34:/home/myserver/test.txt ./Desktop/`  

## 6. 安装Xming
从官网下载[Xming软件](https://nchc.dl.sourceforge.net/project/xming/Xming-mesa/6.9.0.31/Xming-mesa-6-9-0-31-setup.exe)，也可选择[蓝奏云下载](https://zfb132.lanzous.com/iOOxeebj4qj)，然后正常安装即可。安装完成后打开XLaunch保持默认配置一直下一步到完成即可，具体来说就是  
* `Select display settings`为`Multiple windows`，`display number`为`0`
* `Select how to star Xming`选择`Start no client`
* `Specified parameter settings`设置为`选中Clipboard`，其他不选或不填
* `Configuration complete`选择`Save configuration`，自己保存到喜欢的位置

然后打开`Xming`软件，保持运行在后台
## 7. 安装及配置Putty
从官网下载[Putty软件](https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html)并安装，也可选择[蓝奏云下载](https://zfb132.lanzous.com/idaa3ebj52b)（移除文件的`.txt`后缀，双击安装即可），打开`C:\Program Files\PuTTY\`文件夹双击`putty.exe`软件，在弹出界面依次设置  
1. `Session`选项：`Host Name`填写`67.89.12.34`，`Port`填写`8000`
2. `Connection`的`Data`选项：`Auto-login username`填写`myserver`
3. `SSH`的`X11`选项：选中`Enable X11 Forwarding`，`X display location`填写`localhost:0.0`，`Remote X11 authentication protocol`选中`MIT-Magic-Cookie-1`
4. `Session`选项：`Saved Sessions`填写你要保存的配置名字`MyServerConf`，然后点击右侧的`Save`按钮即可保存成功

此时即在ssh登录到目标机器后，使用代码将`xfce4`的窗口显示到本机的`Xming`软件中，并可以进行交互
## 8. 配置Putty一键打开内网机器的软件
首先依次创建两个`.sh`脚本（它们会被`putty`发送到目标机器上，在登录ssh成功后立即自动执行），这里的两个文件都是示例  
文件`start_chrome.sh`，内容如下：  
```bash
#!/bin/bash
google-chrome
```
文件`start_display.sh`，内容如下：  
```bash
#!/bin/bash
cd Desktop/mywindowmanager/
./display.sh
```
将它们放置在`C:\Program Files\PuTTY\`文件夹下，即与`putty.exe`文件同级（只是为了方便）  
然后在其他位置创建一个启动软件的批处理文件`start_auto_putty.bat`，内容如下：  
```bat
cd "C:\Program Files\PuTTY"
:: putty.exe -load MyServerConf -pw Myser123456ver -m start_chrome.sh
putty.exe -load MyServerConf -pw Myser123456ver -m start_display.sh
```
`putty.exe`的`-pw`选项后跟服务器的密码，至于服务器的ip、登录端口和用户名均在`MyServerConf`保存；`-m`选项表示ssh连接成功后立即在服务器上执行的脚本  
最后，双击批处理文件`start_auto_putty.bat`，即可自动打开装有xfce4的服务器上指定的GUI程序
## 注意事项
如果遇到显示GUI报错  
```txt
Gdk-CRITICAL **: file gdkfont.c: 1ine 237 (gdk_font_ref): assertion `font !=NULL` failed.
Gdk-CRITICAL **: file gdkfont.c: line 335 (gdk_string_width): assertion `font !=NULL` failed.
Gdk-CRITICAL **: file gdkfont.c: line 411 (gdk_text_width_wc): assertion `font !=NULL` failed.
```
可能需要[安装VcXsrv](https://sourceforge.net/projects/vcxsrv/files/vcxsrv/)来作为显示管理器，下载最新版本（ 目前64位版本1.20.8.1）并安装（第6步也就不需要了）  
打开目录下的`C:\Program Files\VcXsrv\xlaunch.exe`软件，配置各项设置然后保存，可参考如下内容来配置选项（也可直接复制下面内容并创建文件`VcXsrv.xlaunch`，将内容写入保存）  
```xml
<?xml version="1.0" encoding="UTF-8"?>
<XLaunch 
    WindowMode="MultiWindow" 
    ClientMode="NoClient" 
    LocalClient="False" 
    Display="-1" 
    LocalProgram="xcalc" 
    RemoteProgram="xterm" 
    RemotePassword="" 
    PrivateKey="" 
    RemoteHost="" 
    RemoteUser="" 
    XDMCPHost="" 
    XDMCPBroadcast="False" 
    XDMCPIndirect="False" 
    Clipboard="True" 
    ClipboardPrimary="True" 
    ExtraParams="" 
    Wgl="False" 
    DisableAC="False" 
    XDMCPTerminate="False"
/>
```