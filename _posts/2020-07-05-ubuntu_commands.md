---
layout: post
title: Ubuntu系统的常用命令
subtitle: "介绍Ubuntu系统下经常用到的功能"
category : [Ubuntu]
tags : [Ubuntu]
date:       2020-07-05 12:30:04 +08:00
author:     "晨曦"
header-img: "/img/post/ubuntu-canonical-bg.png"
description:  "主要是用户管理、远程访问等命令，基本不包括文件系统的常用命令"
---
  
# 目录
{: .no_toc}

* 目录
{:toc}

## 1. ubuntu桌面版安装ssh
桌面版本的Ubuntu linux系统，默认没有安装ssh服务，可以通过如下命令开启ssh服务：  
```bash
# 安装openssh，如果安装完成，服务默认已经开启，即可远程ssh连接
sudo apt-get install openssh-server
# 查看ssh服务状态
sudo service ssh status
# ssh服务重启命令
sudo service ssh restart
# 编辑ssh服务的配置文件，可以修改服务端口，权限控制等
sudo vim /etc/ssh/sshd_config
```
ssh的配置文件`sshd_config`主要参数说明如下：  
```conf
# 这个是ssh服务的监听端口，在实际生产环境中一般都不用默认的22端口 
Port 22
# AddressFamily 设置为any：默认ipv4和ipv6地址均可连接
AddressFamily any
# ListenAddress 用来设置sshd服务器绑定的IP地址
# ListenAddress 192.168.0.231   表示只监听来自192.168.0.231这个IP的SSH连接
# ListenAddress 0.0.0.0         表示监听所有IPv4的SSH连接
# ListenAddress ::              表示监听所有IPv6的SSH连接
# PermitRootLogin 设置root用户是否运行登录以及登录方式
PermitRootLogin no
# LoginGraceTime 宽限登录时间不输入密码两分钟自动退出
LoginGraceTime 2m
# AllowUsers 只允许特定的一些用户登录（root用户是否可登录要根据PermitRootLogin决定）
# AllowUsers myusername
# 优先级最高，禁止某些用户登录
# DenyUsers  name1
# 允许登陆的用户组
# AllowGroups mygroupname
# 禁止登录的用户组
# DenyGroups groupname1
# 设置sshd是否在用户登录时显示/etc/motd中的信息，可以在其中加入欢迎信息
PrintMotd no
# 是否在ssh登录成功后，显示上次登录信息
PrintLastLog yes
# ssh的服务端会传送KeepAlive的讯息给客户端，以确保两者的联机正常
# 这种消息可以检测到死连接、连接不当关闭、客户端崩溃等异常
# 任何一端死掉后，ssh可以立刻知道，而不会有僵尸程序的发生
TCPKeepAlive yes
```
具体对于`PermitRootLogin`选项来说，它可以设置为以下几个值（其中`without-password`也写为`prohibit-password`），且对于含义如下表：  

参数类别|是否允许ssh登陆|登录方式|交互shell|  
:--:|:--:|:--:|:--:|  
yes|允许|没有限制|没有限制|  
without-password|允许|除密码以外|没有限制|  
forced-commands-only|允许|仅允许使用密钥|仅允许已授权的命令|  
no|不允许|N/A|N/A|  

## 2. SSH保活的几种方法
### 2.1 配置服务器端
SSH总是被强行中断，导致效率低下，可以在服务端配置，让server每隔30秒向client发送一个keep-alive包来保持连接：`sudo vim /etc/ssh/sshd_config`
添加以下内容：  
```conf
ClientAliveInterval 30
ClientAliveCountMax 60
```
然后重启本地ssh：`sudo service ssh restart`  
第一行配置让server每隔30秒向client发送一个keep-alive包来保持连接；第二行配置表示如果连续发送keep-alive包数量达到60次，客户端依然没有反应，则服务端sshd断开连接。如果什么都不操作，该配置可以让连接保持30s*60，即30分钟  

