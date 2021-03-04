---
layout: post
title: matplotlib常见问题
subtitle: "安装python的matplotlib库的时候可能会遇到一些问题"
category : [Windows,Ubuntu]
tags : [Windows,Ubuntu,Python]
date:       2020-07-02 21:51:12 +0800
author:     "晨曦"
header-img: "/img/post/matplotlib-bg.png"
description:  "记录自己安装matplotlib库时遇到的一些问题和解决方法"
---
  
# 目录
{: .no_toc}

* 目录
{:toc}


## 1. 图像无法显示  
**第一种情况：需要在终端显示**  
先使用以下代码安装`PyQT5`  
`pip install PyQT5`  
然后在自己编写的python文件代码里导入库的下一行加上以下内容：   
`matplotlib.use('Qt5Agg')`   
**第二种情况：需要在jupyter显示**  
在绘制图形语句之前添加以下内容，然后再绘制图像即可：  
`%matplotlib inline`  
## 2. linux系统下画图中文乱码  
在Ubuntu系统下安装matplotlib后，在画图时发现图中的标题、图例等使用中文的地方全部显示为方块，即乱码。按照以下步骤即可解决此问题（假设用户名为`ubuntu`，`matplotlib`安装在`py36`的虚拟环境下）  
1. 安装msyh字体（即微软雅黑字体），可以在[github下载](https://github.com/zfb132/program_font "msyh")，也可以在[蓝奏云下载](https://zfb132.lanzous.com/iYMA7e8z0gd "msyh")，共有`msyh.ttf、msyhbd.ttf、msyhl.ttf`三个文件
2. 把这三个文件复制到`/usr/share/fonts/`目录下
3. 再把这三个文件复制到`/home/ubuntu/pycharm/py36/lib/python3.6/site-packages/matplotlib/mpl-data/fonts/ttf/`目录下
4. 切换到上一步的目录，在此目录下备份原文件`sudo mv DejaVuSans.ttf quondamDejaVuSans.ttf`
5. 将下载的新字体文件改名为原文件一致`sudo mv msyh.ttf DejaVuSans.ttf`

然后再修改`matplotlibrc`文件：  
`vi /home/ubuntu/pycharm/py36/lib/python3.6/site-packages/matplotlib/mpl-data/matplotlibrc`  
把以下几行注释去掉并修改为如下内容：  
```txt
font-family : sans-serif 
# 注意添加雅黑
font.sans-serif: Microsoft YaHei, DejaVu Sans, 
axes.unicode_minus : False
```
## 3. windows系统下画图中文乱码  
操作步骤与linux系统的相同，具体文件路径不同  
字体文件的存放路径是  
`C:\Users\zfb\AppData\Local\Programs\Python\Python37\Lib\site-packages\matplotlib\mpl-data\fonts\ttf\`  
`matplotlibrc`文件所在路径是  
`C:\Users\zfb\AppData\Local\Programs\Python\Python37\Lib\site-packages\matplotlib\mpl-data\`

## 4. 找不到basemap模块
如果遇到报错信息如下：  
`ImportError: No module named 'mpl_toolkits.basemap'`  
则打开[网站](https://www.lfd.uci.edu/~gohlke/pythonlibs/#basemap)，下载适合自己`Python`版本与`OS`版本的`wheel`压缩包，然后安装即可，例如：  
`pip install -i https://pypi.tuna.tsinghua.edu.cn/simple basemap‑1.2.2‑cp38‑cp38‑win_amd64.whl`  
或者使用`conda install -c conda-forge basemap`  
亦或参考[此链接](https://matplotlib.org/basemap/users/installing.html)  