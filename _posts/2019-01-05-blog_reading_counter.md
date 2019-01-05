---
layout: post
title: 添加阅读量统计
subtitle: "使用LeanCloud的免费资源来开发"
category : [JavaScript]
tags : [JavaScript]
date:       2019-01-05
author:     "晨曦"
header-img: "/img/default-bg.jpg"
description:  "对于Jekyll创建的博客不如Hexo的模板丰富，很多功能都需要自己动手完成"
---


## 前言
Jekyll 是一个简单的免费的 Blog 生成工具，类似 WordPress 。它只是一个生成静态网页的工具，不需要数据库支持，最重要的是，GitHub Pages 基于 Jekyll 构建，所以可轻而易举地在 GitHub 上免费发布网站并自定义域名。Jekyll 具有许多的主题可以选择，也有很多插件可以安装，都只需要在文件`_config.yml`中写明即可，不过我自己找了好久也没发现具有博客文章访问量统计的相关插件（虽然我的博客基本没什么人访问，但也还是想认真做好，权当是给自己的备忘录）。然后就去万能的搜索引擎寻找答案，参考别人的教程以及 leancloud 的 API 使用方法最终完成了点击量的功能
## 准备工作
第一步，需要已经成功使用 GitHub Pages ，然后去[ leancloud 官网](https://www.leancloud.cn/ "官网")注册一个用户并登录  
第二步，创建新应用：应用名称可以随意填写，计价方案选择`开发版`，然后点击创建
<img src="/img/post/reading-create-app.png" width="768" alt="创建应用">
第三步，创建class：名字为`Counter`，其他都保持默认值即可  
<img src="/img/post/reading-create-class.png" width="768" alt="创建Class">
第四步，为`Counter`添加列：默认会有四个列字段，不要改动。自己选择`添加列`，然后依次添加三个列，分别是`url`（String 类型），`time`（Number 类型），`title`（String 类型）  
<img src="/img/post/reading-create-column.png" width="768" alt="创建列字段">
最后，添加网址白名单：左侧的`设置`栏目，点击`安全中心`，在`Web 安全域名`处填写自己博客网站的域名  
<img src="/img/post/reading-add-whitelist.png" width="768" alt="填写网址白名单">
## 模板文件修改
首先，打开`index.html`，在文中合适位置添加以下代码：  
```浏览量:&nbsp;<span id="{{ post.url }}" class="leancloud_visitors" data-flag-title="{{ post.title }}"> - </span>次.```
同时根据需求也可将此代码加入到`post.html`的合适位置  
然后，再分别在以上两个文件中加入 JavaScript 代码来控制实现功能：
```html
<!-- 同时兼容http与https -->
<script src="//cdn1.lncld.net/static/js/2.5.0/av-min.js"></script>
<script>
    // 第一个参数是appid，第二个参数是appkey，此处的只是示例
    AV.initialize("gQJjjB93fxTAN0W6cmFdlOrW-gzGzoHsz", "IcwsNtdTDwM9gdkJfLNJKcck");
    // 自己创建的Class的名字
    var name='Counter';
    function createRecord(Counter){
      // 设置 ACL
      var acl = new AV.ACL();
      acl.setPublicReadAccess(true);
      acl.setPublicWriteAccess(true);
      // 获得span的所有元素
      var elements=document.getElementsByClassName('leancloud_visitors');
      // 一次创建多条记录
      var allcounter=[];
      for (var i = 0; i < elements.length ; i++) {
        // 若某span的内容不包括 '-' ，则不必创建记录
        if(elements[i].textContent.indexOf('-') == -1){
          continue;
        }
        var title = elements[i].getAttribute('data-flag-title');
        var url = elements[i].id;
        var newcounter = new Counter();
        newcounter.setACL(acl);
        newcounter.set("title", title);
        newcounter.set("url", url);
        newcounter.set("time", 0);
        allcounter.push(newcounter);
        // 顺便更新显示span为默认值0
        elements[i].textContent=0;
      }
      AV.Object.saveAll(allcounter).then(function (todo) {
        // 成功保存记录之后
        console.log('创建记录成功！');
      }, function (error) {
        // 异常错误 
        console.error('创建记录失败: ' + error.message);
      });
    }
    function showCount(Counter){
      // 是否需要创建新纪录的标志（添加一篇新文章）
      var flag=false;
      var query = new AV.Query(name);
      query.greaterThanOrEqualTo('time', 0);
      query.find().then(function (results) {
        // 当获取到的记录为0时置默认值
        if(results.length==0){
          $('.leancloud_visitors').text('-');
          flag=true;
          console.log('返回查询记录为空');
          // 如果获取到空记录就创建新记录
          createRecord(Counter);
          return;
        }
        // 将获取到的数据设置为text
        for (var i = 0; i < results.length; i++) {
          var item = results[i];
          var url = item.get('url');
          var time = item.get('time');
          var element = document.getElementById(url);
          element.textContent = time;
        }
        // 当某个span含有默认值时说明需要创建记录
        if($('.leancloud_visitors').text().indexOf("-") != -1){
          flag=true;
        }
        // 当获取的记录数与span个数不吻合时
        if(results.length != $('.leancloud_visitors').length){
          flag=true;
        }
        if(flag){
          createRecord(Counter);
        }
      }, function (error) {
        console.log('query error:'+error.message);
      });
    }
    $(function() {
      var Counter = AV.Object.extend(name);
      showCount(Counter);
    });
</script>
```
其中，`appid`和`appkey`可以在 leancloud 网站的设置的`应用Key`处找到并粘贴  
<img src="/img/post/reading-appid.png" width="768" alt="AppID和AppKey">
最后，等待修改生效即可。如果没有意外的话，这里将会看到如下结果：
<img src="/img/post/reading-ideal-result.png" width="768" alt="理想结果">
## 写在最后
这个阅读量统计的功能本身实现并不难，并不需要多么复杂的逻辑和 JavaScript 代码，我原本是打算使用自己的服务器创建一系列的接口并使用数据库来保存这些信息的。后来考虑到我的服务器可能没那么稳定，以及 leancloud 的免费个人开发版的接口调用次数限制对我这个超级冷清的博客来说已经足够了，最重要的大概是我太懒了吧，不想自己再实现一套接口，就这样吧，希望能对遇到此问题的朋友以帮助