### 2.2 配置客户端
如果服务端没有权限配置，或者无法配置，可以配置客户端ssh，使客户端发起的所有会话都保持连接：`sudo vim /etc/ssh/ssh_config`
添加以下内容：  
```conf
ServerAliveInterval 30
ServerAliveCountMax 60
```
然后重启本地ssh：`sudo service ssh restart`  
本地ssh每隔30s向server端sshd发送keep-alive包，如果连续发送60次，server仍然无回应断开连接
### 2.3 共享ssh连接
如果需要在多个窗口中打开同一个服务器连接，可以尝试添加`~/.ssh/config`，添加以下两行：  
```conf
ControlMaster auto
ControlPath ~/.ssh/connection-%r@%h:%p
```
然后重启本地ssh：`sudo service ssh restart`  
配置之后，第二条连接共享第一次建立的连接，加快速度  
如果希望每次SSH连接建立之后，此条连接会被保持4小时，退出服务器之后依然可以重用，则需要设置：  
`ControlPersist 4h`  
最终，一个示例`~/.ssh/config`文件配置如下:  
```conf
Host *
	ServerAliveInterval 3
	ServerAliveCountMax 20
	TCPKeepAlive no
	ControlMaster auto
	ControlPath ~/.ssh/connection-%r@%h:%p
	ControlPersist 4h
    User zfb
```
### 2.4 ssh连接的同时保活
`ssh -o ServerAliveInterval=60 user@sshserver`
### 2.5 screen命令使用
经常需要SSH远程登录到Linux服务器，运行一些需要很长时间才能完成的任务，比如训练数据集、ftp传输等等。通常情况下都要为每一个这样的任务开一个远程终端窗口，因为它们执行的时间太长了，必须等待它们执行完毕，在此期间不能关掉窗口或者断开连接，否则这个任务就会被杀掉  
使用screen命令可以好、实现会话恢复、会话共享、多窗口等功能  
只要Screen本身没有终止，在其内部运行的会话都可以恢复。这一点对于远程登录的用户特别有用，即使网络连接中断，用户也不会失去对已经打开的命令行会话的控制。只要再次登录到主机上执行screen -r就可以恢复会话的运行  
同样在暂时离开的时候，也可以执行分离命令detach，在保证里面的程序正常运行的情况下切换到后台  
还可以让一个或多个用户从不同终端多次登录一个会话，并共享会话的所有特性（比如可以看到完全相同的输出）。它同时提供了窗口访问权限的机制，可以对窗口进行密码保护  
所有的会话都独立的运行，并拥有各自的编号、输入、输出和窗口缓存。用户可以通过快捷键在不同的窗口下切换，并可以自由的重定向各个窗口的输入和输出。它实现了基本的文本操作，如复制粘贴等；还提供了类似滚动条的功能，可以查看窗口状况的历史记录。窗口还可以被分区和命名，还可以监视后台窗口的活动  
具体使用如下：  
```bash
# 启动一个名字为test_scr的screen，此时会看到新建会话的动作
screen -S test_scr
# 在这个新窗口可以运行任何命令，即使此时命令行在不断刷新输出，也可以执行下一个动作
# 即：按下Ctr+A，再按D，这会把test_scr放入后台，回到之前的窗口
Ctrl+A D
# [detached from 45197.test_scr]
# 列出所有的screen
screen -ls
# There is a screen on:
#        45197.test_scr  (2020年07月17日 14时39分09秒)   (Detached)
# 1 Socket in /run/screen/S-zfb.
# 此时退出登录也不会影响，只需要重新登陆以后，输入以下命令
# 也可以是  screen -r 45197
screen -r test_scr
# 删除某个screen，假设是test_scr；也可以切换到test_scr的screen，快捷键Ctrl+A K
screen -S test_scr -X quit
# 清除处于dead状态的screen
screen -wipe
```
## 3. Ubuntu用户管理
### 3.1 创建用户
创建用户，同时创建该用户主目录、创建用户同名的组（用户名为`username`）  
`sudo adduser username`  
会提示设置密码，其他提示回车即可  
如果需要让此用户有`root`权限，在`root`用户下修改`/etc/sudoers`文件：  
`root@ubuntu:~# sudo vim /etc/sudoers`  
修改文件如下：  
```conf
# User privilege specification
root ALL=(ALL) ALL
username ALL=(ALL) ALL
```
保存退出，`username`用户就拥有了`root`权限  
或者`sudo usermod -a -G sudo username`
### 3.2 切换用户
从当前用户切换到`username`用户的命令：`su username`  
从普通用户切换到`root`用户还可以使用命令：`sudo su`  
在切换用户时，如果想在切换用户之后使用新用户的工作环境，可以在`su`和`username`之间加`-`，例如：`su - root`  
终端的提示符`$`表示普通用户；`#`表示超级用户，即`root`用户  
在终端输入`exit`或`logout`或使用快捷方式`Ctrl+d`，可以**退回到原来用户**  
### 3.3 修改用户密码
修改用户名为`username`的开机登录密码：`sudo passwd username`  
修改root密码（默认root无密码，第一次执行时创建密码）：`sudo passwd root`  
### 3.4 禁用和启用root登录
只是禁用`root`，但是`root`密码还保存着：
`sudo passwd -l root`  
再使用`su root`切换`root`用户发现认证失败  
启用root登录：  
`sudo passwd -u root`  
### 3.5 多用户共享目录
在root用户下创建文件夹，再创建新的用户组，将原有的用户添加进入这个新组。不妨假设，新的用户组为`share_grp`，新的共享文件夹目录为`/home/data_share/`（也可以为`/media/data_share`），需要互相共享的用户为user1、user2，每个用户都可以通过`cd /home/data_share/`访问到此文件夹的内容。具体操作步骤如下：  
* 首先切换当前账户为root账户，然后创建文件夹`mkdir /home/data_share/`
* 然后创建新的用户组share_grp，使用命令`sudo groupadd share_grp`
* 为文件夹更改所属的组`sudo chgrp share_grp /home/data_share`
* 更改文件夹权限`sudo chmod 770 /home/data_share`
* 保证子文件夹也是一样的权限`sudo chmod +s /home/data_share`
* 为用户1添加附属组，不影响用户原来所在的组`sudo usermod -a -G share_grp user1`
* 同理用户2，使用命令`sudo usermod -a -G share_grp user2`

