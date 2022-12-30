---
layout: post
title: "使用ffmpeg对视频和音频文件进行处理"
subtitle: "常用的视频剪辑操作和音频处理操作都是支持的"
category : [Windows,Ubuntu,Linux]
tags : [Windows,Ubuntu,Linux]
date:       2022-12-30 22:59:00 +08:00
author:     "晨曦"
header-img: "/img/post/ffmpeg-logo.svg"
description:  "主要包括视频截取、倍速、输出分辨率、关键帧截取和GIF生成等操作"
---
  
## 目录
{: .no_toc}

* 目录
{:toc}

## 0. 常用命令说明
ffmpeg是一个命令行工具，所有的操作都是通过命令行来完成的，下面是一些常用的命令说明  
* `-vcodec codec`：强制使用`codec`编解码方式（`copy`代表不进行重新编码）
* `-acodec copy`：表示音频不做新的编码，直接把原来的复制过来
* `-vcodec copy`：表示视频不做新的编码，直接把原来的复制过来
* `-threads 5`：指定`5`个线程同时转换
* `-vn`：取消视频的输出
* `-an`：取消音频轨
* `-ab 160000`：设置比特率（单位为`bit/s`）
* `-ar 8000`：设置音频采样率（单位为`Hz`）
* `-ac 1`：设置声道数，`1`就是单声道，`2`就是立体声

## 1. 倍速播放
### 1.1 视频画面倍速播放
把输入的视频文件，画面播放速度快放到原来的2倍，保存为新的视频文件  
`ffmpeg -i input.mp4 -filter:v "setpts=0.5*PTS" output.mp4`
### 1.2 音频倍速播放
把输入的视频文件，音频播放速度快放到原来的2倍，保存为新的视频文件  
`ffmpeg -i input.mp4 -filter:a "atempo=2.0" output.mp4`
### 1.3 视频画面和音频倍速播放
把输入的视频文件，画面播放速度快放到原来的2倍，音频播放速度快放到原来的2倍，保存为新的视频文件  
`ffmpeg -i input.mp4 -filter_complex "[0:v]setpts=0.5*PTS[v];[0:a]atempo=2.0[a]" -map "[v]" -map "[a]" output.mp4`

## 2. 视频片段裁剪
### 2.1 获取视频的分辨率
方法一：获取视频的分辨率，以默认分隔符分割  
`ffprobe -v error -show_entries stream=width,height -of csv=p=0 demo.mp4`  
得到输出为： `1920,1080`  
  
方法二：获取视频的分辨率，以`x`分隔符分割  
`ffprobe -v error -show_entries stream=width,height -of csv=p=0:s=x output2.mp4`  
得到输出为： `1920x1080`  

### 2.2 截取指定时长的视频片段
从视频文件中，截取时间从`00:00:00`开始到`00:00:11`之间的片段，输出为新的视频文件  
`ffmpeg -ss 00:00:00 -to 00:00:11 -i input.mp4 -vcodec copy -acodec copy output.mp4`  

从视频文件中，截取时间从`00:01:00`开始，时长`00:00:21`的片段，输出为新的视频文件  
`ffmpeg -ss 00:01:00 -t 00:00:21 -i input.mp4 -vcodec copy -acodec copy output2.mp4`  
  
从视频文件中，截取时间从`00:00:00`到`00:00:11`之间的片段，分辨率为`1920x1080`，输出为新的视频文件  
`ffmpeg -ss 00:00:00 -to 00:00:11 -i input.mp4 -vcodec copy -acodec copy -s 1920,1080 output.mp4`  
  
### 2.3 裁剪视频画面尺寸
参数示例：`crop=new_width:new_height:start_x:start_y`  
把原视频画面裁剪成宽高为`400x200`的新视频，`x`的起始位置是`0`（表示从该位置开始，向右`400`的像素留下），`y`的起始位置是`0`（表示从该位置开始，向下`200`的像素留下）。也就是说，最后留下的视频画面为原视频画面的一部分（以原视频画面的左上顶点为原点）  
`ffmpeg -i input.mp4 -vf crop=400:200:0:0 -threads 5 -preset ultrafast -strict -2 output.mp4`  

## 3. 视频导出图片
从视频文件中，以每秒`3`帧的速率抽取图片，并更改为指定长、宽，最后按照指定命名格式保存  
`ffmpeg -i demo.mp4 -r 3 -s 1920x1080 -f image2 ./demo-%03d.jpeg`

## 4. 从图片集创建GIF文件
从图片集创建帧率为`5`的`GIF`文件  
`ffmpeg -f image2 -framerate 5 -i ./demo-%03d.jpeg out.gif`  

## 5. 提取视频文件的音频
提取视频文件的音频内容保存为`mp3`格式  
`ffmpeg -i demo.mp4 -f mp3 -vn -ar 16000 -ac 1 demo.mp3`  

## 6. 把音频和画面合并为新的视频
`ffmpeg -loglevel quiet -i video.m4s -i audio.m4s -c copy -y out.mp4`  

## 7. 下载m3u8文件为.ts文件
`ffmpeg -protocol_whitelist file,http,https,tcp,tls -i https://t.cn/a.m3u8 -c copy my_movie.ts`  

## 8. 批量提取视频关键帧
```bash
#!/bin/bash

shopt -s nullglob

export video_path="$1"
export out_path="$2"
export files=(${video_path}/*)
# echo ${files[@]}
# echo ${#files[@]}
for filename in "${files[@]}"
do
    filename="${filename}"
    export name=$(basename "${filename}")
    name=${name%.*}
    echo Converting ${filename}
    export file_dir="${out_path}/${name}"
    mkdir "${file_dir}"
    # 获取视频分辨率（宽，高）
    # 例如： 1920,1080
    # export wh=ffprobe -v error -show_entries stream=width,height -of csv=p=0 "${filename}"
    # 视频提取语音，方便识别
    ffmpeg -y -i "${filename}" -f mp3 -vn -ar 16000 -ac 1 "${file_dir}/audio.mp3"
    # 视频关键帧提取，方便导出PPT
    ffmpeg -y -i "${filename}" -vf select='eq(pict_type\,I)' -vsync 2 -s 1920,1080 -f image2 "${file_dir}/keyframe-%03d.png"
    echo Convert ${filename} successfully!
done
```