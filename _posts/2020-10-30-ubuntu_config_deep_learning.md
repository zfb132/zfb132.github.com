---
layout: post
title: ubuntu系统配置深度学习环境
subtitle: "主要包括安装nvidia显卡驱动、cuda、cudnn和主要深度学习库"
category : [Ubuntu,Linux,Python]
tags : [Ubuntu,Linux,Python]
date:       2020-10-30 18:30:07 +08:00
author:     "晨曦"
header-img: "/img/post/ubuntu-canonical-bg.png"
description:  "这个教程是很久以前写的了，现在可能软件版本号已经不是最新了"
---
  
# 目录
{: .no_toc}

* 目录
{:toc}

## 0. 查看最新教程
点击[此链接](https://blog.whuzfb.cn/blog/2020/12/13/ubuntu_config_deep_learning_new/)跳转到`Nvidia Driver 450`、`CUDA 11.0`、`cuDNN 8.0.4`版本配置教程
## 1. 深度学习硬件环境参数
服务器的硬件配置如下：
* CPU型号：Intel Core i7-8700
* 内存大小：64GB
* GPU型号：GeForce GTX 1080 Ti

系统和各基础软件的版本都在下表中列出：
* 操作系统版本：Ubuntu 18.04，64位
* 英伟达显卡驱动：nvidia-driver-410
* CUDA版本：10.0.130
* cuDNN版本：7.6.0.64

## 2. 深度学习系统环境配置
### 2.1 安装nvidia驱动
打开终端，依次输入以下命令：  
```bash
sudo add-apt-repository ppa:graphics-drivers/ppa
sudo apt update
sudo apt install nvidia-driver-410
```
然后重启计算机即可完成驱动安装，在终端输入`nvidia-smi`命令得到如下示例输出则表明安装成功  
```text
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 410.104      Driver Version: 410.104      CUDA Version: 10.0     |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|===============================+======================+======================|
|   0  GeForce GTX 108...  Off  | 00000000:01:00.0  On |                  N/A |
|  0%   29C    P8    18W / 250W |    249MiB / 11175MiB |      0%      Default |
+-------------------------------+----------------------+----------------------+
                                                                               
+-----------------------------------------------------------------------------+
| Processes:                                                       GPU Memory |
|  GPU       PID   Type   Process name                             Usage      |
|=============================================================================|
|    0      1259      G   /usr/lib/xorg/Xorg                            12MiB |
|    0      1376      G   /usr/bin/gnome-shell                          59MiB |
|    0      3384      G   /usr/lib/xorg/Xorg                            71MiB |
|    0      3581      G   /usr/bin/gnome-shell                          92MiB |
+-----------------------------------------------------------------------------+
```
### 2.2 安装CUDA
访问[CUDA的下载网址](https://developer.nvidia.com/cuda-10.0-download-archive?target_os=Linux&target_arch=x86_64&target_distro=Ubuntu&target_version=1804&target_type=deblocal "CUDA的下载网址")，选择适合自己操作系统版本的文件下载，然后打开终端依次输入以下命令：
```bash
sudo dpkg -i cuda-repo-ubuntu1804-10-0-local-10.0.130-410.48_1.0-1_amd64.deb
sudo apt-key add /var/cuda-repo-10-0-local-10.0.130-410.48/7fa2af80.pub
sudo apt-get update
sudo apt-get install cuda
```
此时CUDA以及安装完毕，在终端输入`cd /usr/local/cuda-10.0/bin && ./nvcc -V`命令得到如下示例输出则表明安装成功  
```text
nvcc: NVIDIA (R) Cuda compiler driver
Copyright (c) 2005-2018 NVIDIA Corporation
Built on Sat_Aug_25_21:08:01_CDT_2018
Cuda compilation tools, release 10.0, V10.0.130
```
但是，为了方便下面深度学习软件的使用，还要把相关路径加入PATH。打开文件`~/.profile` ，在文档末尾添加以下内容：
```bash
# set PATH for cuda 10.0 installation
if [ -d "/usr/local/cuda-10.0/bin/" ]; then
    export PATH=/usr/local/cuda-10.0/bin${PATH:+:${PATH}}
    export LD_LIBRARY_PATH=/usr/local/cuda-10.0/lib64${LD_LIBRARY_PATH:+:${LD_LIBRARY_PATH}}
fi
```
重启计算机即可使环境变量生效
### 2.3 安装cuDNN
打开[cuDNN的下载网址](https://developer.nvidia.com/rdp/cudnn-archive "cuDNN的下载网址")，然后点击`Download cuDNN v7.6.0 (May 20, 2019), for CUDA 10.0`并根据自己的操作系统选择合适的版本。其中，`cuDNN Runtime Library`和`cuDNN Developer Library`是必须要下载的，`cuDNN Code Samples and User Guide`为可选项目。然后依次安装前面下载的3个文件：  
```bash
sudo dpkg -i libcudnn7_7.6.0.64-1+cuda10.0_amd64.deb
sudo dpkg -i libcudnn7-dev_7.6.0.64-1+cuda10.0_amd64.deb
sudo dpkg -i libcudnn7-doc_7.6.0.64-1+cuda10.0_amd64.deb
```
## 3. python3软件环境配置
创建基于python3的虚拟环境，然后安装深度学习以及本项目需要用到的库：  
```bash
# 安装python3开发库
sudo apt-get install python3-pip
# 创建名称为myvenv的虚拟环境
python3 -m venv myvenv
# 激活myvenv虚拟环境
source myvenv/bin/activate
# pip安装深度学习相关第三方库
pip install -r numpy==1.16.3 matplotlib==3.1.0 tensorflow-gpu==1.13.1 Keras==2.2.4
```