此时，两个用户都可以访问目录`/home/data_share/`，另外，查看用户组相关的命令如下：  
* `groups`：查看当前用户的组
* `cat /etc/group`：查看本机所有用户和组

如果不想继续共享，可以通过在root账户下使用以下命令删除用户1、用户2的附属组（不影响原来所在的组）  
```bash
sudo usermod -G "" user1
sudo usermod -G "" user1
sudo groupdel share_grp
```
## 4. 查看当前活跃的用户
查看所有用户列表  
`cat /etc/passwd|grep -v nologin|grep -v halt|grep -v shutdown|awk -F":" '{ print $1"|"$3"|"$4 }'|more`  
查看当前登录的用户  
`w`  
查看自己登录的用户名  
`whoami`  
## 5. 查看当前占据内存最多的进程信息
将命令组合重命名写入`.bashrc`文件中方便使用：首先`vi ~/.bashrc`，然后将以下内容写入文件末尾  
```bash
alias maxmem="ps -aux|head -1;ps -aux | sort -k4nr | head "
# ps -aux会显示all进程、userid、x指代所有程序
# ps -aux|head -1表示只保留删除结果的第一行，也就是表头
# sort -k4nr命令：r表示是结果倒序排列，n为以数字大小排序
# -k4则是针对第4列的内容进行排序
# maxmem -4表示显示4条结果
```
## 6. ubuntu设置开机自启程序
对于桌面版Ubuntu而言，只需要打开程序列表的图标，选择`启动应用程序、Startup applications`图标，根据提示输入路径即可
## 7. 修改ubuntu显示管理器为lightdm
向日葵这款远程控制软件似乎不支持Ubuntu的原始gdm3的桌面，具体表现为：使用Windows远程到服务器的Ubuntu系统上进行调试，总是出现`连接已断开`；而反过来控制却可以，所以安装lightdm替换默认的桌面显示管理器：  
```bash
sudo apt-get update
sudo apt-get upgrade
# 安装过程中会提示选择默认显示管理器，选择lightdm即可
sudo apt install lightdm
```
然后重启设备，此时再测试即可正常连接  
如果需要卸载lightdm，重新使用gdm3，则只需输入以下命令：  
```bash
# 查看当前使用的显示管理器
cat /etc/X11/default-display-manager
# 重新选择gdm为显示管理器，然后重启
sudo dpkg-reconfigure gdm3
# 卸载lightdm
sudo apt-get --purge remove lightdm
```
## 8. nohup与&的使用
* `nohup`的意思是忽略SIGHUP信号，一般用在正常命令语句之前。如果用户关闭shell, 那么使用`nohup`启动的进程还是存在的（因为关闭终端会发送SIGHUP信号，而nohup对SIGHUP信号免疫）。如果不将`nohup`命令的输出重定向，输出将附加到当前目录的`nohup.out`文件中。如果当前目录的`nohup.out`文件不可写，输出重定向到`$HOME/nohup.out`文件中
* 输出重定向：程序在后台运行的时候，可以把输出重定向到某个文件中，相当于一个日志文件，记录运行过程中的输出。例如`nohup command > out.txt 2>&1 &`命令的意思是
    * 将`command`的输出重定向到`out.txt`文件，即输出内容不打印到屏幕上
	* 0 – stdin (standard input)，1 – stdout (standard output)，2 – stderr (standard error)
	* `2>&1`是将标准错误（2）重定向到标准输出（&1），标准输出（&1）再被重定向输入到`out.txt`文件中

