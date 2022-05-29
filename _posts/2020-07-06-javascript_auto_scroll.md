---
layout: post
title: JavaScript代码实现浏览器网页的自动滚动并点击
subtitle: "有时候网页很长需要用户一直用鼠标滚动，还要点击，JavaScript解决它"
category : [Ubuntu,Windows,JavaScript]
tags : [Ubuntu,Windows,JavaScript]
date:       2020-07-06 16:34:18 +08:00
author:     "晨曦"
header-img: "/img/post/javascript-bg.png"
description:  "JavaScript通常是作为开发Web页面的脚本语言，本文介绍的JavaScript代码需要运行在特定网站的控制台窗口"
---
  
## 目录
{: .no_toc}

* 目录
{:toc}

## 1. 打开浏览器控制台窗口
[JavaScript](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)通常是作为开发Web页面的脚本语言，本文介绍的JavaScript代码均运行在指定网站的[控制台窗口](https://zh.javascript.info/debugging-chrome)。一般浏览器的开发者窗口都可以通过在当前网页界面按`F12`快捷键调出，然后在上面的标签栏找到`Console`点击就是控制台窗口，在这里可以直接执行JavaScript代码，而`chrome`系浏览器的控制台界面可以使用快捷键`Ctrl+Shift+J`直接打开
## 2. 实时查看鼠标坐标
首先为了获取当前的鼠标位置的x、y坐标，需要先重写一个`onmousemove`函数来帮助我们实时查看光标处的x、y值，方便下一步编写代码时确定初始的y坐标和每次y方向滚动的距离  
```javascript
// 在控制台输入以下内容并回车，即可查看当前鼠标位置
// 具体查看方式：鼠标在网页上滑动时无效果，当鼠标悬停时即可在光标旁边看到此处的坐标
document.onmousemove = function(e){
    var x = e.pageX;
    var y = e.pageY;
    e.target.title = "X is "+x+" and Y is "+y;
};
```
## 3. 编写自动滚动代码
具体代码如下，将代码粘贴进控制台并回车，然后调用`auto_scroll()`函数（具体参数含义在代码注释查看）即可运行  
```javascript
// y轴是在滚动的，每次不一样；x坐标也每次从这些里面随机一个
var random_x = [603, 811, 672, 894, 999, 931, 970, 1001, 1037, 1076, 1094];
// 初始y坐标
var position = 200;
// 最大执行max_num次就多休眠一下
var max_num = 20;
// 单位是秒，每当cnt%max_num为0时就休眠指定时间（从数组中任选一个），单位是秒
var sleep_interval = [33, 23, 47, 37, 21, 28, 30, 16, 44];
// 当前正在执行第几次
var cnt = 0;

// 相当于random_choice的功能
function choose(choices)
{
    var index = Math.floor(Math.random() * choices.length);
    return choices[index];
};

// 相当于广泛的random，返回浮点数
function random(min_value, max_value)
{
    return min_value + Math.random() * (max_value - min_value);
};

// 模拟点击鼠标
function click(x, y)
{
    // x = x - window.pageXOffset;
    // y = y - window.pageYOffset;
    y = y + 200;
    try {
        var ele = document.elementFromPoint(x, y);
        ele.click();
        console.log("坐标 ("+x+", "+y+") 被点击");
    } catch (error) {
        console.log("坐标 ("+x+", "+y+") 处不存在元素，无法点击")
    }
};

// 定时器的含参回调函数
function setTimeout_func_range(time_min, time_max, step_min, step_max, short_sleep=true)
{
    if(cnt<max_num)
    {
        cnt = cnt + 1;
        if(short_sleep)
        {
            // 短休眠
            position = position + random(step_min, step_max);
            x = choose(random_x);
            scroll(x, position);
            console.log("滚动到坐标("+x+", "+position+")");
            click(x, position);
            time = random(time_min, time_max)*1000;
            console.log("开始" + time/1000 + 's休眠');
            setTimeout(setTimeout_func_range, time, time_min, time_max, step_min, step_max);
            // console.log(time/1000 + 's休眠已经结束');
        }else
        {
            // 长休眠，且不滑动，的回调函数
            time = random(time_min, time_max)*1000;
            console.log("开始" + time/1000 + 's休眠');
            setTimeout(setTimeout_func_range, time, time_min, time_max, step_min, step_max);
            // console.log(time/1000 + 's休眠已经结束');
        }
    }else
    {
        cnt = 0;
        console.log("一轮共计"+max_num+"次点击结束");
        time = choose(sleep_interval)*1000;
        console.log("开始" + time/1000 + 's休眠');
        setTimeout(setTimeout_func_range, time, time_min, time_max, step_min, step_max, false);
        // console.log(time/1000 + 's休眠已经结束（长休眠且不滑动）');
    }
};

// 自动滚动网页的启动函数
// auto_scroll(5, 10, 50, 200)表示每隔5~10秒滚动一次；每次滚动的距离为50~200高度
function auto_scroll(time_min, time_max, step_min, step_max)
{
    time = random(time_min, time_max)*1000;
    console.log("开始" + time/1000 + 's休眠');
    setTimeout(setTimeout_func_range, time, time_min, time_max, step_min, step_max);
    // console.log(time/1000 + 's休眠已经结束');
};

/*
---------以下内容无需用到，根据情况使用----------
// 自定义click的回调函数
// 若绑定到元素，则点击该元素会出现此效果
function click_func(e)
{
    var a = new Array("富强","民主","文明","和谐","自由","平等","公正","法治","爱国","敬业","诚信","友善");
    var $i = $("<span></span>").text(a[a_idx]);
    a_idx = (a_idx + 1) % a.length;
    var x = e.pageX,
    y = e.pageY;
    $i.css({
        "z-index": 999999999999999999999999999999999999999999999999999999999999999999999,
        "top": y - 20,
        "left": x,
        "position": "absolute",
        "font-weight": "bold",
        "color": "rgb("+~~(255*Math.random())+","+~~(255*Math.random())+","+~~(255*Math.random())+")"
    });
    $("body").append($i);
    $i.animate({
        "top": y - 180,
        "opacity": 0
    },
    1500,
    function() {
        $i.remove();
    });
};


// 在控制台输入以下内容，即可查看当前鼠标位置
document.onmousemove = function(e){
    var x = e.pageX;
    var y = e.pageY;
    e.target.title = "X is "+x+" and Y is "+y;
};
*/
```
代码运行效果如下<img src="/img/post/js-auto-scroll.png" width="768px" alt="效果"/>