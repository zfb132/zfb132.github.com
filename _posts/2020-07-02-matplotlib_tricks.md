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
  
## 目录
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
### 2.1 方法1
在Ubuntu系统下安装matplotlib后，在画图时发现图中的标题、图例等使用中文的地方全部显示为方块，即乱码。按照以下步骤即可解决此问题（假设`matplotlib`安装在`py36`的虚拟环境下，则目录为`~/py36/lib/python3.6/site-packages/matplotlib/mpl-data/fonts/ttf/`；若是系统默认的python，则目录一般为`~/.local/lib/python3.10/site-packages/matplotlib/mpl-data/fonts/ttf/`）  
1. 在[github下载](https://github.com/zfb132/program_font "msyh")，也可以在[蓝奏云下载](https://zfb132.lanzous.com/iYMA7e8z0gd "msyh")，共有`msyh.ttf、msyhbd.ttf、msyhl.ttf`三个文件。也可以根据需要把其他字体复制到
2. 把这三个文件复制到刚才找到的`ttf`（根据当前所用环境的不同，路径的前缀会有区别，以自己机器为准）目录下面。另外，也可以把其他自己需要的字体复制过来
3. 删除matplotlib的字体缓存配置：删除文件`~/.cache/matplotlib/fontlist*.json`、`~/.matplotlib/fontList.cache`、`~/.cache/matplotlib/fontList.cache`（如果存在的话就删除，不存在则跳过）。下次画图时matplotlib会根据`ttf`文件夹下的字体自动重新创建

测试的python代码如下  
```python
import matplotlib.pyplot as plt
import numpy as np
# 解决中文显示问题
# 使用仿宋 GB2312
plt.rcParams['font.sans-serif'] = ['FangSong_GB2312']
# 解决负号显示问题
plt.rcParams['axes.unicode_minus'] = False
# 生成一些数据
x = np.linspace(0, 10, 100)
y = np.sin(x)
# 创建图形
plt.figure(figsize=(8, 6))
# 绘制数据
plt.plot(x, y, label="正弦波")
# 添加标题和坐标轴标签（包含中文）
plt.title("正弦函数的图像", fontsize=20)
plt.xlabel("时间 (秒)", fontsize=15)
plt.ylabel("振幅", fontsize=15)
# 显示图例
plt.legend()
# 显示网格
plt.grid(True)
# 显示图形
plt.show()
```

下面介绍如何根据获取字体的英文名称，用于在matplotlib设置字体  
```bash
# 在linux命令行输入以下命令（路径前缀需要根据自己实际情况修改），获取ttf文件夹下的字体信息
# 只关注 family 这个字段的第一个名字（英文名字）
# 例如仿宋 GB2312字体的名字就是 FangSong_GB2312
# 例如楷体 GB2312字体的名字就是 KaiTi_GB2312
fc-query /home/ubuntu/.local/lib/python3.10/site-packages/matplotlib/mpl-data/fonts/ttf/*.ttf | grep GB2312
#    family: "FangSong_GB2312"(s) "仿宋_GB2312"(s)
#    fullname: "FangSong_GB2312"(s) "仿宋_GB2312"(s)
#    file: "/home/ubuntu/.local/lib/python3.10/site-packages/matplotlib/mpl-data/fonts/ttf/仿宋_GB2312.ttf"(s)
#    postscriptname: "FangSong_GB2312"(s)
#    family: "KaiTi_GB2312"(s) "楷体_GB2312"(s)
#    fullname: "KaiTi_GB2312"(s) "楷体_GB2312"(s)
#    file: "/home/ubuntu/.local/lib/python3.10/site-packages/matplotlib/mpl-data/fonts/ttf/楷体_GB2312.ttf"(s)
#    postscriptname: "KaiTi_GB2312"(s)
```
### 2.2 方法2
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