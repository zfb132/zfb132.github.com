---
layout: post
title: 浏览器中使用JavaScript自动批量下载文件
subtitle: "有时候爬虫的事情交给JavaScript可以更好更快解决"
category : [Ubuntu,Windows,JavaScript]
tags : [Ubuntu,Windows,JavaScript]
date:       2020-07-06 17:40:09 +08:00
author:     "晨曦"
header-img: "/img/post/javascript-bg.png"
description:  "JavaScript通常是作为开发Web页面的脚本语言，本文介绍的JavaScript代码均运行在指定网站的控制台窗口"
---
  
# 目录
{: .no_toc}

* 目录
{:toc}

## 1. 目标网站
本代码是专门为了下载[中国地球物理学科中心WDC for Geophysics](http://wdc.geophys.ac.cn/index.asp)的数据而编写的，也只能运行在此网站的控制台窗口。实现的功能是替代用户手动点击，很多数据动辄就是一年共三百多个文件，手动点击费时费力。本代码不对服务器造成任何破坏，仅将点击操作换成自动，且下载时间间隔为5秒
## 2. 编写代码
**此网站的数据如果需要下载，必须注册并登录账号**  
本代码假定已经登录账号的情况下，假定用户下载的数据为[此网页](http://wdc.geophys.ac.cn/dbList.asp?dType=IonoPublish&dStation=Wuhan&dYear=2016)  
```javascript
body = document.getElementById("NewsBody");
center = body.getElementsByTagName("center")[0];
elements = center.children;
// 当前下载的文件是第几个
var index = 0;
// 数据文件总个数
var count = 0;
// 下载间隔时间，单位毫秒
var sleep_interval = 5000;
// 睡眠时间
var sleep_time = 0;

// 定时器的回调函数
function download(index){
    e = elements[index];
    if(e.href){
        e.setAttribute("download",e.innerText.trim());
        sleep_time = sleep_interval;
        e.click();
        count = count + 1;
        console.log("下载文件： " + e.innerText);
    }else{
        sleep_time = 1;
    }
    index = index + 1;
    if(index<elements.length){
        setTimeout(download, sleep_time, index);
    }else{
        console.log("网页包含文件总个数： "+count);
    }
}

// 启动下载
setTimeout(download, 1, 0);
```
