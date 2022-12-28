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


## 0. 注册表介绍
Windows注册表的分支  

名称|作用|  
:--:|:--:|  
HKEY_CLASSES_ROOT|存储Windows可识别的文档类型的详细列表，以及相关联的程序|  
HKEY_CURRENT_USER|存储当前用户设置的信息|  
HKEY_LOCAL_MACHINE|包括安装在计算机上的硬件和软件的信息|  
HKEY_USERS|包含使用计算机的用户的信息|  
HKEY_CURRENT_CONFIG|这个分支包含计算机当前的硬件配置信息|  


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
## 4. 删除文件资源管理器左侧多余的OneDrive条目
OneDrive的个人版和组织版会在资源管理器左侧创建各自的条目，但很多时候常用的只有一个，所以想要隐藏另一个无用的条目。直接删除注册表中的条目即可，参考链接  
* [文件资源管理器左侧有两个onedrive图标，其中一个是无效的，如何删除？](https://answers.microsoft.com/zh-hans/windows/forum/all/%E6%96%87%E4%BB%B6%E8%B5%84%E6%BA%90%E7%AE%A1/31674379-ba5d-48bb-bf56-f30078f5a8a9)
* [从 win10 资源管理器左侧移除坚果云/OneDrive](https://loesspie.com/2021/01/19/win10-remove-jianguoyun/)

如果要删除`OneDrive - Personal`，则新建文件`remove-onedrive.reg`，内容如下：  
```reg
Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\CLSID\{018D5C66-4533-4307-9B53-224DE2ED1FE6}]
"System.IsPinnedToNameSpaceTree"=dword:00000000
```
如果要删除`OneDrive - Organization`，则需要在注册表中搜索`OneDrive - Organization`，找到对应的`CLSID`，同样将`System.IsPinnedToNameSpaceTree`的值改为`0`即可

## 5. USB3.0连接安卓手机刷机出现问题  
如果在使用小米刷机助手对手机刷机的时候，将手机通过USB3.0接口连接电脑，出现刷机失败的情况，考虑修改注册表。新建文件`usb-hack.reg`，内容如下：  
```reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\usbflags\18D1D00D0100]
"osvc"=hex:00,00
"SkipContainerIdQuery"=hex:01,00,00,00
"SkipBOSDescriptorQuery"=hex:01,00,00,00

```
或者直接下载[蓝奏云文件](https://zfb132.lanzous.com/itOdPe9of9g "usb-hack.reg")，将下载得到的文件名删除`.txt`后缀，双击即可实现功能  