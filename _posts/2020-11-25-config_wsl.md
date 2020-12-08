---
layout: post
title: 适用于Windows的Linux子系统WSL介绍
subtitle: "WSL可以作为平时替代linux的工具，在Windows上办公，WSL编写和运行示例"
category : [Windows,Ubuntu,Linux]
tags : [Windows,Ubuntu,Linux]
date:       2020-11-25 12:20:52 +08:00
author:     "晨曦"
header-img: "/img/post/win10-bg.jpg"
description:  "WSL实在是太好用了"
---
  
# 目录
{: .no_toc}

* 目录
{:toc}

## 1. 开启和简单使用
[参考链接：安装vscode和wsl子系统](https://blog.whuzfb.cn/blog/2020/07/04/itensor_vscode/#1-%E5%AE%89%E8%A3%85vscode%E5%92%8Cwsl%E5%AD%90%E7%B3%BB%E7%BB%9F)，忽略其中的VSCode部分即可
## 2. WSL配置选项
详见网页[wsl-config](https://docs.microsoft.com/zh-cn/windows/wsl/wsl-config#configure-per-distro-launch-settings-with-wslconf)

## 3. 升级WSL 2
如果在Powershell输入命令：`wsl --list --verbose`发现自己安装的Linux子系统是1.0版本  
```txt
PS C:\Users> wsl --list --verbose
  NAME            STATE           VERSION
* Ubuntu-20.04    Stopped         1
  Ubuntu-18.04    Stopped         1
PS C:\Users> wsl --set-default-version 2
错误: 0x1bc
有关与 WSL 2 的主要区别的信息，请访问 https://aka.ms/wsl2
```
升级按照[教程](https://docs.microsoft.com/zh-cn/windows/wsl/install-win10#set-your-distribution-version-to-wsl-1-or-wsl-2)，即下载安装linux内核[升级包](https://docs.microsoft.com/zh-cn/windows/wsl/wsl2-kernel)，安装完毕后输入命令：`wsl --set-version Ubuntu-20.04 2`  
```txt
PS C:\Users> wsl --set-version Ubuntu-20.04 2
正在进行转换，这可能需要几分钟时间...
有关与 WSL 2 的主要区别的信息，请访问 https://aka.ms/wsl2
转换完成。
```
转换过程大约需要三分钟左右，耐心等待即可
## 4. WSL 2的网络代理
### 4.1 终端代理
打开文件`~/.zshrc`，追加以下内容：  
```bash
# win10 主机 IP 保存在 /etc/resolv.conf 中
# 保证win10的代理软件，开启Allow LAN，开启Mixed Port在7890端口
# 测试不要用ping（ICMP报文），因为会被主机禁止，改用curl -v
export hostip=$(cat /etc/resolv.conf | grep -oP '(?<=nameserver\ ).*')
# 创建命令用于启动代理
alias setproxy='export https_proxy="http://${hostip}:7890";export http_proxy="http://${hostip}:7890";export all_proxy="socks5://${hostip}:7890";'
# 创建命令用于关闭代理
alias unsetproxy='unset https_proxy;unset http_proxy;unset all_proxy;'
# 默认开启代理
setproxy
```
### 4.2 git代理
* 创建文件`~/git-proxy-wrapper`，写入以下内容：  
```bash
#!/bin/bash
nc -x127.0.0.1:10800 -X5 $*
```
* 赋予可执行权限：`chmod +x ~/git-proxy-wrapper`
* 打开文件`~/.ssh/config`，添加以下内容  
```conf
Host github
    HostName github.com
    User git
    # ProxyCommand nc -X 5 -x 127.0.0.1:10800 %h %p
    ProxyCommand /home/zfb/git-proxy-wrapper '%h %p'
```
## 5. GUI界面
在Win10安装[VcXsrv软件](https://sourceforge.net/projects/vcxsrv/files/vcxsrv/)，创建配置文件`VcXsrv-WSL2.xlaunch`并双击打开，内容如下：  
{% highlight xml %}
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
    DisableAC="True" 
    XDMCPTerminate="False"/>
{% endhighlight %}

然后在WSL的终端输入以下命令：  
`export DISPLAY="$(awk '/nameserver/ { print $2 }' < /etc/resolv.conf)":0`  
此时，可以在WSL2终端运行需要GUI支持的软件，例如：  
```bash
# 安装软件mousepad，该软件需要GUI
sudo apt install mousepad -y
# 打开软件
mousepad hello.txt
```