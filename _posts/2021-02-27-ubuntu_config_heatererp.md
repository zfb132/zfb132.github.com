---
layout: post
title: 在ubuntu系统安装配置heatererp软件
subtitle: "该软件包对EISCAT高频电离层加热器的有效辐射功率（ERP）和辐射模式进行建模"
category : [Ubuntu,Linux]
tags : [Ubuntu,Linux]
date:       2021-02-27 15:37:56 +08:00
author:     "晨曦"
header-img: "/img/post/ubuntu-canonical-bg.png"
description:  "自动从日志文件中读取发射机参数并计算生成PDF格式的辐射模式图"
---
  
## 目录
{: .no_toc}

* 目录
{:toc}

## 1. 下载软件包并安装依赖
安装需要依赖的软件，使用`nec2c`虽然运行慢，但是配置简单  
`sudo apt-get install zip nec2c octave`  
本项目代码仓库网址： [https://gitlab.com/andrewsenior/heatererp](https://gitlab.com/andrewsenior/heatererp "")  
项目介绍网址： [https://www.eiscat.uit.no/DataBases/heating_logs/htr-log-index-2015.html](https://www.eiscat.uit.no/DataBases/heating_logs/htr-log-index-2015.html "")  
## 2. 配置heatererp
启动heatererp，步骤如下：  
`cd ~/heatererp-master/bin`  
`chmod +x ./erpmodel.sh`  
`./erpmodel.sh`  
然后会提示设置各种路径，可以随便弄，然后再修改`~/.config/heatererp/conf.m`文件中的路径  
设置完以后保证`conf.m`的内容如下，注意`model_engine`设置为`nec2c`  
```matlab
% Configuration script for Heater ERP model
model_dir='/home/zfb/heatererp-master/models';
nec2_bin='/the/real/path/to/nec2';
nec2c_bin='nec2c';
model_engine='nec2c';
log_dir='/home/zfb/heatererp/logs';
results_dir='/home/zfb/heatererp/results';
plots_dir='/home/zfb/heatererp/plots';
```
## 3. 创建文件夹保存运算结果
创建的文件夹要与`conf.m`文件中设置的相对应  
`cd ~ && mkdir heatererp && cd heatererp`  
`mkdir logs plots results`
## 4. 运行测试
放置log文件，执行sh脚本运行模型  
`cp ~/heatererp-master/testing/1970-01-01_tx.log ~/heatererp/logs/`  
`cd ~/heatererp-master/bin && ./erpmodel.sh`  
在打开的octave软件的提示符里面输入以下内容即可计算  
`erpmodel('01-Jan-1970 00:00:00');erpmodel('01-Jan-1970 01:28:00');`
等待运行结束，在`/home/zfb/heatererp/`对应文件夹寻找结果  
## 5. 注意
* 在Ubuntu 18.04系统测试通过（Ubuntu 20.04好像不太行）
* 如果系统有GUI，还会同时显示图片
* `.log`文件的第一行是实验开始时间，`erpmodel()`的参数可以是那个时刻及以后的时刻