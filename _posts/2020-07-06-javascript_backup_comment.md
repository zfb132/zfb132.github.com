---
layout: post
title: 使用JavaScript备份QQ空间的留言板数据
subtitle: "有时候爬虫的事情交给JavaScript可以更好更快解决"
category : [Ubuntu,Windows,JavaScript]
tags : [Ubuntu,Windows,JavaScript]
date:       2020-07-06 18:09:25 +08:00
author:     "晨曦"
header-img: "/img/post/javascript-bg.png"
description:  "JavaScript通常是作为开发Web页面的脚本语言，本文介绍的JavaScript代码均运行在指定网站的控制台窗口"
---
  
# 目录
{: .no_toc}

* 目录
{:toc}

## 1. 目标网站
此代码是专门为了备份**本人**的QQ空间留言板的数据而编写的，前提是自己在浏览器登录Qzone账号，且代码只能运行在此链接`https://user.qzone.qq.com/123456789/infocenter`，其中的`123456789`是用户本人的qq号码，另外用户要手动点击网页的`留言板`栏目，然后再运行代码。实现的功能是将每一层楼的留言数据按顺序保存
## 2. 保存浏览器调试窗口的变量到本地文件
编写以下代码，粘贴到控制台并回车  
```javascript
// 为标准console对象添加一个save函数
(function(console){
    console.save = function(data, filename){
        // 若data为空则提示用户
        if(!data) {
            console.error('Console.save: No data');
            return;
        }
        // 默认文件名
        if(!filename){
            filename = 'console.json';
        }
        if(typeof data === "object"){
            data = JSON.stringify(data, undefined, 4);
        }
        var blob = new Blob([data], {type: 'text/json'}),
        e = document.createEvent('MouseEvents'),
        a = document.createElement('a');
        a.download = filename;
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
        e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        a.dispatchEvent(e);
    }
})(console)
```
然后可以在控制台输入`console.save(var_imgs, 'imgs.json')`并回车，浏览器会自动弹出下载文件窗口，并将此变量内容以`json`格式保存到本地
## 3. 编写代码
**此网站的数据如果需要备份，必须注册并登录账号**  
本代码假定已经登录账号的情况下，且用户已经输入链接`https://user.qzone.qq.com/123456789/infocenter`，其中的`123456789`是用户本人的qq号码，并手动点击网页的`留言板`栏目，用户需要自己查看留言板的总页数，将它写入变量`comment_page_number`，然后粘贴并运行代码即可  
```javascript
// 保证F12后的console处选中tgb(msgbcanvas.html)而不是top，否则会出错

// var comment_page_div = document.getElementsByClassName("mod_pagenav_count")[1].getElementsByTagName('a');
// var comment_page_number = parseInt(comment_page_div[comment_page_div.length-1].textContent);
// 留言的页数，将当前页面打开为留言的最新一页
var comment_page_number =77;
var comment_array = new Array();
// 为标准console对象添加一个save函数
(function(console){
    console.save = function(data, filename){
        if(!data) {
            console.error('Console.save: No data');
            return;
        }
        if(!filename){
            filename = 'console.json';
        }
        if(typeof data === "object"){
            data = JSON.stringify(data, undefined, 4);
        }
        var blob = new Blob([data], {type: 'text/json'}),
        e = document.createEvent('MouseEvents'),
        a = document.createElement('a');
        a.download = filename;
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
        e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        a.dispatchEvent(e);
    }
})(console)

// 解析回复部分
function parse_reply(ol_reply) {
    var result = [];
    if(ol_reply.textContent==''){
        return [];
    }
    var content, timestamp, source;
    for(var i=0;i<ol_reply.childElementCount;i++){
        li_reply = ol_reply.childNodes[i];
        info = li_reply.firstElementChild.lastElementChild;
        source = info.firstElementChild.firstElementChild.textContent;
        content = info.firstElementChild.textContent.substring(source.length+1);
        timestamp = info.lastElementChild.firstElementChild.textContent;
        result.push({'发送方':source, '发送内容':content, '时间':timestamp});
    }
    return result;
}

// 解析某条评论
function parse_comment(comment_item) {
    var div_inner = comment_item.firstElementChild.lastElementChild.firstElementChild.firstElementChild;
    var span_user = div_inner.childNodes[0].firstElementChild.firstElementChild.firstElementChild;
    var username = span_user.textContent;
    var userlink = span_user.href;
    var floor_index = div_inner.childNodes[0].childNodes[1].textContent;
    // 暂不支持图片及表情，这些内容会显示为''
    var content = div_inner.childNodes[2].firstElementChild.textContent;
    var div_reply = parse_reply(div_inner.childNodes[4].lastElementChild.childNodes[2]);
    var timestamp = div_inner.childNodes[2].lastElementChild.firstElementChild.textContent;
    var result = {
        '用户':username, '链接':userlink, '楼层':floor_index,
        '内容':content, '时间':timestamp, '回复':div_reply
    }
    comment_array.push(result);
    console.log(result);
}

// 解析某一页的结果
function parse_single() {
    var comments = document.getElementById("ulCommentList");
    for(var i=0;i<comments.childElementCount;i++){
        parse_comment(comments.childNodes[i]);
    }
}

function control_page(index) {
    if(index>=comment_page_number){
        console.save(comment_array, '评论.json');
        return;
    }
    // 解析当前页面
    parse_single();
    // -1表示上一页，1表示下一页
    QZBlog.Util.PageIndexManager.goPage(1);
    // QZBlog.Util.PageIndexManager.goDirectPage(77)
    index = index + 1;
    setTimeout(control_page, 5000, index);
}


setTimeout(control_page, 5000, 0);

/*
// 解析某条评论
function parse_comment_bk(comment_item) {
    var inner_item = comment_item.getElementsByClassName('inner')[0];
    var username = inner_item.getElementsByClassName('c_tx q_namecard')[0].textContent;
    var userlink = inner_item.getElementsByClassName('c_tx q_namecard')[0].href;
    var floor_index = inner_item.getElementsByClassName('c_tx3 floor')[0].textContent;
    // var mobile_cp = inner_item.getElementsByClassName('c_tx3 unline')[0].textContent;
    var content = inner_item.getElementsByTagName("table")[0].textContent;
    var timestamp = inner_item.getElementsByClassName('c_tx3 mode_post')[1].textContent;
    var result = {
        '用户':username, '链接':userlink, '楼层':floor_index,
        '内容':content, '时间':timestamp
    }
    comment_array.push(result);
    console.log(result);
}

// 解析某一页的结果
function parse_single_bk() {
    var comments = document.getElementById("ulCommentList").getElementsByTagName("li");
    for(var i=0;i<document.getElementById("ulCommentList").length;i++){
        parse_comment(comments[i]);
    }
}
*/
```
## 4. 备份完成
最后的`json`文件部分内容示例如下，只支持文字消息的备份  
```json
[
    {
        "用户": "张三",
        "链接": "http://user.qzone.qq.com/111222333",
        "楼层": "第310楼",
        "内容": "生日快乐",
        "时间": "2020-07-06 21:23",
        "回复": [
            {
                "发送方": "我",
                "发送内容": "谢谢",
                "时间": "2019-07-06 23:24"
            },
            {
                "发送方": "张三",
                "发送内容": "明天见",
                "时间": "2019-07-06 23:26"
            },
            {
                "发送方": "我",
                "发送内容": "哈哈，回见",
                "时间": "2019-07-06 23:30"
            }
        ]
    },
    {
        "用户": "李四",
        "链接": "http://user.qzone.qq.com/123412345",
        "楼层": "第309楼",
        "内容": "新年快乐",
        "时间": "2020-02-01 17:44",
        "回复": [
            {
                "发送方": "我",
                "发送内容": "谢谢，同乐",
                "时间": "2020-02-01 23:24"
            }
        ]
    },
    {
        "用户": "王五",
        "链接": "http://user.qzone.qq.com/666777888",
        "楼层": "第308楼",
        "内容": "加油！！！！",
        "时间": "2019-06-06 00:21",
        "回复": [
            {
                "发送方": "我",
                "发送内容": "共勉",
                "时间": "2019-06-06 17:05"
            }
        ]
    },
    // 以下内容省略
]
```
## 5. 后记
当我完成之后，发现github已经有整个[QQ空间的备份工具](https://github.com/ShunCai/QZoneExport)了。。。