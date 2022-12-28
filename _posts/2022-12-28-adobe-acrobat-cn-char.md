---
layout: post
title: "修复Adobe Acrobat打开发票字体显示不全的问题"
subtitle: "Acrobat在2021.005.20060以后的新版本有bug，无法读取楷体GB2312字体"
category : [Windows]
tags : [Windows]
date:       2022-12-28 20:03:15 +08:00
author:     "晨曦"
header-img: "/img/post/win10-bg.jpg"
description:  "利用字体编辑工具FontCreator修改系统楷体字体文件，把字体名称由楷体/KaiTi改成KaiTi_GB2312，将修改后的字体复制到Acrobat字体目录即可"
---
  
## 目录
{: .no_toc}

* 目录
{:toc}

## 0. 问题描述
Acrobat在2021.005.20060以后的新版本有bug，无法读取楷体GB2312字体，导致打开发票时，发票上的部分中文显示为方框或不显示

## 1. 复制系统楷体字体文件
文件资源管理器打开`C:\Windows\Fonts`目录，找到`楷体 常规`字体文件，即文件`C:\Windows\Fonts\simkai.ttf`，复制到其他目录，这样不会影响系统正常使用

## 2. 修改字体名称
使用字体编辑工具FontCreator打开`simkai.ttf`字体文件，选择`Font-Properties`打开属性修改，将`Family Name`修改为`KaiTi_GB2312`，选择`File – Export Font – Export – Export Desktop Font`导出字体，可以命名为`simkai-new.otf`，等待几分钟完成

## 3. 复制字体文件到Acrobat字体目录
将修改后的字体文件`simkai-new.otf`复制到`C:\Program Files\Adobe\Acrobat DC\Resource\Font`目录，重启Acrobat即可