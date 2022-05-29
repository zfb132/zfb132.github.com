---
layout: post
title: ubuntu系统编译安装Pangolin
subtitle: "Pangolin是基于OpenGL编写的轻量便携式三维图形处理库"
category : [Ubuntu,Linux]
tags : [Ubuntu,Linux]
date:       2020-10-21 15:20:11 +08:00
author:     "晨曦"
header-img: "/img/post/ubuntu-canonical-bg.png"
description:  "主要是用于三维物体的可视化"
---
  
## 目录
{: .no_toc}

* 目录
{:toc}

## 1. 下载源码
步骤如下：  
```bash
# 下载Pangolin源码，会在当前目录自动生成Pangolin文件夹
git clone https://github.com/stevenlovegrove/Pangolin.git
# 下载pybind11等库
cd Pangolin && git submodule init && git submodule update && cd ../
```
## 2. 安装各种依赖库
```bash
# 安装系统依赖  \ 表示续行，可直接复制粘贴
sudo apt install cmake pkg-config libeigen3-dev \
                 libgl1-mesa-dev libglew-dev libegl1-mesa-dev \
                 libwayland-dev libxkbcommon-dev wayland-protocols \
                 ffmpeg libavcodec-dev libavutil-dev libavformat-dev \
                 libswscale-dev libavdevice-dev libdc1394-22-dev \
                 libraw1394-dev libjpeg-dev libpng12-dev \
                 libtiff5-dev libopenexr-dev
# 安装附加python依赖
sudo python3 -m pip install numpy pyopengl Pillow pybind11
```
## 3. 编译安装
按照如下步骤：  
```bash
# 创建编译文件夹（在Pangolin文件夹下）
mkdir build && cd build
# 配置编译选项
cmake ..
# 开始编译代码
cmake --build .
# 安装
sudo make install
```
## 4. 测试安装是否成功
按照如下步骤：  
```bash
# 从Pangolin文件夹进入测试文件夹
cd examples/HelloPangolin
# 创建编译文件夹并编译代码
mkdir build && cd build && cmake .. && make
# 运行即可看到显示结果
./HelloPangolin
```
## 5. 卸载编译安装的Pangolin软件
1. 进入编译时的文件夹`cd build`
2. 执行卸载命令`sudo make uninstall`，此命令会删除安装时添加的所有文件，但是不处理文件夹
3. 根据上一个命令的回显，删除目的文件夹的与该软件有关的空文件夹


