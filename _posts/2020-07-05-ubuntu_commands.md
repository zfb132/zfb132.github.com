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
### 3.6 文件系统设置所有者
* chown命令用于设置文件（或文件夹）的所有者和文件关联组，文件支持通配符，只有**超级用户**才可以执行此命令。使用方法如下：  
```bash
# -R表示递归执行，test是当前目录下的一个文件夹，前一个zfb表示用户名，后一个zfb表示用户组
# 该命令会把test目录及其子目录下的所有文件的owner改为zfb，group也改为zfb
sudo chown -R zfb:zfb test
```
* chgrp命令用于改变文件（或文件夹）的所属组，普通用户即可执行此命令，如：  
```bash
# -R表示递归执行，test是当前目录下的一个文件夹，mygrp1表示用户组
# 该命令会把test目录及其子目录下的所有文件的group改为mygrp1
chgrp -R mygrp1 test
```
* chmod命令用于改变文件（或文件夹）的权限，普通用户即可执行此命令，如：  
```bash
# -R表示递归执行，test是当前目录下的一个文件夹
# 该命令会把test目录及其子目录下的所有文件的权限改为777，这是用数字来设定权限的方法
# 777三个数字分别对应：文件拥有者u的权限、与拥有者同组g的用户的权限、其他用户o的权限
# 7是十进制表示，原始二进制为111，分别对应：读取r、写入w、执行x；1表示允许，0表示禁止
chmod -R 777 test
# chmod命令也可以用字母设定权限
# u 表示文件所有者；g 表示文件所属的组；o 表示其他用户；a 表示系统的所有用户
# r 表示可被读取；w 表示可被写入；x 表示可被执行
# + 表示增加某个（多个）权限；- 表示删除某个（多个）权限；= 表示撤销原来的所有权限，只设定某个（多个）权限
# 例如：为文件添加可执行权限，若不指明用户的话默认为系统所有用户
# 下面命令等价于 chmod a+x stop.sh
chmod +x stop.sh
# 例如：为文件属主和同组用户增加写权限，为其他用户删除执行权限
chmod ug+x,o-x test.txt
# 例如：撤销原来的文件权限，只为文件设置可读写权限
chmod u=rw name.txt
```
### 3.7 测试某个用户是否可以访问文件夹
使用如下命令：  
`sudo -u www-data stat /home/ubuntu/frp/log`  
如果具有权限则显示类似输出：  
```txt
  File: /home/ubuntu/frp/log/
  Size: 4096            Blocks: 8          IO Block: 4096   directory
Device: fc01h/64513d    Inode: 529293      Links: 2
Access: (0777/drwxrwxrwx)  Uid: (  500/  ubuntu)   Gid: (  500/  ubuntu)
Access: 2020-09-28 15:56:40.902601841 +0800
Modify: 2020-09-28 16:32:40.728799201 +0800
Change: 2020-09-28 16:32:40.728799201 +0800
 Birth: -
```
否则显示：  
```txt
stat: cannot stat '/home/ubuntu/frp/log/': Permission denied
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
## 11. 查找文件
find命令可以在指定目录及其子目录下查找指定扩展名的文件，如下所示是在当前目录及子目录下查找JPG文件，并把它们移动到当前目录：  
`find . -name "*.JPG" -exec mv {} ./ \;`  
`find .`表示在当前目录及其子目录下查找  
`-name "*.JPG"`表示只搜索扩展名为JPG的文件  
`-exec `后面接bash命令，表示对文件进行的操作  
`{}`指代找到的每一个文件  
`\;`bash命令的结尾需要添加`;`，这里需要转义  
## 12. swap分区操作
### 12.1 增加分区大小
系统默认已经有了swap分区，但是运行某些程序很耗内存，想临时添加swap分区大小：  
```bash
# 创建交换分区的文件：增加64G=65536M大小的交换分区，则命令写法如下
# 其中的bs等于想要的块大小，of是交换文件的名称和位置
# 以下命令如果提示权限不足，加上sudo
dd if=/dev/zero of=/home/swap bs=1M count=65536
# 设置交换分区文件，建立swap的文件系统
mkswap /home/swap
# 如果提示 swapon: /home/swap: insecure permissions 0644, 0600 suggested.
chmod -R 0600 /home/swap
# 立即启用交换分区文件，swapon -p 2 /home/swap可以设置该swap的优先级
swapon /home/swap
# 如果还需要使系统开机时自动启用，在文件/etc/fstab中添加一行：
# /home/swap swap swap defaults 0 0
```
此时可以查看分区大小是否添加成功（系统原始的交换空间是swap分区，大小为64G）：  
```txt
zfb@myServer:~$ free -m
              total        used        free      shared  buff/cache   available