* `&`的意思是在后台运行，一般用在正常命令语句之后。即使用户使用`Ctrl+C`，那么使用`&`启动的程序照样运行（因为对SIGINT信号免疫）

所以可以使用如下命令来实现类似守护进程的功能：  
`nohup command > out.file 2>&1 &`  

## 9. 命令的挂起和前后台切换
Linux提供了`fg`和`bg`命令，可以调度正在运行的任务。假如发现前台运行的一个程序需要很长的时间，但是需要干其他的事情，此时可以用`Ctrl+Z`挂起这个程序，然后可以看到系统提示：  
`[1]+ Stopped /root/bin/rsync.sh`  
然后可以把程序调度到后台执行，使前台可以执行其他任务。该命令的运行效果与在指令后面添加符号`&`的效果是相同的，都是将其放到系统后台执行（bg 后面的数字为作业号）  
```bash
bg 1
# 终端回显如下
# [1]+ /root/bin/rsync.sh &
```
用`jobs`命令查看正在运行的任务（只看当前终端生效的，关闭终端重新打开则无法看到）：  
```bash
jobs
# 终端回显如下
# [1]+ Running /root/bin/rsync.sh &
```
如果想把某个任务调回到前台运行，可以用  
```bash
fg 1
# 终端回显如下
# /root/bin/rsync.sh
```
这样，在终端上就只能等待这个任务完成了
## 10. 远程收发文件
在不安装第三方工具的情况下有两种方法：  
* 使用`scp`命令：例如`scp -P 8899 -r root@45.67.89.12:/root/test/ ./Desktop/`命令表示将服务器的`/root/test/`文件夹递归下载到本地的`./Desktop/`文件夹下面，`8899`是ssh的端口，默认为`22`
* 使用`rsync`命令（支持断点续传）：例如`rsync -avzP --rsh='ssh -p 8899' root@45.67.89.12:/root/test/ ./Desktop`命令表示将服务器的`/root/test/`文件夹下载到本地的`./Desktop/`文件夹下面，`8899`是ssh的端口，默认为`22`

使用[脚本](https://github.com/GitHub30/gdrive.sh)下载Google Drive文件，使用方法为  
`curl gdrive.sh | bash -s https://drive.google.com/file/d/0B4y35FiV1wh7QWpuVlFROXlBTHc/view`