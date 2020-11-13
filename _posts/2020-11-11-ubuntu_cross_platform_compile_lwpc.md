---
layout: post
title: Ubuntu系统跨平台编译SPAWAR LWPC v2.1版本软件
subtitle: " Space and Naval Warfare (SPAWAR), LongWave Propagation Code(LWPC)"
category : [Windows,Python,Ubuntu,Linux,Fortran]
tags : [Windows,Python,Ubuntu,Linux,Fortran]
date:       2020-11-11 11:11:11 +08:00
author:     "晨曦"
header-img: "/img/post/ubuntu-canonical-bg.png"
description:  "记录一下在Ubuntu系统跨平台编译LWPC代码，得到Windows 64/32 位可执行程序的过程"
---
  
# 目录
{: .no_toc}

* 目录
{:toc}

## 0. 说明
LWPC项目可以采用以下编译方法：  
* 在linux系统编译和运行（需要安装[cmake软件](https://cmake.org/download/)的linux版本，也可用`apt`安装）
* 在windows系统编译和运行（需要安装[cmake软件](https://cmake.org/download/)的Windows版本）
* 在linux系统编译软件（需要安装[cmake软件](https://cmake.org/download/)的linux版本），在windows系统运行软件

本文主要介绍在ubuntu系统下面编译代码，得到Windows系统的可执行程序的方法，具体代码相关内容参见[仓库LWPC](https://github.com/zfb132/LWPC)
## 1. 下载LWPC最新代码
` /home/zfb > git clone git@github.com:zfb132/LWPC.git`  
本仓库与[官方仓库](https://github.com/space-physics/LWPC)的区别如下，代码和其他配置文件均未改变：  
* 添加了`dll32`、`dll64`、`useless_dll`三个文件夹
* 添加了`toolchain_win32.cmake`与`toolchain_win64.cmake`工具链文件
* 添加了`lwpm.inp`文件用于作为程序运行时的输入

## 2. 修改编译选项
`vi LWPC/LWPCv21/CMakeLists.txt`  
将以下内容放在最前面（设置编译语言）：  
```txt
cmake_minimum_required(VERSION 3.13)
project(LWPC LANGUAGES Fortran)
```
（通过`cat LWPC/CMakeLists.txt`找到的办法）  
## 3. 创建跨平台工具链
参考[链接](https://www.bookstack.cn/read/CMake-Cookbook/content-chapter13-13.2-chinese.md)  
安装必要的编译工具：  
```bash
# 64位版本的MingW
sudo apt-get install mingw-w64
# 64位版本的mingw-gfortran
sudo apt-get install gfortran-mingw-w64-x86-64
# 32位版本的mingw-gfortran
sudo apt-get install gfortran-mingw-w64-i686
```
创建跨平台64位编译工具链（**本仓库已包含这两个文件，可跳过**）：  
`vi LWPC/toolchain_win64.cmake`  
写入以下内容：  
```cmake
# 设置目标操作系统类型
set(CMAKE_SYSTEM_NAME Windows)
# 使用64位编译器，生成64位程序
# 选择C、C++、Fortran代码的编译器
set(CMAKE_C_COMPILER   x86_64-w64-mingw32-gcc)
set(CMAKE_CXX_COMPILER x86_64-w64-mingw32-g++)
set(CMAKE_Fortran_COMPILER x86_64-w64-mingw32-gfortran)
# 调整寻找库的行为
# 在目标环境搜索库和头文件
set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)

# 在主机环境搜索程序
set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)

# 设置编译器路径
# set(CMAKE_FIND_ROOT_PATH /path/to/target/environment)
```
创建跨平台32位编译工具链：  
`vi LWPC/toolchain_win32.cmake`  
写入以下内容：  
```cmake
# 设置目标操作系统类型
set(CMAKE_SYSTEM_NAME Windows)
# 生成32位程序
# 选择C、C++、Fortran代码的编译器
set(CMAKE_C_COMPILER   i686-w64-mingw32-gcc)
set(CMAKE_CXX_COMPILER i686-w64-mingw32-g++)
set(CMAKE_Fortran_COMPILER i686-w64-mingw32-gfortran)
# 调整寻找库的行为
# 在目标环境搜索库和头文件
set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)

# 在主机环境搜索程序
set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)

# 设置编译器路径
# set(CMAKE_FIND_ROOT_PATH /path/to/target/environment)
```
## 4. 开始编译项目
创建编译文件夹并进入，然后开始编译生成64位可执行程序（**根据需要选择toolchain_winXX.cmake文件，与最后的dllXX文件夹对应**）：  
```bash
cd LWPC/LWPCv21/ && mkdir build && cd build
cmake -D CMAKE_TOOLCHAIN_FILE=../../toolchain_win64.cmake ..
make -j12
```
此时已在LWPC/LWPCv21/build目录下生成`lwpc.bin.exe`等文件
## 5. 复制依赖的库文件到build目录
从这一步开始，所有操作均可在Windows上进行（但是讲解还是采用ubuntu，windows用户只需要把对应命令改为图形界面的鼠标操作即可）  
```bash
# 移动程序位置
cd /home/zfb/LWPC/ && mv LWPCv21/build ./
# 复制需要的动态链接库文件
cp -R dll64/*.dll ./build/
# 创建文件夹存放数据
cd build && mkdir -p LWPCv21/data/
# 复制必要数据
cp -R LWPC/LWPCv21/data/ ./LWPCv21/data/
```
使用[Dependencies](https://github.com/lucasg/Dependencies)可以查看`.dll`或`*.exe`的详细信息  
分别把`lwpc.bin.exe`、`scan.exe`、`data/unf_*.exe`打开，可以查看各个可执行程序需要的`*.dll`文件，以及`*.dll`文件需要依赖的`*.dll`文件，如下是使用此软件查找得到的各程序依赖的库（绝对路径的动态链接库不需要自己提供，其他`*.dll`均需自己复制，且位于对应exe的同一个文件夹下）  
* 64位版本的`lwpc.bin.exe`  
```txt
lwpc.bin.exe(64-bit)
├── C:\WINDOWS\system32\kernel32.dll
├── C:\WINDOWS\system32\MSVCRT.dll
├── libgcc_s_seh-1.dll
│   ├── C:\WINDOWS\system32\kernel32.dll
│   ├── C:\WINDOWS\system32\MSVCRT.dll
│   └── libwinpthread-1.dll
│       ├── C:\WINDOWS\system32\kernel32.dll
│       └── C:\WINDOWS\system32\MSVCRT.dll
└── libgfortran-5.dll
    ├── libquadmath-0.dll
    │   ├── libgcc_s_seh-1.dll
    │   ├── C:\WINDOWS\system32\kernel32.dll
    │   └── C:\WINDOWS\system32\MSVCRT.dll
    ├── libgcc_s_seh-1.dll
    │   ├── C:\WINDOWS\system32\kernel32.dll
    │   └── C:\WINDOWS\system32\MSVCRT.dll
    ├── libwinpthread-1.dll
    ├── C:\WINDOWS\system32\advapi32.dll
    ├── C:\WINDOWS\system32\kernel32.dll
    └── C:\WINDOWS\system32\MSVCRT.dll
```
* 64位版本的`scan.exe`  
```txt
scan.exe(64-bit)
├── C:\WINDOWS\system32\kernel32.dll
├── C:\WINDOWS\system32\MSVCRT.dll
└── libgfortran-5.dll
    ├── libquadmath-0.dll
    │   ├── libgcc_s_seh-1.dll
    │   ├── C:\WINDOWS\system32\kernel32.dll
    │   └── C:\WINDOWS\system32\MSVCRT.dll
    ├── libgcc_s_seh-1.dll
    │   ├── C:\WINDOWS\system32\kernel32.dll
    │   └── C:\WINDOWS\system32\MSVCRT.dll
    ├── libwinpthread-1.dll
    ├── C:\WINDOWS\system32\advapi32.dll
    ├── C:\WINDOWS\system32\kernel32.dll
    └── C:\WINDOWS\system32\MSVCRT.dll
```
* 64位版本的`data/unf_*.exe`  
```txt
unf_*.exe(64-bit)
├── C:\WINDOWS\system32\kernel32.dll
├── C:\WINDOWS\system32\MSVCRT.dll
└── libgfortran-5.dll
    ├── libquadmath-0.dll
    │   ├── libgcc_s_seh-1.dll
    │   ├── C:\WINDOWS\system32\kernel32.dll
    │   └── C:\WINDOWS\system32\MSVCRT.dll
    ├── libgcc_s_seh-1.dll
    │   ├── C:\WINDOWS\system32\kernel32.dll
    │   └── C:\WINDOWS\system32\MSVCRT.dll
    ├── libwinpthread-1.dll
    ├── C:\WINDOWS\system32\advapi32.dll
    ├── C:\WINDOWS\system32\kernel32.dll
    └── C:\WINDOWS\system32\MSVCRT.dll
```
* 32位版本的`lwpc.bin.exe`  
```txt
lwpc.bin.exe(32-bit)
├── C:\WINDOWS\SysWOW64\kernel32.dll
├── C:\WINDOWS\SysWOW64\MSVCRT.dll
├── libgcc_s_sjlj-1.dll
│   ├── C:\WINDOWS\SysWOW64\kernel32.dll
│   ├── C:\WINDOWS\SysWOW64\MSVCRT.dll
│   └── libwinpthread-1.dll
│       ├── C:\WINDOWS\SysWOW64\kernel32.dll
│       └── C:\WINDOWS\SysWOW64\MSVCRT.dll
└── libgfortran-5.dll
    ├── libquadmath-0.dll
    │   ├── libgcc_s_dw2-1.dll
    │   ├── C:\WINDOWS\SysWOW64\kernel32.dll
    │   └── C:\WINDOWS\SysWOW64\MSVCRT.dll
    ├── libgcc_s_dw2-1.dll
    │   ├── C:\WINDOWS\SysWOW64\kernel32.dll
    │   └── C:\WINDOWS\SysWOW64\MSVCRT.dll
    ├── C:\WINDOWS\SysWOW64\advapi32.dll
    ├── C:\WINDOWS\SysWOW64\kernel32.dll
    └── C:\WINDOWS\SysWOW64\MSVCRT.dll
```
* 32位版本的`scan.exe`  
```txt
scan.exe(32-bit)
├── C:\WINDOWS\SysWOW64\kernel32.dll
├── C:\WINDOWS\SysWOW64\MSVCRT.dll
└── libgfortran-5.dll
    ├── libquadmath-0.dll
    │   ├── libgcc_s_dw2-1.dll
    │   ├── C:\WINDOWS\SysWOW64\kernel32.dll
    │   └── C:\WINDOWS\SysWOW64\MSVCRT.dll
    ├── libgcc_s_dw2-1.dll
    │   ├── C:\WINDOWS\SysWOW64\kernel32.dll
    │   └── C:\WINDOWS\SysWOW64\MSVCRT.dll
    ├── C:\WINDOWS\SysWOW64\advapi32.dll
    ├── C:\WINDOWS\SysWOW64\kernel32.dll
    └── C:\WINDOWS\SysWOW64\MSVCRT.dll
```
* 32位版本的`data/unf_*.exe`  
```txt
unf_*.exe(32-bit)
├── C:\WINDOWS\SysWOW64\kernel32.dll
├── C:\WINDOWS\SysWOW64\MSVCRT.dll
└── libgfortran-5.dll
    ├── libquadmath-0.dll
    │   ├── libgcc_s_dw2-1.dll
    │   ├── C:\WINDOWS\SysWOW64\kernel32.dll
    │   └── C:\WINDOWS\SysWOW64\MSVCRT.dll
    ├── libgcc_s_dw2-1.dll
    │   ├── C:\WINDOWS\SysWOW64\kernel32.dll
    │   └── C:\WINDOWS\SysWOW64\MSVCRT.dll
    ├── C:\WINDOWS\SysWOW64\advapi32.dll
    ├── C:\WINDOWS\SysWOW64\kernel32.dll
    └── C:\WINDOWS\SysWOW64\MSVCRT.dll
```

## 6. 创建输入文件
（**本仓库已经包含，可跳过**）  
`cd /home/zfb/LWPC/ && vi lwpm.inp`  
文件内容如下：  
```txt
file-mds    ../Output/
file-lwf    ../Output/
file-grd    ../Output/
case-id     OMEGA coverage of the Mediterranean
  Name the files
tx          55625847
  Identify the transmitter
tx-data  55625847 19.8 -21.80 -114.15 1000 43.6 0 0
  Choose the LWPM model daytime environment
ionosphere  lwpm june/01/2009 00:00
op-area     Mediterranean  30 10 45 -45
a-noise     ntia june 01 0000 
start
quit
```
需要注意的是  
`op-area     Mediterranean  30 10 45 -45`  
与文件`build/LWPCv21/data/area.lis`的内容对应  
如果想要更换区域，则可以改为  
`op-area     world  -90.  180.  90.  180.`
## 7. 运行程序
双击`LWPC/build/lwpc.bin.exe`文件，会看到控制台窗口，运算结束或遇到报错会自动消失（可以通过在PowerShell启动程序来查看信息）  
预期结果：  
* 控制台程序显示`STOP Normal run complete`
* 生成`/home/zfb/LWPC/lwpm.log`文件，内容无报错
* `/home/zfb/LWPC/Output`文件夹下生成多个文件

## 8. 清理与重新运行
每次修改完`/home/zfb/LWPC/lwpm.inp`文件的内容，还需要同时进行以下操作：  
* 替换文件：`cp LWPC/LWPCv21/data/xmtr.lis LWPC/build/LWPCv21/data/`
* 修改`/home/zfb/LWPC/lwpm.inp`文件的`tx`、`tx-data`字段为其他数值（一般来说需要修改）
* 删除文件：`rm -rf LWPC/Output/*`（一般来说需要修改）

## 9. 关于dll来源问题
程序依赖的相关`.dll`库来源于`mingw`，获取方法有很多，比如直接去`mingw-64`官网或`mingw-32`官网下载安装，在对应的`lib`或者`bin`文件夹中寻找即可。这里介绍一种新的方法：  
* 下载安装MSYS2软件，[链接](https://www.msys2.org/)，安装到`C:\msys64`位置
* 打开软件`MSYS2 MinGW 64-bit`（其他两个也可）
* 更新源`pacman -Syu`
* 安装64位工具链`pacman -Sy mingw-w64-x86_64-toolchain`
* 打开文件夹`C:\msys64\mingw64\bin`，寻找所需的`*.dll`文件
