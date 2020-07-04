---
layout: post
title: Ubuntu系统下ITensor的安装与测试
subtitle: "使用make命令编译源码安装"
category : [Ubuntu]
tags : [Ubuntu,C++]
date:       2020-07-04 16:14:57 +08:00
author:     "晨曦"
header-img: "/img/post/cplusplus-bg.png"
description:  "主要介绍ITensor的下载、编译、安装以及简单测试"
---
  
# 目录
{: .no_toc}

* 目录
{:toc}



## 1. 安装ITensor步骤
1. 下载ITensor源码  
`git clone https://github.com/ITensor/ITensor itensor`
注意：可以把此itensor文件夹移动到任何你想安装到的位置
2. 进入该目录
`cd itensor`
3. 安装blas和lapack包用于itensor的编译
`sudo apt-get install libblas-dev liblapack-dev`
4. 创建并修改make的配置文件
`cp options.mk.sample options.mk`
`gedit options.mk`
然后修改此文件：
根据文件中的提示，分别更改三个部分
    * 第一步：选择编译器，使用GNU GCC compiler，把其他的注释掉
    * 第二步：选择BLAS/LAPACK选项，使用GNU/LINUX systems，其他注释
    * 第三步：选择编译选项，默认即可，不需要修改
5. 编译源代码
`make`
6. 此时即可正常使用itensor


## 2. 如何创建和编译itensor项目
### 2.1 第一种方法（推荐）
1. 编写代码文件[myappname.cpp](https://github.com/zfb132/itensor/blob/master/itensor-install/first-method/myappname.cpp)和头文件[myclass.h](https://github.com/zfb132/itensor/blob/master/itensor-install/first-method/myclass.h)以及头文件[myappname.h](https://github.com/zfb132/itensor/blob/master/itensor-install/first-method/myappname.h)
2. 创建文件命名为`Makefile`，内容在下面
3. 编译项目
`make`
4. 此时项目文件夹下会生成`myappname`文件，运行代码
`./myappname`

Makefile文件的所有内容
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
### 2.2 第二种方法
1. 编写代码文件[test.cpp](https://github.com/zfb132/itensor/blob/master/itensor-install/second-method/test.cpp)和头文件[myclass.h](https://github.com/zfb132/itensor/blob/master/itensor-install/second-method/myclass.h)
2. 编译项目
```bash
g++ -m64 -std=c++17 -fPIC -c -I. -I/home/zfb/itensor -o test.o test.cpp
g++ -m64 -std=c++17 -fPIC -I. -I/home/zfb/itensor test.o -o test -L/home/zfb/itensor/lib -litensor -lpthread -L/usr/lib -lblas -llapack
```
3. 此时项目文件夹下会生成`test`文件，运行代码
`./test`