Mem:         128804       77303         590          78       50910       50386
Swap:        126570         387      126183
zfb@myServer:~$ cat /proc/swaps
Filename         Type         Size       Used       Priority
/dev/sda2        partition    62499836   397288     -2
/home/swap       file         67108860   0          -3
zfb@myServer:~$ 
```
这里的`cat /proc/swaps`命令等价于`swapon -s`，在使用多个swap分区或者文件的时候，还有一个优先级的概念，值越大优先级越高（-1的优先级最高，-1表示在安装系统时创建的）。设置swap分区时未指定优先级，则将优先级分配为-1，后添加的swap则依次为-2，-3；而用户指定优先级时必须以正数表示，也就是说用户指定的优先级必然高于系统优先级  
内核在使用swap空间的时候总是先使用优先级高的空间，后使用优先级低的；如果把多个swap空间的优先级设置成一样的，那么两个swap空间将会以轮询方式并行进行使用；如果两个swap放在两个不同的硬盘上，相同的优先级可以起到类似RAID0的效果
### 12.2 删除自己添加的swap文件
按照以下操作：  
```bash
# 关闭指定swap，swapoff -a表示关闭所有
swapoff /home/swap
# 如果增加分区有设置开机自动挂载，就需要删除或者注释文件/etc/fstab中的对应行
# 正常删除文件即可
rm /home/swap
```
### 12.3 设置swap的使用情况
按照如下方法设置即可：  
```bash
# 查看系统默认的 swappiness 值
# swappiness=0   表示最大限度使用物理内存
# swappiness=100 表示积极的使用swap分区
cat /proc/sys/vm/swappiness
# 修改swappiness值为10，临时性的修改，重启系统后会恢复默认值
sudo sysctl vm.swappiness=10
# 永久修改swappiness，打开文件/etc/sysctl.conf
# 在文件最后添加一行  vm.swappiness = 10
sudo vi /etc/sysctl.conf
# 使修改立即生效
sudo sysctl -p
```
## 13 查看历史登录记录
### 13.1 使用last命令
使用命令`last`即可列出所有相关信息  
```txt
zfb@myServer:~$ last
zfb      pts/2        127.0.0.1        Sat Sep  5 12:29   still  logged in
zfb      pts/1        :pts/0:S.0       Sat Sep  5 09:23   still  logged in
zfb      pts/1        :pts/0:S.0       Thu Sep  3 22:38 - 22:38  (00:00)
zfb      pts/1        127.0.0.1        Wed Jul  8 17:20 - 17:21  (00:00)
user1    pts/0        127.0.0.1        Wed Jul  8 17:07 - 17:21  (00:13)
user2    pts/0        127.0.0.1        Wed Jul  8 15:49 - 15:49  (00:00)
zfb      pts/0        127.0.0.1        Wed Jul  8 15:42 - 15:45  (00:03)
reboot   system boot  4.15.0-108-gener Wed Jul  8 15:40 - 12:00  (10+20:20)
zfb      pts/2        127.0.0.1        Wed Jul  8 15:19 - 15:20  (00:00)
user2    :0           :0               Wed Jul  8 15:00 - down   (00:38)
reboot   system boot  4.15.0-108-gener Wed Jul  8 22:09 - 14:48  (-7:21)
reboot   system boot  4.15.0-108-gener Wed Jul  8 21:28 - 21:29  (00:00)

