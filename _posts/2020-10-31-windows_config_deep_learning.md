---
layout: post
title: Windows 10系统配置深度学习环境
subtitle: "主要包括安装cuda、cudnn和定制版深度学习库"
category : [Windows,Python]
tags : [Windows,Python]
date:       2020-10-31 10:59:58 +08:00
author:     "晨曦"
header-img: "/img/post/ubuntu-canonical-bg.png"
description:  "写的时候已经很早了，现在可能已经无法正常使用了，而且不推荐用Windows炼丹"
---
  
## 目录
{: .no_toc}

* 目录
{:toc}

## 1. 下载安装显卡驱动
在nvidia官网下载安装最新驱动，[点击链接](https://www.nvidia.cn/Download/index.aspx?lang=cn)
## 2. 下载安装cuda和cudnn
* [下载](https://developer.nvidia.com/cuda-downloads?target_os=Windows&target_arch=x86_64&target_version=10&target_type=exelocal)安装cuda，双击exe文件，选择精简安装（默认安装目录是`C:\Program Files\NVIDIA GPU Computing Toolkit`）
* 登录自己的nvidia开发者账户下载与cuda版本对应的[cudnn压缩包](https://developer.nvidia.com/rdp/cudnn-download)
* 解压cudnn压缩包，把里面的对应文件夹下的内容复制到`C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v10.1`路径的对应文件夹下

## 3. 配置环境变量
然后添加环境变量（如果不存在的话）：  
```txt
CUDA_PATH           C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v10.1
CUDA_PATH_V10_1     C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v10.1
```
环境变量中，系统变量的`path`变量添加3个条目（如果不存在的话）：  
```txt
C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v10.1\bin
C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v10.1\include
C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v10.1\lib\x64
```
## 4. 安装pip第三方库
修改`Windows`下pip的源：首先在文件资源管理器的地址输入`%APPDATA%`，然后在该目录下新建`pip`文件夹，在`pip`文件夹下新建`pip.ini`文件，文件内容为：  
```ini
[global]
index-url = https://pypi.tuna.tsinghua.edu.cn/simple
trusted-host = pypi.tuna.tsinghua.edu.cn
```
安装定制版的`tensorflow-gpu`：首先查看自己CPU是否支持`AVX2`指令集，可以通过下载`CPU-Z`检测。然后在[仓库](https://github.com/fo40225/tensorflow-windows-wheel)里面下载自己需要的版本号，再选择`GPU`文件夹，再对应`AVX2`指令集下载（`001`和`002`两个文件都要下载，他们是一个文件分割压缩）；下载的压缩文件先解压得到`.whl`扩展名的文件，然后`pip install`即可，在安装过程中会下载其他依赖；如果`CPU`指令集不支持`AVX2`，那么下载`SSE2`版本；仓库的地址是