---
layout: post
title: ubuntu系统编译安装PolyFit 1.4
subtitle: "为了使用Gurobi求解器，只能自己编译最新版本的PolyFit源码了"
category : [Ubuntu,Linux]
tags : [Ubuntu,Linux]
date:       2020-10-29 21:09:11 +08:00
author:     "晨曦"
header-img: "/img/post/ubuntu-canonical-bg.png"
description:  "PolyFit是一种基于假设和选择的表面重建算法"
---
  
## 目录
{: .no_toc}

* 目录
{:toc}

## 1. 下载Gurobi
[注册账号](https://www.gurobi.com/)，注意选择类型为学术，然后打开[下载中心](https://www.gurobi.com/downloads/)，选择[Gurobi Optimizer](https://www.gurobi.com/downloads/gurobi-optimizer-eula/)点击，同意协议；然后选择最新版本9.0.2的linux压缩包进行下载并解压
## 2. 配置Gurobi
在Gurobi网站[申请学术授权](https://www.gurobi.com/downloads/)，然后即可看到自己的授权码  
假设解压的目录为`/home/zfb/gurobi902/linux64/`，运行命令：  
`/home/zfb/gurobi902/linux64/bin/grbgetkey 116e332d-a688-77de-a234-1234aa30bdbe`  
如果授权成功会在`/home/zfb/gurobi902/`目录下生成`gurobi.lic`文件，此时可以通过在终端输入`gurobi.sh`进入交互环境测试功能是否正常  
为了方便使用，修改`~/.bashrc`文件，添加以下内容：  
```bash
export GUROBI_HOME=/home/zfb/gurobi902/linux64
export PATH=${PATH}:${GUROBI_HOME}/bin
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH}:${GUROBI_HOME}/lib
export GRB_LICENSE_FILE=/home/zfb/gurobi.lic
```
然后`source ~/.bashrc`使文件生效，最好登出再登录一次
## 3. 安装cgal与cmake
必须保证`cmake`使用的`boost`库的版本为1.65（如果为1.70会报错），所以如果原本已有boost1.70则需要手动卸载：  
```bash
sudo apt-get --purge remove libboost-dev-all
sudo rm -rf /usr/local/lib/boost*
sudo rm -rf /usr/local/include/boost*
# 如果此前未使用过cmake，仅仅安装而已，否则不要执行这一步
sudo apt-get --purge remove cmake
# 删除cmake目录下的boost
sudo rm -rf /usr/local/lib/cmake/boost*
sudo rm -rf /usr/local/lib/cmake/Boost*
```
开始进行安装：  
```bash
sudo apt-get install libcgal-dev
sudo apt-get install cmake
```
## 4. 安装Qt5
使用以下代码安装Qt5：  
```bash
sudo apt-get install build-essential manpages-dev
sudo apt install make libqt5widgets5 libqt5gui5 libqt5dbus5 libqt5network5 libqt5core5a
sudo apt-get install qtcreator
sudo apt-get install qt5-default
```
然后即可运行`qtcreator`或者点击图标打开项目或创建新项目
## 5. 下载Polyfit源代码
直接下载[最新一次的commit代码](https://github.com/LiangliangNan/PolyFit/tree/d0ee98d630bb29bfd3e66d56317df62fb7d8095b)，然后解压。假设解压到文件夹`/home/zfb/Polyfit/`，修改`/home/zfb/Polyfit/cmake/FindGUROBI.cmake`文件的如下部分：  
```cmake
    # Hardcoded search paths
    set(SEARCH_PATHS_FOR_HEADERS
            "$ENV{GUROBI_HOME}/include"
            "/Library/gurobi901/mac64/include"
            "/home/zfb/gurobi902/linux64/include"
            "C:\\dev\\gurobi901\\win64\\include"
            )

    set(SEARCH_PATHS_FOR_LIBRARIES
            "$ENV{GUROBI_HOME}/lib"
            "/Library/gurobi901/mac64/lib"
            "/home/zfb/gurobi902/linux64/lib"
            "C:\\dev\\gurobi901\\win64\\lib"
            )
```
然后打开`qtcreator`软件，选择打开项目，点击Polyfit文件夹下的`CMakeLists.txt`文件，选择打开，然后点击配置项目，此时即可打开项目并自动执行`cmake`，然后可以执行编译得到可执行文件，既可以选择生成debug版本，也可以选择release版本  
如果遇到以下报错：  
```txt
[100%] Linking CXX executable ../bin/PolyFit
../math/libmath.so: undefined reference to `GRBaddgenconstrAbs'
../math/libmath.so: undefined reference to `GRBaddgenconstrAnd'
../math/libmath.so: undefined reference to `GRBterminate'
../math/libmath.so: undefined reference to `GRBismodelfile'
../math/libmath.so: undefined reference to `GRBModel::addConstr(GRBTempConstr 
....
collect2: error: ld returned 1 exit status
PolyFit/CMakeFiles/PolyFit.dir/build.make:305: recipe for target 'bin/PolyFit' failed
CMakeFiles/Makefile2:741: recipe for target 'PolyFit/CMakeFiles/PolyFit.dir/all' failed
Makefile:83: recipe for target 'all' failed
make[2]: *** [bin/PolyFit] Error 1
make[1]: *** [PolyFit/CMakeFiles/PolyFit.dir/all] Error 2
make: *** [all] Error 2
16:55:37: The process "/usr/bin/cmake" exited with code 2.
Error while building/deploying project PolyFit (kit: Desktop)
When executing step "CMake Build"
```
需要**重新生成libgroubi_c++.a**文件：
```bash
# 进入build文件夹并make生成库
cd gurobi902/linux64/src/build && make
# 移动备份原文件，防止直接覆盖
mv gurobi902/linux64/lib/libgroubi_c++.a ./
# 将生成的文件移动到lib目录
mv ./libgroubi_c++.a ../../lib/
```
然后再进行编译项目即可