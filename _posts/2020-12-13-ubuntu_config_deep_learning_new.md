---
layout: post
title: ubuntu系统配置基于CUDA 11.0的最新深度学习环境
subtitle: "主要包括安装nvidia显卡驱动（v450）、cuda（v11.0）、cudnn（v8.0.4）和主要深度学习库"
category : [Ubuntu,Linux,Python]
tags : [Ubuntu,Linux,Python]
date:       2020-12-13 17:24:01 +08:00
author:     "晨曦"
header-img: "/img/post/ubuntu-canonical-bg.png"
description:  "最新教程，适配Nvidia 450与CUDA11.0和cuDNN 8.0.4"
---
  
# 目录
{: .no_toc}

* 目录
{:toc}

## 1. 深度学习硬件环境参数
服务器的硬件配置如下：
* CPU型号：`2 * (Intel Xeon Gold 5218 @ 2.3GHz * 32)`
* 内存大小：`12 * (32GB 2663MHz)`
* GPU型号：`8 * (GeForce GTX 2080 Ti)`
* 硬盘：
  * 系统（`RAID 1`）：`2 * (960GB SSD) = 960GB`
  * 数据（`RAID 6`）：`6 * (10T HDD 7200rpm) = 40TB`

系统和各基础软件的版本都在下表中列出：
* 操作系统版本：`Ubuntu 18.04-amd64`
* 英伟达显卡驱动：`nvidia-driver-450`
* CUDA版本：`11.0.3`
* cuDNN版本：`8.0.4`
* Python版本：`3.6.9`
* tensorflow版本：`tf-nightly-2.5.0.dev20201209`

## 2. 深度学习系统环境配置
### 2.1 安装nvidia驱动
目前我使用过的方法有三种，按照便捷程度依次降低的顺序来介绍
* 推荐方法（在图形窗口操作）：  
  * 打开软件`Software & Updates`（系统和更新）
  * 点击选项`Additional drivers`（附加驱动）
  * 选定`nvidia driver meta nvidia-450`
  * 点击按钮`Apply changes`（应用更改）

* 备用方法：
  * 打开终端，依次输入以下命令：  
```bash
sudo add-apt-repository ppa:graphics-drivers/ppa
sudo apt update
sudo apt install nvidia-driver-450
```

