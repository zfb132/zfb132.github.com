---
layout: post
title: 在Ubuntu系统安装配置OpenSfm
subtitle: "OpenSfm是三维重建领域做得很好的开源软件库"
category : [Ubuntu,Linux,Git,Python]
tags : [Ubuntu,Linux,Git,GitHub,Python]
date:       2020-07-18 20:50:09 +08:00
author:     "晨曦"
header-img: "/img/post/ubuntu-canonical-bg.png"
description:  "主要介绍如何编译安装opengv、ceres以及opensfm"
---
  
# 目录
{: .no_toc}

* 目录
{:toc}

## 1. 介绍
照相机是将一个三维场景或物体投影到二维平面上，降维的过程通常会存在信息的损失，而重建(Reconstruction)就是要从获取到的众多二维图像中复原原始三维场景或物体。具体流程就是：  
* 通过多角度拍摄或者从视频中提取得到一组图像序列，将这些图像序列作为整个系统的输入
* 在多视角的图像中，根据纹理特征提取出稀疏特征点（称为点云），通过这些特征点估计相机位置和参数
* 得到相机参数并完成特征点匹配后，就可以获得更稠密的点云
* 根据这些点重建物体表面，并进行纹理映射，就还原出三维场景和物体了

简略来说就是：图像获取->特征匹配->深度估计->稀疏点云->相机参数估计->稠密点云->表面重建->纹理映射
## 2. 下载OpenSfm
### 2.1 下载opensfm的原始github库
* 访问[OpenSfm](https://www.opensfm.org/docs/building.html)的项目主页查看安装步骤：  
`git clone --recursive https://github.com/mapillary/OpenSfM`  
如果速度慢，可以使用`git config --global https.https://github.com.proxy socks5://127.0.0.1:1080`  
注意，递归方式才会下载`OpenSfM/opensfm/src/third_party/pybind11`文件夹下的内容，否则要自己下载pybind11的zip文件解压在对应位置：  
`rmdir pybind11/ && git clone https://github.com/pybind/pybind11.git`  
* 也可以opensfm下载release版本0.4.0，然后解压进入pybind11文件夹下载pybind11的zip文件
### 2.2 安装依赖
使用如下命令安装依赖：  
```bash
sudo apt-get install build-essential cmake libatlas-base-dev libatlas-base-dev libgoogle-glog-dev libopencv-dev libsuitesparse-dev python3-pip python3-dev  python3-numpy python3-opencv python3-pyproj python3-scipy python3-yaml libeigen3-dev
```
安装opengv，[官网教程](https://www.opensfm.org/docs/building.html)，具体步骤如下（`DPYTHON_INSTALL_DIR`是要安装到的目录）：  
```bash
mkdir source && cd source/
git clone --recurse-submodules -j8 https://github.com/laurentkneip/opengv.git
cd opengv && mkdir build && cd build
cmake .. -DBUILD_TESTS=OFF -DBUILD_PYTHON=ON -DPYBIND11_PYTHON_VERSION=3.6 -DPYTHON_INSTALL_DIR=/usr/local/lib/python3.6/dist-packages/
sudo make install
```
安装ceres，可以[按照此步骤](https://github.com/paulinus/opensfm-docker-base/blob/master/Dockerfile.python3)  
```bash
cd ../../
curl -L http://ceres-solver.org/ceres-solver-1.14.0.tar.gz | tar xz
cd ./ceres-solver-1.14.0 && mkdir build-code && cd build-code
cmake .. -DCMAKE_C_FLAGS=-fPIC -DCMAKE_CXX_FLAGS=-fPIC -DBUILD_EXAMPLES=OFF -DBUILD_TESTING=OFF
sudo make -j4 install
```
安装pip库，然后build这个opensfm的库，安装在pip里面  
```
cd ../../../ && pip3 install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt
python3 setup.py build
```
此时opensfm即安装成功
## 3. 测试
在opensfm主目录下  
```bash
bin/opensfm_run_all data/berlin
python3 -m http.server
```
点击`viewer`文件夹，选择`reconstruction.html`打开，然后选择上面命令生成的文件`data/berlin/reconstruction.meshed.json`；也可以在`undistorted`文件夹下面找到`merged.ply`文件打开即可  
如果使用SIFT提取特征，需要`pip3 install -i https://pypi.tuna.tsinghua.edu.cn/simple opencv-contrib-python==3.4.2.16`（opencv-python版本不用改动）