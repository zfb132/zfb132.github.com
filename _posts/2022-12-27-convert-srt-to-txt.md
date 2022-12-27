---
layout: post
title: SRT字幕文件转文本文件
subtitle: "使用Python脚本将多个SRT字幕文件转换为单个文本文件，方便对视频内容进行复习和总结"
category : [Python,Linux,Ubuntu,Windows]
tags : [Python,Linux,Ubuntu,Windows]
date:       2022-12-27 19:35:11 +08:00
author:     "晨曦"
header-img: "/img/post/python-bg.png"
description:  "前提是可以获取到视频的字幕文件，且格式为SRT"
---
  
## 目录
{: .no_toc}

* 目录
{:toc}

## 1. 获取字幕文件
一般来说，很多视频网站都会提供视频的字幕文件。有的可以直接下载，有的需要先下载视频，然后再使用字幕软件提取字幕文件。还有一些可以在Chrome浏览器中安装字幕插件，然后在视频播放页面中直接下载字幕文件。总而言之，需要先获取到字幕文件，然后才能进行下一步操作。`SRT`格式的字幕文件是最常见的，其格式如下所示：  
{% highlight txt linenos %}
1
00:00:00,000 --> 00:00:02,000
Life is short

2
00:00:02,205 --> 00:00:04,000
You need Python
{% endhighlight %}
可以看到，字幕文件由多个字幕组成，每个字幕由两行组成，第一行是字幕的序号，第二行是字幕的时间轴，第三行是字幕的内容。字幕之间用空行分隔。所以，只需要先删除所有空行，然后对`line_num%3==0`的行进行处理，即可得到字幕的内容  

## 2. python脚本
文件内容如下：  
```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-
# author: 'zfb'
# time: 2019-10-26 17:17

import argparse
import glob
import os

# 输出文件的头部信息，可以为空
header = "zfb 2019-10-26 17:17\n\n"
# 段落开始符号
begin_para_symbol = "  "
# 拼接句子的符号
split_line_symbol = "，"
# 拼接字幕文件的符号
split_file_symbol = "\n\n\n"

def read_toc(file_name):
    with open(file_name, "r", encoding="utf8") as file:
        lines = file.readlines()
        # 去除所有空行
        strip_lines = [line.strip()+"\n" for line in lines if len(line.strip())]
        return strip_lines

def read_srt(file_name):
    with open(file_name, "r", encoding="utf8") as file:
        lines = file.readlines()
        # 去除所有空行
        strip_lines = [line.strip() for line in lines if len(line.strip())]
        # 根据文件格式，字幕文字所在行是3的倍数，从起始位置，到结束位置，间隔为3
        text_lines = strip_lines[2::3]
        # 按照逗号拼接全文
        text = split_line_symbol.join(text_lines)
        return text

def get_files(directory):
    # 按文件名排序
    return sorted(glob.glob(os.path.join(directory, "*.srt")))

def convert(srt_files, toc_lines, txt_name):
    content = header
    for i in range(len(srt_files)):
        content = content + toc_lines[i] + begin_para_symbol + read_srt(srt_files[i]) + split_file_symbol
    with open(txt_name, "w") as file:
        file.write(content)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description='SRT字幕文件转TXT文件',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=
'''\
用法示例：
    python srt2txt.py ./srt/ ./content.txt -t ./toc.txt
    python srt2txt.py ./srt/ ./content.txt
    python srt2txt.py
'''
    )
    # 可选参数
    parser.add_argument(
        "-s", "--srt_dir", type=str, default="./srt/",
        help="*.srt字幕文件所在目录，默认为当前目录下的srt文件夹"
    )
    parser.add_argument(
        "-o", "--output_name", type=str, default="./content.txt",
        help="输出文件名，默认为content.txt"
    )
    parser.add_argument(
        "-t", "--toc", type=str, default="./toc.txt",
        help="目录文件名，默认为toc.txt, 如果没有，会根据字幕文件名生成"
    )
    args = parser.parse_args()
    # 字幕文件所在目录
    srt_file_path = args.srt_dir
    # 目录文件，如果没有，会根据字幕文件名生成
    toc_file = args.toc
    # 输出文件
    txt_file = args.output_name
    files = get_files(srt_file_path)
    if os.path.exists(toc_file):
        # 读取目录文件
        toc_lines = read_toc(toc_file)
    else:
        # 根据srt文件名，生成目录文件
        toc_lines = [os.path.basename(file) + "\n" for file in files]
    convert(files, toc_lines, txt_file)
```