wtmp begins Wed Jul  8 21:28:47 2019
```
### 13.2 使用awk命令
#### 13.2.1 awk命令详解
假定`test.txt`文件内容如下：  
```txt
Aug 28 19:38:01 localhost CRON[12375]: pam_unix(cron:session): session closed for user root
Aug 28 19:39:01 localhost CRON[12511]: pam_unix(cron:session): session opened for user root by (uid=0)
Aug 28 19:39:01 localhost CRON[12511]: pam_unix(cron:session): session closed for user root
Aug 28 19:39:13 localhost sshd[12493]: Invalid user admin from 25.67.84.30 port 1345
Aug 28 19:39:14 localhost sshd[12493]: pam_unix(sshd:auth): check pass; user unknown
Aug 28 19:39:16 localhost sshd[12493]: Failed password for invalid user admin from 25.67.84.30 port 1345 ssh2
Aug 28 19:39:32 localhost sshd[12493]: Disconnecting invalid user admin 25.67.84.30 port 1345: Change of username not allowed
Aug 28 19:39:44 localhost sshd[12596]: pam_unix(sshd:auth): check pass; user unknown
Aug 28 19:40:27 localhost sshd[12679]: Failed password for root from 34.56.78.90 port 6666 ssh2
Aug 28 19:40:31 localhost sshd[12679]: Failed password for root from 78.90.12.34 port 8888 ssh2
Aug 28 19:40:53 localhost sshd[12741]: Invalid user admin from 12.34.56.78 port 3810
Aug 28 19:40:56 localhost sshd[12741]: Failed password for invalid user admin from 12.34.56.78 port 3810 ssh2
Aug 28 19:40:58 localhost sshd[12741]: Disconnecting invalid user admin 12.34.56.78 port 3810
Aug 28 19:41:01 localhost CRON[1316]: pam_unix(cron:session): session opened for user root by (uid=0)
Aug 28 19:41:01 localhost CRON[2316]: pam_unix(cron:session): session closed for user root
Aug 28 19:41:10 localhost sshd[3328]: Invalid user user from 12.34.56.78 port 9999
Aug 28 19:41:11 localhost sshd[4328]: pam_unix(sshd:auth): check pass; user unknown
Aug 28 22:34:58 localhost sshd[18689]: Failed password for root from 199.200.201.202 port 33667 ssh2
Aug 28 22:56:22 localhost sshd[18560]: Failed password for invalid user pi from 18.19.20.21 port 22222 ssh2
Aug 28 22:56:23 localhost sshd[18561]: Failed password for invalid user pi from 78.56.34.21 port 41568 ssh2
Aug 28 22:06:48 localhost sshd[18943]: Failed password for invalid user ubnt from 66.88.99.44 port 33444 ssh2
Aug 28 22:06:48 localhost sshd[18944]: Failed password for root from 193.116.1.108 port 54360 ssh2
Aug 28 22:06:48 localhost sshd[18945]: Failed password for root from 193.116.1.108 port 54362 ssh2
Aug 28 22:06:49 localhost sshd[18942]: Failed password for root from 193.116.1.108 port 54358 ssh2
Aug 28 22:11:46 localhost sshd[18589]: Failed password for root from 18.19.12.20 port 6688 ssh2
Aug 28 22:24:08 localhost sshd[18213]: Failed password for root from 185.2.99.114 port 9988 ssh2
```
如下所示是一个常用的awk命令的语法  
```bash
awk '{print $1, $4}' test.txt
```
需要注意的是，awk后面的语句`{print $1, $4}`必须用单引号括起来（这表明是行匹配模式，即对文件中匹配到的每一行执行操作`print $1, $4`），而且awk默认以空格对每一行进行分割并执行对应语句  
awk的语句**完整流程**为`BEGIN{print "这是匹配前执行的，一般是表头"}{print NR,$1,$2}END{printf("统计完毕")}`，`BEGIN`和`END`语句可以省略  
awk的**条件**语句`{if($1>3) print $1;else if($2==6) print $4;else print "hh"}`  
`OFS ORS OFMT`等可以在**BEGIN模块**设置，例如`awk 'BEGIN{FS=",";OFMT="%.3f"} {print $1,$2}' test.txt`  
* `print`语句内部支持`+-*/`等基础运算
* `printf("%d--%d\n", $1,$2)`命令与C语言的使用方法类似
* 如果要使用逗号进行行分割则`awk -F, '{print $1, $4}' test.txt`
* `$0`表示整行数据，`$1`表示每行的第一部分（按照规则对行分割后的集合），称为第一个**字段**，以此类推；另外，匹配到的第一行称为第一条**记录**
* `NR`表示当前行的数字（即这在`test.txt`中是第几行），`NF`表示当前行的长度，`FNR`表示当前行的数字（即这在匹配记录中是第几行），`FILENAME`表示当前文件的名称，`FS`表示分隔符（把一行数据分割成`$1`到最后）
* 创建变量`a`并设置a的值，则使用`awk -va=1 '{print $2,$2+a}' test.txt`
* `OFS`设置所有输出**字段**分隔符，如果要使得在`print`时候`$i`之间的默认空格改为其他分割则使用`awk -va=1 '{print $2,$2+a}' OFS=", " test.txt`
* 设置某两个字段之间的连接符，使用代码`awk '{print NR, $1"-"$2, $11}' test.txt`，则字段1和2输出时使用`-`连接
* `ORS`设置所有输出**记录**分隔符，如果要使得在`print`时候不同行之间的默认空格改为其他分割则使用`awk -va=1 '{print $2,$2+a}' ORS="\n\n " test.txt`
* `OFMT`设置所有小数的显示格式，默认为`%.6g`，若显示3位小数则`awk '{print NR, $11, $13":"$15, 1/2}' OFMT="%.3f"`

例如执行命令`grep "Failed password for invalid user" test.txt | awk 'BEGIN{printf("%-10s %-10s %-20s\n", "number", "user", "IP:Port")}{printf "%-10s %-10s %-20s\n", FNR, $11, $13":"$15}END{printf("搜索结束，共找到%d条记录", FNR)}'`  
则输出如下内容，使用`":"`指定`$13`和`$15`字段的连接，如果用`,`则使用默认字段连接符（空格）：  
```txt
number     user       IP:Port
1          admin      25.67.84.30:1345
2          admin      12.34.56.78:3810
3          pi         18.19.20.21:22222
4          pi         78.56.34.21:41568
5          ubnt       66.88.99.44:33444
搜索结束，共找到5条记录
```
#### 13.2.2 awk过滤并输出记录
**查看系统的登陆失败的用户及IP信息**（只输出ssh连接时的用户名不存在的情况）：  
`sudo grep "Failed password for invalid user" /var/log/auth.log | awk 'BEGIN{printf("%-10s %-10s %-20s\n", "number", "user", "IP:Port")}{printf "%-10s %-10s %-20s\n", FNR, $11, $13":"$15}END{printf("搜索结束，共找到%d条记录", FNR)}'`  
输出示例：  
```txt
number     user       IP:Port
1          admin      25.67.84.30:1345
2          admin      12.34.56.78:3810
3          pi         18.19.20.21:22222
4          pi         78.56.34.21:41568
5          ubnt       66.88.99.44:33444
搜索结束，共找到5条记录
```
**查看所有登陆失败的信息**：  
```bash
# 首先从log文件提取出所有包含Failed password for字符串的行作为awk的输入
# 然后输出一行表头，并开始执行行匹配
# match函数的第二个参数是正则表达式（用//包围起来），如果未找到,返回0
# 有如下三种情况，前两个分别对应awk里面的if命令，第三种情况被过滤了
# Aug 28 22:11:46 localhost sshd[18589]: Failed password for root from 18.19.12.20 port 6688 ssh2
# Aug 28 22:56:22 localhost sshd[18560]: Failed password for invalid user pi from 18.19.20.21 port 22222 ssh2
# Sep 16 17:29:04 localhost sudo:   ubuntu : TTY=pts/0 ; PWD=/home/ubuntu ; USER=root ; COMMAND=/bin/grep : Failed password for /var/log/auth.log
# 因为在执行awk的同时会在auth.log生成一条记录如下，所以需要if(length($13)>4)这个判断
# Sep 16 17:10:31 localhost sudo:   ubuntu : TTY=pts/0 ; PWD=/home/ubuntu ; USER=root ; COMMAND=/bin/grep Failed password for /var/log/auth.log
sudo grep "Failed password for" /var/log/auth.log | awk 'BEGIN{printf("%-10s %-10s %-20s\n", "number", "user", "IP:Port")}{if(match($11, /\./)!=0) printf "%-10s %-10s %-20s\n", FNR, $9, $11":"$13;else if(length($13)>4) printf "%-10s %-10s %-20s\n", FNR, $11, $13":"$15}END{printf("搜索结束，共找到%d条记录\n", FNR)}'
```
输出示例：  
```txt
number     user       IP:Port
1          admin      25.67.84.30:1345
2          root       34.56.78.90:6666
3          root       78.90.12.34:8888
4          admin      12.34.56.78:3810
5          root       199.200.201.202:33667
6          pi         18.19.20.21:22222
7          pi         78.56.34.21:41568
8          ubnt       66.88.99.44:33444
9          root       193.116.1.108:54360
10         root       193.116.1.108:54362
11         root       193.116.1.108:54358
12         root       18.19.12.20:6688
13         root       185.2.99.114:9988
搜索结束，共找到13条记录
```
**注意**：此命令也可以写成脚本形式  
```bash
# 创建awk脚本文件并写入内容
vim sshinfo.awk
# 授予执行权限
chmod +x sshinfo.awk
# 执行命令，对于CentOS系统为/var/log/secure文件
sudo grep "Failed password for" /var/log/auth.log | ./sshinfo.awk
```
sshinfo.awk的文件内容如下：  
```bash
#! /usr/bin/awk -f
BEGIN{
    printf("%-10s %-10s %-20s\n", "number", "user", "IP:Port")
}
{
    if(match($11, /\./)!=0)
        printf "%-10s %-10s %-20s\n", FNR, $9, $11":"$13;
    else if(length($13)>4)
        printf "%-10s %-10s %-20s\n", FNR, $11, $13":"$15
}
END{
    printf("搜索结束，共找到%d条记录\n", FNR)
}
```
**查看系统的登陆成功的用户及IP信息**：  
`sudo grep "Accepted password for" /var/log/auth.log | awk 'BEGIN{printf("%-10s %-10s %-20s\n", "number", "user", "IP:Port")}{printf "%-10s %-10s %-20s\n", FNR, $11, $13":"$15}END{printf("搜索结束，共找到%d条记录", FNR)}'`  
输出示例：  
```txt
number     user       IP:Port
1          zfb        11.11.11.11:8888
2          zfb        11.11.11.11:8888
3          zfb        11.11.11.11:8888
4          root       11.11.11.11:8888
搜索结束，共找到4条记录
```
**查看系统登陆失败的次数及对应的IP**：  
`sudo grep "Failed password for" /var/log/auth.log | awk '{if(match($11, /\./)!=0) print $11}' | sort | uniq -c | sort -nr | more`
## 14 使用FTP下载文件
FTP（文件传输协议）是一个较老且最常用的标准网络协议，用于在两台计算机之间通过网络上传/下载文件。它通过用户凭证（用户名和密码）传输数据，没有进行加密。它是一个8位的客户端-服务器协议，能操作任何类型的文件而不需要进一步处理，就像MIME或Unicode一样。但是，FTP有着极高的延时，这意味着，从开始请求到第一次接收需求数据之间的时间，会非常长；并且不时的必须执行一些冗长的登录进程  
一般运行在20和21两个端口。端口20用于在客户端和服务器之间传输数据流，而端口21用于传输控制流，并且是命令通向ftp服务器的进口。当数据通过数据流传输时，控制流处于空闲状态。而当控制流空闲很长时间后，客户端的防火墙会将其会话置为超时  
FTP URL的格式在[RFC 1738](https://tools.ietf.org/html/rfc1738)指定，格式为：`ftp://[user[:password]@]host[:port]/url-path`  
首先确保系统已经安装`ftp`命令：  
`sudo apt-get install ftp`  
此`ftp`命令的使用方法为，在终端输入以下命令（域名或IP地址或完整FTP网址都可以）：  
`ftp ftp.ngdc.noaa.gov`  
一般公开的FTP资源下载站点的用户名都是`anonymous`，密码是空，登录成功后即可打开交互终端  
```text
[zfb@myServer ~]# ftp ftp.ngdc.noaa.gov
Connected to ftp.ngdc.noaa.gov (140.172.190.215).
220-                     ----- Notice -----
220-
220- Questions/Problems should be directed to ngdc.webmaster@noaa.gov
220
Name (ftp.ngdc.noaa.gov:root): anonymous
331 Please specify the password.
Password:
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> ls
227 Entering Passive Mode (140,172,190,215,188,178).
150 Here comes the directory listing.
-rw-rw-r--    1 ftp      ftp          1516 Feb 04  2016 INDEX.txt
-rw-rw-r--    1 ftp      ftp          3766 Feb 09  2018 README.txt
-rw-rw-r--    1 ftp      ftp          9036 Feb 04  2016 ftp.html
drwxrwsr-x   11 ftp      ftp            11 Dec 19  2017 geomag
-rw-r--r--    1 ftp      ftp            53 Jul 27  2010 google12c4c939d7b90761.html
lrwxrwxrwx    1 ftp      ftp             8 Aug 01  2011 index.html -> ftp.html
226 Directory send OK.
ftp> cd geomag
250 Directory successfully changed.
ftp> ls
227 Entering Passive Mode (140,172,190,215,74,181).
150 Here comes the directory listing.
drwxrwxr-x   10 ftp      ftp            12 Jul 08  2016 Access_Tools
drwxrwxr-x    4 ftp      ftp             9 Jul 14  2008 Aeromag
226 Directory send OK.
```
在该交互窗口使用命令`lcd /home/zfb/hh/`表示设置下载远程FTP服务器的文件默认保存在本机的`/home/zfb/hh/`目录  
在该交互窗口使用命令`mget *`表示下载当前目录下的所有文件，忽略所有子文件夹  
在该交互窗口使用命令`prompt off`表示关闭下载提示  
**批量遍历下载FTP站点指定目录下的所有数据**：  
`wget -r -nH -P/home/zfb/hh/ ftp://ftp.ngdc.noaa.gov/ionosonde/mids11/GR13L/individual/2019/* --ftp-user=anonymous --ftp-password=`
## 15 切割日志文件
可以分为以下两种：  
* 使用`logrotate`命令：[见教程](https://blog.whuzfb.cn/blog/2020/07/07/web_https/#4-%E4%BD%BF%E7%94%A8logrotate%E8%87%AA%E5%8A%A8%E5%88%87%E5%89%B2%E6%97%A5%E5%BF%97%E6%96%87%E4%BB%B6)
* 切割`nginx`日志文件：[见教程](https://blog.whuzfb.cn/blog/2020/07/07/web_https/#5-%E9%85%8D%E7%BD%AEnginx%E5%88%87%E5%89%B2%E6%97%A5%E5%BF%97%E6%96%87%E4%BB%B6)