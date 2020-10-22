---
layout: post
title: ubuntu系统编译安装OpenCV 4.4
subtitle: "最新版本的OpenCV只能从源码编译安装"
category : [Ubuntu,Linux,OpenCV]
tags : [Ubuntu,Linux,OpenCV]
date:       2020-10-22 20:55:32 +08:00
author:     "晨曦"
header-img: "/img/post/ubuntu-canonical-bg.png"
description:  "OpenCV是图像处理领域最强大的库，内置实现许多常用算法"
---
  
# 目录
{: .no_toc}

* 目录
{:toc}

## 前言
如果你只是想要使用C++或者Python语言来调用OpenCV，而且并不关心OpenCV是否为最新版本，那么请直接按照如下代码：  
`sudo apt update && sudo apt install libopencv-dev python3-opencv`  
前者`libopencv-dev`是用于C++开发的库（已经很老旧了）  
后者`python3-opencv`是用于python3开发的库，你可以在终端输入  
`/usr/bin/python3 -c "import cv2;print(cv2.__version__)"`来验证`python3-opencv`是否安装成功  
`/usr/bin/pip3 install opencv-contrib-python==3.4.2.17`来安装扩展功能（3.4.2版本以后的预编译库中都不会再加入non-free模块）

## 1. 下载源码
在官方网站下载最新源代码（截止本文测试时，最新版本为4.4.0），如果需要使用`SIFT`算法等扩展功能，下载`opencv_contrib`一起编译：
* 下载适用于linux的[opencv源码](https://github.com/opencv/opencv/releases/tag/4.4.0)的zip压缩文件并解压
* 下载[opencv_contrib源码](https://github.com/opencv/opencv_contrib/releases/tag/4.4.0)的zip压缩文件并解压

例如，opencv 4.4源码解压到当前目录下，opencv_contrib 4.4也解压到当前目录下
## 2. 安装各种依赖
按照如下步骤：  
```bash
# 安装系统依赖
sudo apt install build-essential cmake git libgtk2.0-dev \
                 pkg-config libavcodec-dev libavformat-dev libswscale-dev \
                 libtbb2 libtbb-dev libjpeg-dev libpng-dev libtiff-dev \
                 libjasper-dev libdc1394-22-dev 
# 添加源以继续安装依赖libjasper
sudo add-apt-repository "deb http://security.ubuntu.com/ubuntu xenial-security main"
# 安装系统依赖
sudo apt install libtbb2 libtbb-dev libjpeg-dev libpng-dev libtiff-dev \
                 libjasper-dev libdc1394-22-dev libsnappy-dev libboost-all-dev \
                 python3-dev python3-numpy ffmpeg cmake-qt-gui libopenblas-dev \
                 tesseract-ocr libtesseract-dev libprotobuf-dev libleveldb-dev \
                 libhdf5-serial-dev protobuf-compiler libatlas-base-dev \
                 libgflags-dev libgoogle-glog-dev liblmdb-dev libfaac-dev \
                 gfortran libgstreamer1.0-dev libatlas-base-dev libxvidcore-dev \
                 libpng-dev libopenexr-dev libtiff-dev libwebp-dev \
                 libmp3lame-dev libtheora-dev libvorbis-dev  \
                 libopencore-amrwb-dev x264 v4l-utils libgdk-pixbuf2.0-dev \
                 manpages-dev libopencore-amrnb-dev libgstreamer-plugins-base1.0-dev \
                 libqt5widgets5 libqt5gui5 libqt5dbus5 libqt5network5 libqt5core5a \
                 qtcreator qt5-default
# 修复可能安装出错的依赖
sudo apt install -f
```
## 3. 开始编译安装
按照以下步骤：  
```bash
# 在opencv4.4源码解压后的文件夹下面，创建编译文件夹
mkdir build && cd build
# 配置编译选项
# CMAKE_INSTALL_PREFIX 是最终OpenCV的安装位置
# OPENCV_ENABLE_NONFREE 指示是否开启Non-free的算法
# OPENCV_EXTRA_MODULES_PATH 指示扩展算法的源码文件夹
# WITH_CUDA 该选项需要确保自己已安装显卡驱动和cuda
# 可以关注下命令的输出，可以从中找到哪些模块没有配置成功
cmake -D CMAKE_BUILD_TYPE=RELEASE \
      -D CMAKE_INSTALL_PREFIX=/usr/local/opencv4.4 \
      -D OPENCV_ENABLE_NONFREE=ON \
      -D OPENCV_EXTRA_MODULES_PATH=/home/zfb/opencv_contrib-4.4.0/modules \
      -D OPENCV_GENERATE_PKGCONFIG=YES \
      -D WITH_QT=ON \
      -D WITH_OPENGL=ON \
      -D WITH_CUDA=ON \
      -D BUILD_EXAMPLES=ON \
      -D INSTALL_PYTHON_EXAMPLES=ON \
      -D INSTALL_C_EXAMPLES=ON ..
# 开启12个线程同时编译源码
make -j12
# 安装OpenCV到指定位置
sudo make install
```
## 4. 配置C++开发环境
按照以下步骤：  
```bash
# 查看该文件是否存在（OPENCV_GENERATE_PKGCONFIG=YES参数保证此文件存在）
cat /usr/local/opencv4/lib/pkgconfig/opencv4.pc
# 把上面的文件添加到PKG_CONFIG_PATH
sudo vim /etc/profile.d/pkgconfig.sh
# 文件内容如下
# export PKG_CONFIG_PATH=/usr/local/opencv4/lib/pkgconfig:$PKG_CONFIG_PATH
# 激活文件
source /etc/profile
# 验证配置，如果不报错则说明正常
pkg-config --libs opencv4
```
## 5. 程序执行时加载动态库*.so
按照以下步骤：  
```bash
# 将OpenCV的库添加到路径
sudo vim /etc/ld.so.conf.d/opencv4.conf
# 添加内容如下（也可能是空文件）
# /usr/local/opencv4.4/lib
# 更新配置
sudo ldconfig
```
## 6. 测试cpp文件
按照以下步骤：  
```bash
# 进入下载的opencv4.4的源码文件夹下的samples目录
cd samples/cpp/example_cmake
# 配置编译选项
cmake .
# 开始编译文件
make
# 执行测试代码，弹出窗口实时显示摄像头画面
./opencv_example
```
## 7. 配置python3的opencv环境
首先需要找到编译好的用于python3的动态库文件的位置，可以使用如下代码搜索（其实在`sudo make install`时也会显示）：  
`sudo find / -iname "cv2*.so"`  
得到路径为`/usr/local/opencv4.4/lib/python3.8/dist-packages/cv2/python-3.8/cv2.cpython-38-x86_64-linux-gnu.so`  
然后把它复制到对应python解释器的`/path/to/dist-packages`（系统自带的python解释器）和`/path/to/site-packages`（用户安装的python解释器）目录下，之后就能在该python解释器中使用python-opencv库：  
```bash
# 查看系统Python环境的包路径
/usr/bin/python3 -c "import pip;print(pip)"
# 创建软链接使得/usr/bin/python3可以使用opencv
sudo ln -s /usr/local/opencv4.4/lib/python3.8/dist-packages/cv2/python-3.8/cv2.cpython-38-x86_64-linux-gnu.so /usr/lib/python3/dist-packages/cv2.so
# 测试安装结果
/usr/bin/python3 -c "import cv2;print(cv2.__version__)"
```
## 8. 卸载编译安装的OpenCV
1. 进入编译时的文件夹`cd build`
2. 执行卸载命令`sudo make uninstall`，此命令会删除安装时添加的所有文件，但是不处理文件夹
3. 根据上一个命令的回显，删除目的文件夹的与该软件有关的空文件夹