* 最后的方法：访问nvidia官网下载[适用于ubuntu的驱动包](https://www.nvidia.com/Download/driverResults.aspx/164073/en-us)，一般为`.run`格式。然后在终端运行，根据提示操作即可

不管哪种方法，都需要重启电脑。然后，在终端输入`nvidia-smi`命令得到如下示例输出则表明安装成功  
```text
Thu Dec 10 15:42:47 2020       
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 450.80.02    Driver Version: 450.80.02    CUDA Version: 11.0     |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|                               |                      |               MIG M. |
|===============================+======================+======================|
|   0  GeForce RTX 208...  Off  | 00000000:3D:00.0 Off |                  N/A |
| 28%   30C    P8     9W / 250W |      6MiB / 11019MiB |      0%      Default |
|                               |                      |                  N/A |
+-------------------------------+----------------------+----------------------+
|   1  GeForce RTX 208...  Off  | 00000000:3E:00.0 Off |                  N/A |
| 27%   29C    P8     5W / 250W |      6MiB / 11019MiB |      0%      Default |
|                               |                      |                  N/A |
+-------------------------------+----------------------+----------------------+
|   2  GeForce RTX 208...  Off  | 00000000:40:00.0 Off |                  N/A |
| 27%   29C    P8    17W / 250W |      6MiB / 11019MiB |      0%      Default |
|                               |                      |                  N/A |
+-------------------------------+----------------------+----------------------+
|   3  GeForce RTX 208...  Off  | 00000000:41:00.0 Off |                  N/A |
| 27%   28C    P8    22W / 250W |      6MiB / 11019MiB |      0%      Default |
|                               |                      |                  N/A |
+-------------------------------+----------------------+----------------------+
|   4  GeForce RTX 208...  Off  | 00000000:B1:00.0 Off |                  N/A |
| 27%   29C    P8     3W / 250W |      6MiB / 11019MiB |      0%      Default |
|                               |                      |                  N/A |
+-------------------------------+----------------------+----------------------+
|   5  GeForce RTX 208...  Off  | 00000000:B2:00.0 Off |                  N/A |
| 27%   29C    P8    14W / 250W |      6MiB / 11019MiB |      0%      Default |
|                               |                      |                  N/A |
+-------------------------------+----------------------+----------------------+
|   6  GeForce RTX 208...  Off  | 00000000:B4:00.0 Off |                  N/A |
| 29%   31C    P8    20W / 250W |      6MiB / 11019MiB |      0%      Default |
|                               |                      |                  N/A |
+-------------------------------+----------------------+----------------------+
|   7  GeForce RTX 208...  Off  | 00000000:B5:00.0 Off |                  N/A |
| 27%   29C    P8     7W / 250W |      6MiB / 11019MiB |      0%      Default |
|                               |                      |                  N/A |
+-------------------------------+----------------------+----------------------+
                                                                               
+-----------------------------------------------------------------------------+
| Processes:                                                                  |
|  GPU   GI   CI        PID   Type   Process name                  GPU Memory |
|        ID   ID                                                   Usage      |
|=============================================================================|
|    0   N/A  N/A     16810      G   /usr/lib/xorg/Xorg                  4MiB |
|    1   N/A  N/A     16810      G   /usr/lib/xorg/Xorg                  4MiB |
|    2   N/A  N/A     16810      G   /usr/lib/xorg/Xorg                  4MiB |
|    3   N/A  N/A     16810      G   /usr/lib/xorg/Xorg                  4MiB |
|    4   N/A  N/A     16810      G   /usr/lib/xorg/Xorg                  4MiB |
|    5   N/A  N/A     16810      G   /usr/lib/xorg/Xorg                  4MiB |
|    6   N/A  N/A     16810      G   /usr/lib/xorg/Xorg                  4MiB |
|    7   N/A  N/A     16810      G   /usr/lib/xorg/Xorg                  4MiB |
+-----------------------------------------------------------------------------+
```
### 2.2 安装CUDA
访问[CUDA 11.0 Update 1的下载网址](https://developer.nvidia.com/cuda-11.0-update1-download-archive?target_os=Linux&target_arch=x86_64&target_distro=Ubuntu&target_version=1804&target_type=deblocal "CUDA 11.0 Update 1的下载网址")，选择适合自己操作系统版本的文件下载，然后打开终端依次输入以下命令：
```bash
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu1804/x86_64/cuda-ubuntu1804.pin
sudo mv cuda-ubuntu1804.pin /etc/apt/preferences.d/cuda-repository-pin-600
wget https://developer.download.nvidia.com/compute/cuda/11.0.3/local_installers/cuda-repo-ubuntu1804-11-0-local_11.0.3-450.51.06-1_amd64.deb
sudo dpkg -i cuda-repo-ubuntu1804-11-0-local_11.0.3-450.51.06-1_amd64.deb
sudo apt-key add /var/cuda-repo-ubuntu1804-11-0-local/7fa2af80.pub
sudo apt-get update
sudo apt-get install cuda
```
此时CUDA以及安装完毕，在终端输入`cd /usr/local/cuda-11.0/bin && ./nvcc -V`命令得到如下示例输出则表明安装成功  
```text
nvcc: NVIDIA (R) Cuda compiler driver
Copyright (c) 2005-2020 NVIDIA Corporation
Built on Wed_Jul_22_19:09:09_PDT_2020
Cuda compilation tools, release 11.0, V11.0.221
Build cuda_11.0_bu.TC445_37.28845127_0
```
但是，为了方便下面深度学习软件的使用，还要把相关路径加入PATH。打开文件`~/.profile`（若不存在则新建） ，在文档末尾添加以下内容：
```bash
# set PATH for cuda 11.0 installation
if [ -d "/usr/local/cuda-11.0/bin/" ]; then
    export PATH=/usr/local/cuda-11.0/bin${PATH:+:${PATH}}
    export LD_LIBRARY_PATH=/usr/local/cuda-11.0/lib64${LD_LIBRARY_PATH:+:${LD_LIBRARY_PATH}}
fi
```
重启计算机即可使环境变量生效
### 2.3 安装cuDNN
打开[cuDNN的下载网址](https://developer.nvidia.com/rdp/cudnn-archive "cuDNN的下载网址")，然后点击`cuDNN v8.0.4 (September 28th, 2020), for CUDA 11.0`并根据自己的操作系统选择合适的版本。其中，`cuDNN Runtime Library`和`cuDNN Developer Library`是必须要下载的，`cuDNN Code Samples and User Guide`为可选项目。然后依次安装前面下载的3个文件：  
```bash
sudo dpkg -i libcudnn8_8.0.4.30-1+cuda11.0_amd64.deb
sudo dpkg -i libcudnn8-dev_8.0.4.30-1+cuda11.0_amd64.deb
sudo dpkg -i libcudnn8-samples_8.0.4.30-1+cuda11.0_amd64.deb
```
此时，显卡已经配置完成
## 3. python3软件环境配置
创建基于python3的虚拟环境，然后安装深度学习需要用到的库：  
```bash
# 安装python3开发库
sudo apt-get install python3-pip python3-venv
# 创建名称为myvenv的虚拟环境
python3 -m venv myvenv
# 激活myvenv虚拟环境
source myvenv/bin/activate
# pip安装深度学习相关第三方库
pip3 install tf-nightly -i https://pypi.python.org/simple
```
**注意**：  
* 确保下载的是`tf-nightly-2.5.0.dev20201209`（目前的最新版）
* 使用`pypi`的镜像源可能导致版本不是最新的
* `tensorflow`包目前还不支持`CUDA 11.0`，它最高支持`CUDA 10.1`
* 如果安装`tensorflow`遇到报错`launchpadlib 1.10.6 requires testresources, which is not installed`，执行以下代码：  
```bash
# sudo apt install python3-widgetsnbextension
sudo apt install python3-testresources
```
## 4. Ubuntu 20.04系统注意事项
* 不同之处：CUDA版本号不变，但选择用于`Ubuntu 20.04`系统
* 不同之处：cuDNN版本选择`8.0.5`且用于`Ubuntu 20.04`系统
* 其他步骤同Ubuntu 18.04