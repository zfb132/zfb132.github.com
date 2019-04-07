---
layout: post
title: 初学者的Git
subtitle: "Git的一些简单而且常用的操作"
category : [Git]
tags : [Git,GitHub]
date:       2017-05-11
author:     "晨曦"
header-img: "/img/post/git-bg.jpg"
description:  "本文主要介绍一些简单的命令：包括clone, add, commit, push, pull, branch等"
---
  
## 目录
{: .no_toc}

* 目录
{:toc}

## 介绍  
  很多初学者可能并不太清楚Git与GitHub这两个概念的联系和区别，在这里我大致介绍一下这两个名词。  
  [Git](https://git-scm.com/ "Git")是一个免费、开源的分布式版本控制系统(VCS)。  
  版本控制系统是一种记录一个或若干文件内容变化，以便将来查阅特定版本修订情况的系统。版本控制系统不仅可以应用于软件源代码的文本文件，而且可以对任何类型的文件进行版本控制。版本控制系统分为集中式的版本控制系统(CVCS)比如SVN、VSS和分布式版本控制系统(DVCS)比如Git、Bazaar，前者有一个单一的集中管理的服务器，保存所有文件的修订版本，协同工作的人们通过客户端连接到这台服务器，获取最新的文件或者提交更新，不过显而易见的缺点就是中央服务器的单点故障问题。如果宕机，那么就会出现谁都无法提交更新的情况，那么也就无法协同工作甚至会丢失数据；分布式版本控制系统的特点是用户每次迁出的不是某一个版本的快照，而是原始数据的整个镜像。因此当服务器发生故障的时候，可以用任何一个本地镜像进行恢复。  
  [GitHub](https://github.com/ "GitHub")是一个用Git做版本控制的代码托管平台。它在代码托管领域是先行者，与之类似的还有Gitlab、Bitbucket、GitCafe等。  
## clone  
  如果你经常在网上下载一些源码之类的话，这段命令你就再熟悉不过了。这是克隆仓库的命令，其格式为`git clone [url]`。比如,要克隆 GitHub用户`zfb132`的代码仓库`zfb132.github.com`，可以用下面的命令：  
`git clone git@github.com:zfb132/zfb132.github.com.git`  
  这会在当前目录下创建一个名为`zfb132.github.com`的目录，其中包含一个`.git`的目录，用于保存下载下来的所有版本记录，然后从中取出最新版本的文件拷贝。如果进入这个新建的`zfb132.github.com`目录，你会看到项目中的所有文件已经在里边了。如果希望在克隆的时候，自己定义要新建的项目目录名称，可以在上面的命令末尾指定新的名字：  
`git clone git://github.com/zfb132/zfb132.github.com.git myName`  
  
## init  
  要对现有的某个项目开始用Git管理，只需到此项目所在的目录，执行命令：  
`git init`  
  初始化后，在当前目录下会出现一个名为`.git`的目录，所有Git需要的数据和资源都存放在这个目录中。不过这只是初始化，还没有开始跟踪管理项目中的任何一个文件。  
  
## add  
  如果当前目录下有一个文件test.py想要纳入版本控制，需要使用此命令:  
`git add test.py`  
  需要注意的是，add命令后面支持简化的[正则表达式](https://msdn.microsoft.com/zh-cn/library/ae5bf541.aspx "正则表达式的百科介绍")，比如：  
  `git add *.py`  
  `git add .`
  前者表示将该目录下所有扩展名为py的加入版本控制，后者表示将该目录下所有文件加入版本控制。  
  
## branch  
  列出本地已经存在的分支，并且在当前分支的前面加`*`号标记:  
`git branch`  
  列出远程分支：  
`git branch -r`  
  列出本地分支和远程分支，并且在当前分支的前面加`*`号标记:  
`git branch -a`  
  在本地创建一个新的分支test：  
`git branch test`  
  切换分支到test（如果当前不在test分支的话）：  
`git checkout test`  
在本地创建并切换到test分支：  
`git checkout -b test`  
  在本地删除一个名为test的分支：  
`git branch -d test`  
  在远程删除test分支只需要再加上`-r`参数即可  
  
## remote  
  列出已经存在的远程分支的简要信息：  
`git remote`  
  列出远程分支的详细信息（在每一个名字后面列出其远程url）：  
`git remote -v`  
  添加一个新的远程仓库origin（此处origin自定义，代表的是远程仓库myTest）：  
`git remote add origin git@github.com:zfb132/myTest.git`  
  
## commit  
  提交当前工作目录的修改内容，一般都会加上`-m`参数填写修改描述：  
`git commit -m "修复若干bug"`  

## pull  
  取回远程仓库的next分支与本地的master分支合并：  
`git pull origin next:master`  
  如果远程分支是与当前分支合并，则可以省略一部分：  
`git pull origin next`  
  如果当前分支与远程分支存在追踪关系，则可以省略远程分支名：  
`git pull orign`  
  如果当前分支只有一个追踪分支，可以继续省略：  
`git pull`  
  
## push  
  push命令与pull命令是类似的，因此只举一个例子，上传本地当前分支到远程master分支：  
`git push -u origin master`  
  如果已经在本地新建一个dev分支，但是远程仓库并没有这个分支，可以使用以下命令在远程建立dev分支的同时把本地的dev分支推送到远程的dev分支（需要**保证此时在dev分支下**执行命令）：  
  `git push origin dev:dev`  
## reset  
  彻底回退所有内容到上一个提交的版本：  
`git reset --hard HEAD^`  
  彻底回退所有内容到指定版本04ag58，先用`git log`查看历史提交记录，再指定回退的版本号（提交代号的前六位）：  
`git log`  
`git reset --hard 04ag58`  
  
## 示例  
以下内容是在安装配置好git的前提下才能正常进行的，如果你需要将自己的远程仓库下载到本地`E:\github`目录下，修改后再上传到原仓库的`master`分支  
按照以下步骤：
* 切换到你的工作目录`E:\github`  
* 下载远程仓库到本地：`git clone git@github.com:zfb132/zfb132.github.com.git`，其中`git@github.com:zfb132/zfb132.github.com.git`是在点击下载按钮时显示的地址，不同的仓库对应不同的地址  
* 在本地修改后，终端切换到`E:\github\zfb132.github.com`，其中`zfb132.github.com`是自动生成的对应于这个仓库的目录  
* 输入`git branch`，输出分支的名字（假设显示`* master`,就是属于`master`分支）  
* 输入`git add .`，添加文件  
* 输入`git commit -m "修复bug"`，提交修改记录  
* 输入`git remote add origin git@github.com:zfb132/zfb132.github.com.git`（大部分时候并不需要）  
* 输入`git push -u origin master`（`master`为刚才查看的分支名）  

等待完成后，再进入网页查看就已经更新了
