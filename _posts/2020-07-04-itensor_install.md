---
layout: post
title: Ubuntu系统下ITensor的安装与测试
subtitle: "使用make命令编译源码安装❤️LM"
category : [Ubuntu]
tags : [Ubuntu,C++]
date:       2020-07-04 16:14:57 +08:00
author:     "晨曦"
header-img: "/img/post/cplusplus-bg.png"
description:  "主要介绍ITensor的下载、编译、安装以及简单测试"
---
  
## 目录
{: .no_toc}

* 目录
{:toc}



## 1. 安装ITensor步骤
### 1.1 基本步骤
1. 下载`ITensor`源码  
`git clone https://github.com/ITensor/ITensor itensor`  
注意：可以把此`itensor`文件夹移动到任何你想安装到的位置。另外，也可以下载[release版本](https://github.com/ITensor/ITensor/releases)的代码压缩包并解压
2. 进入该目录  
`cd itensor`
3. 安装`blas`和`lapack`包用于`ITensor`的编译  
`sudo apt-get install libblas-dev liblapack-dev`
4. 创建并修改make的配置文件  
`cp options.mk.sample options.mk`  
`gedit options.mk`  
然后修改此文件：  
根据文件中的提示，分别更改三个部分  
    * 第一步：选择编译器，使用`GNU GCC compiler`，把其他的注释掉（即保持默认）  
    ```makefile
    CCCOM=g++ -m64 -std=c++17 -fconcepts -fPIC
    ```
    * 第二步：选择`BLAS/LAPACK`相关选项，使用`GNU/LINUX systems`，注释其他，即  
    ```makefile
    PLATFORM=lapack
    BLAS_LAPACK_LIBFLAGS=-lpthread -L/usr/lib -lblas -llapack
    ```
    * 第三步：其余全部保持默认即可
5. 编译源代码  
`make -j$(nproc)`  
6. 此时即可正常使用itensor  

修改后的`options.mk`文件关键部分示例：  
```txt
#########
## [1]
##
## Set which compiler to use by defining CCCOM:
## GNU GCC compiler
CCCOM=g++ -m64 -std=c++17 -fconcepts -fPIC

#########
## [2]
##
## BLAS/LAPACK Related Options
##

##
## Example using a C interface to LAPACK on GNU/LINUX systems
## (Path to lib/ folder may differ on your system)
##
PLATFORM=lapack
BLAS_LAPACK_LIBFLAGS=-lpthread -L/usr/lib -lblas -llapack
```
### 1.2 添加HDF5支持
**可选功能**，在1.1的基础上，执行以下命令安装`HDF5`  
```bash
sudo apt-get install libhdf5-dev
# 记录下面命令的输出
# -L/usr/lib/x86_64-linux-gnu/hdf5/serial
# 则HDF5_PREFIX=/usr/lib/x86_64-linux-gnu/hdf5/serial
h5cc -show
```
然后修改`options.mk`文件，取消注释`HDF5_PREFIX=/usr/local`并修改：  
```makefile
#########
## [3]
##
HDF5_PREFIX=/usr/lib/x86_64-linux-gnu/hdf5/serial
```
然后保存，在当前目录执行`make -j$(nproc)`
### 1.3 添加OpenMP支持
**可选功能**，[OpenMP](http://itensor.org/docs.cgi?vers=cppv3&page=install/install_with_openmp)。如果使用该功能，在运行编译后的程序时需要设置环境变量`OMP_NUM_THREADS`或`OPENBLAS_NUM_THREADS`或`MKL_NUM_THREADS`。实现`OpenMP`有以下3种方法，任选其一即可：  
* 使用`OpenMP`
* 使用`OpenBLAS`
* 使用`Intel MKL`

#### 1.3.1 安装OpenMP
在1.1的基础上，安装`OpenMP`  
```bash
sudo apt-get install libomp-dev
```
另外还要启用`OMP`  
```makefile
#########
## [4]
##
ITENSOR_USE_OMP=1
```
然后保存，在当前目录执行`make -j$(nproc)`

#### 1.3.2 安装OpenBLAS
在1.1的基础上，安装`OpenBLAS`  
```bash
# 安装OpenBLAS OpenMP
sudo apt-get install liblapacke-dev libopenblas-dev
```
然后设置`BLAS/LAPACK`相关选项，**取消注释其他平台**，只保留`openblas`平台；另外还要启用`OMP`  
```makefile
## [2]
##
## BLAS/LAPACK Related Options
##
PLATFORM=openblas
# 根据实际openblas安装位置修改路径
# 也可能是 /usr/local/opt/openblas/lib 和 /usr/local/opt/openblas/include
BLAS_LAPACK_LIBFLAGS=-lpthread -L/usr/lib/x86_64-linux-gnu/openblas-pthread -lopenblas
BLAS_LAPACK_INCLUDEFLAGS=-I/usr/include/x86_64-linux-gnu/openblas-pthread -fpermissive -DHAVE_LAPACK_CONFIG_H -DLAPACK_COMPLEX_STRUCTURE

# ...
#########
## [4]
##
ITENSOR_USE_OMP=1
```
然后保存，在当前目录执行`make -j$(nproc)`


#### 1.3.3 安装配置Intel MKL
该步骤较麻烦，在1.1的基础上：  
安装[Intel-oneAPI-Toolkits](https://www.intel.com/content/www/us/en/develop/documentation/installation-guide-for-intel-oneapi-toolkits-linux/top/installation/install-using-package-managers/apt.html)并启用`intel-mkl`  
然后设置`BLAS/LAPACK`相关选项，**取消注释其他平台**，只保留`mkl`平台；另外还要启用`OMP`  
```makefile
## [2]
##
## BLAS/LAPACK Related Options
##
PLATFORM=mkl
BLAS_LAPACK_LIBFLAGS=-L/opt/intel/mkl/lib/intel64 -lmkl_intel_lp64 -lmkl_intel_thread -lmkl_rt -lmkl_core -liomp5 -lpthread
BLAS_LAPACK_INCLUDEFLAGS=-I/opt/intel/mkl/include

# ...
#########
## [4]
##
ITENSOR_USE_OMP=1
```
然后保存，在当前目录执行`make -j$(nproc)`


## 2. 如何创建和编译itensor项目
### 2.1 官方测试项目
#### 2.1.1 测试sample示例  
```bash
cd ~
# 创建临时目录
mkdir tmp && cd tmp
cp -r ~/itensor/sample/* ./
# 修改Makefile文件
vim Makefile
```
然后替换`Makefile`前两行的  
```makefile
include ../this_dir.mk
include ../options.mk
```
为  
```makefile
# 上一步ITensor的安装路径
LIBRARY_DIR=/home/zfb/itensor
include $(LIBRARY_DIR)/this_dir.mk
include $(LIBRARY_DIR)/options.mk
```
最后执行`make -j$(nproc)`  

#### 2.1.2 测试tutorial的project_template示例  
```bash
cd ~
# 创建临时目录
mkdir temp && cd temp
cp -r ~/itensor/tutorial/project_template/* ./
# 检查Makefile文件的LIBRARY_DIR是否为本机路径
# 若不是，则修改
# 编译
make -j$(nproc)
# 运行
./myappname
```

### 2.2 第一种方法（推荐）
整个项目可以在仓库[itensor-install/first-method](https://github.com/zfb132/itensor_demo/tree/master/itensor-install/first-method)下载  
1. 编写代码文件[myappname.cpp](https://github.com/zfb132/itensor_demo/blob/master/itensor-install/first-method/myappname.cpp)和头文件[myclass.h](https://github.com/zfb132/itensor_demo/blob/master/itensor-install/first-method/myclass.h)以及头文件[myappname.h](https://github.com/zfb132/itensor_demo/blob/master/itensor-install/first-method/myappname.h)
2. 创建文件命名为`Makefile`，内容在下面
3. 编译项目
`make -j$(nproc)`
4. 此时项目文件夹下会生成`myappname`文件，运行代码
`./myappname`

`Makefile`文件的所有内容
```makefile
# 你的itensor在安装时的路径
LIBRARY_DIR=/home/zfb/itensor

# 如果你的main()函数在myappname.cpp文件中，那么就把此处设置为myappname
APP=myappname

# 如果你调用了myclass.h的自定义头文件，那么把它写在这里
HEADERS=myclass.h

#--------- 以下内容无需修改 -----------

CCFILES=$(APP).cpp


include $(LIBRARY_DIR)/this_dir.mk
include $(LIBRARY_DIR)/options.mk

TENSOR_HEADERS=$(LIBRARY_DIR)/itensor/core.h

#Mappings --------------
OBJECTS=$(patsubst %.cpp,%.o, $(CCFILES))
GOBJECTS=$(patsubst %,.debug_objs/%, $(OBJECTS))

#Rules ------------------

%.o: %.cpp $(HEADERS) $(TENSOR_HEADERS)
	$(CCCOM) -c $(CCFLAGS) -o $@ $<

.debug_objs/%.o: %.cpp $(HEADERS) $(TENSOR_HEADERS)
	$(CCCOM) -c $(CCGFLAGS) -o $@ $<

#Targets -----------------

build: $(APP)
debug: $(APP)-g

$(APP): $(OBJECTS) $(ITENSOR_LIBS)
	$(CCCOM) $(CCFLAGS) $(OBJECTS) -o $(APP) $(LIBFLAGS)

$(APP)-g: mkdebugdir $(GOBJECTS) $(ITENSOR_GLIBS)
	$(CCCOM) $(CCGFLAGS) $(GOBJECTS) -o $(APP)-g $(LIBGFLAGS)

clean:
	rm -fr .debug_objs *.o $(APP) $(APP)-g

mkdebugdir:
	mkdir -p .debug_objs
```
**注意**：这里换行之后必须用TAB键缩进，不能用空格
### 2.3 第二种方法
整个项目可以在仓库[itensor-install/second-method](https://github.com/zfb132/itensor_demo/tree/master/itensor-install/second-method)下载  
1. 编写代码文件[test.cpp](https://github.com/zfb132/itensor_demo/blob/master/itensor-install/second-method/test.cpp)和头文件[myclass.h](https://github.com/zfb132/itensor_demo/blob/master/itensor-install/second-method/myclass.h)
2. 编译项目
```bash
g++ -m64 -std=c++17 -fPIC -c -I. -I/home/zfb/itensor -o test.o test.cpp
g++ -m64 -std=c++17 -fPIC -I. -I/home/zfb/itensor test.o -o test -L/home/zfb/itensor/lib -litensor -lpthread -L/usr/lib -lblas -llapack
```
3. 此时项目文件夹下会生成`test`文件，运行代码
`./test`

## 3. 常见问题
截止[ITensor v3.1.11](https://github.com/ITensor/ITensor/releases/tag/v3.1.11)，该库不支持搭配使用`lapack >= 3.9.1`（即`Ubuntu 22.04`），报错类似：  
```txt
tensor/lapack_wrap.cc: In function ‘void itensor::dsyev_wrapper(char, char, itensor::LAPACK_INT, itensor::LAPACK_REAL*, itensor::LAPACK_REAL*, itensor::LAPACK_INT&)’:
tensor/lapack_wrap.cc:342:19: error: too few arguments to function ‘void dsyev_(const char*, const char*, const int*, double*, const int*, double*, double*, const int*, int*, size_t, size_t)’
  342 |     F77NAME(dsyev)(&jobz,&uplo,&n,A,&lda,eigs,&wkopt,&lwork,&info);
      |                   ^
In file included from /usr/include/lapack.h:11,
                 from /usr/include/lapacke.h:36,
                 from /home/zfb/itensor/itensor/tensor/lapack_wrap.h:50,
                 from tensor/lapack_wrap.cc:16:
/usr/include/lapack.h:17008:6: note: declared here
17008 | void LAPACK_dsyev_base(
      |      ^~~~~~~~~~~~~~~~~
tensor/lapack_wrap.cc:345:19: error: too few arguments to function ‘void dsyev_(const char*, const char*, const int*, double*, const int*, double*, double*, const int*, int*, size_t, size_t)’
  345 |     F77NAME(dsyev)(&jobz,&uplo,&n,A,&lda,eigs,work.data(),&lwork,&info);
      |                   ^
In file included from /usr/include/lapack.h:11,
                 from /usr/include/lapacke.h:36,
                 from /home/zfb/itensor/itensor/tensor/lapack_wrap.h:50,
                 from tensor/lapack_wrap.cc:16:
/usr/include/lapack.h:17008:6: note: declared here
17008 | void LAPACK_dsyev_base(
      |      ^~~~~~~~~~~~~~~~~
```
原因是`lapack 3.9.1`修改了部分函数的定义，解决办法  
修改文件`itensor/tensor/lapack_wrap.h`  
原始内容
```cpp
#ifdef FORTRAN_NO_TRAILING_UNDERSCORE
#define F77NAME(x) x
#else
#define F77NAME(x) x##_
#endif
```
修改后内容
```cpp
#ifdef FORTRAN_NO_TRAILING_UNDERSCORE
#define F77NAME(x) x
#else
#if defined(LAPACK_GLOBAL) || defined(LAPACK_NAME)
#define F77NAME(x) LAPACK_##x
#else
#define F77NAME(x) x##_
#endif
#endif
```
目前已经提交[PR](https://github.com/ITensor/ITensor/pull/413)且合并进入主仓库，预计下个版本将会修复