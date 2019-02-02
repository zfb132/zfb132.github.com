## 晨曦的技术博客
 
搭建这个博客的目的是将自己在学习代码过程中的一些心得、经验分享到这里，主要为了方便自己以后查阅，也欢迎大家提出宝贵意见。  

欢迎大家RSS订阅我的博客,只需要复制 `https://blog.whuzfb.cn/feed.xml`到邮箱或者订阅阅读器之类的地方就可以了.  

## 如何发一篇文章    

```
---  
layout: post  
title: 第一篇文章的标题  
subtitle:   "这个是副标题哦"  
categories : [Git]  
tags : [Git]  
date:       2017-05-11  
author:     "晨曦"  
header-img: "/img/post/firstblog-bg.jpg"  
description: 第一篇博客，一些感慨。  
---  
```
  
`2017-05-11-myfirst-blog-test`  文件名示例,日期格式是固定的，不能改变，后面任意  
`layout: post`  固定不变  
`tags : [dplyr,DataBase,RSQLite]`  多个标签要用`,`隔开  
`categories : [Git]` 或者 `category : R` 都可以表示目录分类  
`author:    "晨曦 & ZFB"`  表示多名作者  
`header-img: "/img/post/dplyr1-bg.jpg"` (引用本地`jpg`文件)或 `header-img: "https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/img/logo/bd_logo1_31bdc765.png"` (引用外部文件，https站点的资源文件一律用https)     
`mathjax: true`  加在头文件中,实现数学公式渲染  
  
```
## 目录  
{: .no_toc}  
  
* 目录  
{:toc}  
  
```
中间两个是纯空行，且每一行后面没有加空格。这一段代码用来自动添加目录(检索`<h2>`标签)  

```
{% highlight ruby linenos %}
def foo
  puts 'foo'
end
{% endhighlight %}

```

如果不加`linenos`的话，就只高亮代码，不显示代码行数。  

>为了正常展示高亮部分，你需要包含一个样式表，比如[syntax.css](https://github.com/mojombo/tpw/blob/master/css/syntax.css)。这个样式表与GitHub的代码格式化方案相同，这个文件你可以自由使用。如果要显示行号，那么你可能需要在文件里添加一个lineno的定义


### 关于博客样式主题及开源证书

修改自[BruceZhaoR](https://github.com/BruceZhaoR)和[Hux](https://github.com/Huxpro/huxpro.github.io).    
Licensed under the[Apache License, Version 2.0](/LICENSE)开源证书    
