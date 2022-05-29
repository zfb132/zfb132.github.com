---
layout: post
title: Windows常用注册表文件
subtitle: "windows一些比较好用的小技巧"
category : [Windows]
tags : [Windows,REG]
date:       2020-07-02
author:     "晨曦"
header-img: "/img/post/win10-bg.jpg"
description:  "有些软件会不经同意修改右键菜单，有些时候又想自己添加右键菜单，这些功能使用注册表实现很简单方便"
---
  
## 目录
{: .no_toc}

* 目录
{:toc}


## 1. 删除Visual Studio的右键菜单  
创建文件`del-vs-context.reg`，内容如下：  
```reg
Windows Registry Editor Version 5.00

[-HKEY_CLASSES_ROOT\Directory\Background\shell\AnyCode]

[-HKEY_CLASSES_ROOT\Directory\shell\AnyCode]
```
或者直接下载[蓝奏云文件](https://zfb132.lanzous.com/iAjGxe8kdej "del-vs-context.reg")，将下载得到的文件名删除`.txt`后缀，双击即可实现功能  
## 2. 恢复Visual Studio的右键菜单  
如果在上一个操作时忘记提前备份注册表项，有希望恢复注册表的时候。新建注册表文件`backup-vs.reg`，内容如下：
```reg
Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\Directory\Background\shell\AnyCode]
@="@C:\\Program Files (x86)\\Common Files\\Microsoft Shared\\MSEnv\\2052\\\\VSLauncherUI.dll,-1002"

[HKEY_CLASSES_ROOT\Directory\Background\shell\AnyCode\command]
@="\"C:\\Program Files (x86)\\Common Files\\Microsoft Shared\\MSEnv\\\\VSLauncher.exe\" \"%V\" source:ExplorerBackground"


[HKEY_CLASSES_ROOT\Directory\shell\AnyCode]
@="@C:\\Program Files (x86)\\Common Files\\Microsoft Shared\\MSEnv\\2052\\\\VSLauncherUI.dll,-1002"

[HKEY_CLASSES_ROOT\Directory\shell\AnyCode\command]
@="\"C:\\Program Files (x86)\\Common Files\\Microsoft Shared\\MSEnv\\\\VSLauncher.exe\" \"%1\" source:Explorer"
```
或者直接下载[蓝奏云文件](https://zfb132.lanzous.com/iYXRLe8kdfa "backup-vs.reg")，将下载得到的文件名删除`.txt`后缀，双击即可实现功能  
## 3. 右键菜单添加功能
Windows 10系统可以开启`适用于Linux的子系统`，即`WSL`，然后安装ubuntu子系统。此时ubuntu子系统的终端可以在`文件资源管理器`中打开（按住`shift`键的同时，在空白处右键单击，菜单里面可以找到linux的终端），但是操作麻烦  
另外，经常会遇到手机和电脑、不同电脑之间互相收发文件，如果在本地方便的搭建一个http服务来共享文件就会变得很舒服。这个功能可以用python的一行代码`python -m http.server 8080`实现，此代码即可在当前文件夹下，利用本机的8080端口对外提供http服务，当前目录及其子文件夹和文件都可以通过网址访问  
通过编写注册表文件`open-httpserver-here.reg`，可以实现在文件夹上右键点击，在弹出菜单选择`在此处打开http.server`，即可把当前目录作为http服务的首页，其他局域网内的电脑可以使用ip配合端口来访问下载文件。`open-httpserver-here.reg`文件内容如下：  
```reg
Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\Directory\Background\shell\web]
@="在此处打开http.server"

[HKEY_CLASSES_ROOT\Directory\Background\shell\web\command]
@="powershell.exe -noexit -command \"(ipconfig) -match 'IPv4';python -m http.server 8080\""
```
或者直接下载[蓝奏云文件](https://zfb132.lanzous.com/iqboWe8v5eh "open-httpserver-here.reg")，将下载得到的文件名删除`.txt`后缀，双击即可实现功能  
## 4. USB3.0连接安卓手机刷机出现问题  
如果在使用小米刷机助手对手机刷机的时候，将手机通过USB3.0接口连接电脑，出现刷机失败的情况，考虑修改注册表。新建文件`usb-hack.reg`，内容如下：  
```reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\usbflags\18D1D00D0100]
"osvc"=hex:00,00
"SkipContainerIdQuery"=hex:01,00,00,00
"SkipBOSDescriptorQuery"=hex:01,00,00,00

```
或者直接下载[蓝奏云文件](https://zfb132.lanzous.com/itOdPe9of9g "usb-hack.reg")，将下载得到的文件名删除`.txt`后缀，双击即可实现功能  