---
layout: post
title: 加速github的clone操作的一些方法
subtitle: "主要包括更改host与更换镜像地址的方法"
category : [Ubuntu,Windows,Git]
tags : [Ubuntu,Windows,Git,GitHub]
date:       2020-07-14 19:18:22 +08:00
author:     "晨曦"
header-img: "/img/post/git-bg.jpg"
description:  "经常遇到github下载代码速度在每秒几十KB，这里介绍几种解决办法"
---
  
# 目录
{: .no_toc}

* 目录
{:toc}

## 0. 使用网站加速
打开[github加速下载](https://ghapi.zfb132.workers.dev/)网址，根据页面提示即可使用
## 1. 使用镜像加速源
目前测试结果来看，以下两个加速网站[cnpmjs](https://cnpmjs.org/)、[fastgit](https://github.com.cnpmjs.org/)的效果非常好，具体使用方法是：假如需要下载的仓库地址是[zfb132/WhuHelper](https://github.com/zfb132/WhuHelper)，那么可以采用如下命令进行下载源码   
```
git clone --recursive https://github.com.cnpmjs.org/zfb132/WhuHelper

git clone --recursive https://hub.fastgit.org/zfb132/WhuHelper
```
即只需要替换`github.com`的域名为其他两个网站即可
## 2. 使用代理工具
修改git的配置设置的文件
Git自带一个`git config`的工具来帮助设置控制Git外观和行为的配置变量  
对于**linux系统**而言，这些变量存储在三个不同的位置：  
* `/etc/gitconfig`文件: 包含系统上每一个用户及他们仓库的通用配置。 如果在执行`git config`时带上`--system`选项，那么它就会读写该文件中的配置变量。（由于它是系统配置文件，因此需要管理员或超级用户权限来修改它。）
* `~/.gitconfig`或`~/.config/git/config`文件：只针对当前用户。可以传递`--global`选项让Git读写此文件，这会对系统上所有的仓库生效
* 当前使用仓库的Git目录中的`config`文件（即`.git/config`）：针对该仓库。可以传递`--local`选项让Git强制读写此文件，默认情况下用的就是它

每一个级别会覆盖上一级别的配置，所以`.git/config`的配置变量会覆盖`/etc/gitconfig`中的配置变量

在**Windows系统**中，Git会查找`$HOME`目录下（一般情况下是`C:\Users\$USER\`）的`.gitconfig`文件。Git同样也会寻找`/etc/gitconfig`文件，但只限于MSys的根目录下，即安装Git时所选的目标位置（默认为`C:\Program Files\Git\`）。 如果在Windows上使用Git 2.x以后的版本，还有一个系统级的配置文件，Windows Vista及以后的版本在`C:\ProgramData\Git\config`。此文件只能以管理员权限通过`git config -f <file>`来修改  
对于gitconfig文件的具体修改是一样的，即在文件中添加以下内容（如果没有文件，手动创建）  
```
[http]
    proxy = socks5://127.0.0.1:1080
[https]
    proxy = socks5://127.0.0.1:1080
```
然后保存即可，下次进行`git clone`操作即可享受高速了  
## 3. 使用gitee加速
由于[gitee](https://gitee.com/)是国内的网站，提供与github相似的功能，而且可以直接从githu或gitlab的仓库地址导入新仓库，拉取创建新仓库的速度很快。具体使用方法是：假如需要下载的仓库地址是[zfb132/WhuHelper](https://github.com/zfb132/WhuHelper)，那么可以首先在gitee注册账户，然后导入前面所述的github仓库，等待创建完成（很快），此时即可在gitee下载，包括https、git等下载方式
## 4. 更改hosts文件
windows系统`hosts`文件位于目录：`C:\Windows\System32\drivers\etc\`  
linux系统的`hosts`文件位于目录：`/etc/`  
添加以下内容：  
```txt
140.82.114.3 github.com
199.232.69.194 github.global.ssl.fastly.net 
185.199.108.153 github.com
185.199.109.153 github.com
185.199.110.153 github.com
185.199.111.153 github.com
```
对于windows系统还需要在cmd窗口输入`ipconfig /flushdns`才能使用  
这些ip都是通过网站[ipaddress](https://www.ipaddress.com/)查询得到，也可以通过网站[chinaz](http://ping.chinaz.com/)查询得到最优的那条线路的ip