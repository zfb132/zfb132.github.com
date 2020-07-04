---
layout: post
title: Win10专业版使用VSCode调试ITensor项目
subtitle: "使用VSCode连接WSL来编译和调试"
category : [Ubuntu,Windows]
tags : [Ubuntu,Windows,C++]
date:       2020-07-04 19:20:27 +08:00
author:     "晨曦"
header-img: "/img/post/win10-bg.jpg"
description:  "适用于Windows的Linux子系统搭配VSCode编写和调试代码很方便"
---
  
# 目录
{: .no_toc}

* 目录
{:toc}


## 1. 安装vscode和wsl子系统
* 访问[vscode官网](https://code.visualstudio.com/)下载最新稳定的windows版本并安装
* 为vscode安装扩展`C/C++`和`Remote-SSH`
* 在win10专业版中找到`启用或关闭windows功能`，选择`适用于Linux的Windows子系统`，根据提示安装后重启系统
* 在应用商店里面搜索框输入`linux`，选择匹配的第一个选项点击<img src="/img/post/itensor-vscode-01.png" width="768" alt="应用商店搜索linux"/>
* 在新的页面选择Ubuntu，点击并安装，等待安装完成即可
* 在开始菜单找到刚才安装好的Ubuntu应用，点击进入会自动配置，等待配置完成即可输入用户名和密码来使用Ubuntu系统
* 在wsl系统下使用`sudo apt-get update && sudo apt-get install make`来安装make工具
## 2. 安装itensor
具体方法见[itensor-install/README.md](https://github.com/zfb132/itensor/blob/master/itensor-install/README.md)
## 3. 使用vscode编写代码
### 3.1 配置vscode
打开vscode，点击左下角的`><`标志  <img src="/img/post/itensor-vscode-02.png" width="768" alt="><标志"/>  
选择`Remote-WSL: New Window`，然后在新窗口中进行操作，新窗口的左下角标志为下图<img src="/img/post/itensor-vscode-03.png" width="768" alt="Remote-WSL: New Window"/>
原窗口可以根据自己需要决定是否关闭；至于`Select Python Interpreter`可以点击后选择第一个，或者不管它  
### 3.2 windows的文件与wsl系统的文件互相访问
windows读取wsl系统的文件：
1. 在windows文件管理器进入目录`C:\Users\zfb\AppData\Local\Packages\`，这里的`zfb`是用户名，根据每个人的电脑设置不同这个名称也会变化
2. 在文件夹下找到以`CanonicalGroupLimited.UbuntuonWindows`开头的那个目录，点击进入，并再选择`LocalState`文件夹进入
3. 在文件夹下右键点击`rootfs`，选择`固定到快速访问`，之后便可以在左侧快速访问直接进入这个`rootfs`文件夹了<img src="/img/post/itensor-vscode-04.png" width="768" alt="rootfs固定到快速访问"/>
它里面的目录即为Ubuntu系统的目录，可以直接交互

wsl系统读取windows的文件：
打开Ubuntu应用，也就是一个终端窗口，输入命令`cd /mnt/c`则进入C盘主路径，同理`cd /mnt/d`进入D盘主路径，可以通过`ls`命令来验证
### 3.3 创建新的文件夹
创建一个新的itensor项目通常要新建一个文件夹
**第一种方法**：
在步骤2中打开的窗口里面，点击菜单栏`终端-->新建终端`，然后在下面的窗口即可使用命令行创建文件夹（与Ubuntu系统的终端功能用法完全一致），若已经有此终端则不需要新建，直接使用即可
<img src="/img/post/itensor-vscode-06.png" width="768" alt="终端-->新建终端"/>
**第二种方法，不推荐，可能会有问题**：
在windows资源管理器打开`rootfs`文件夹，一般再进入`home`文件夹，`zfb`文件夹（用户名，根据自己设置的不同而不同）
<img src="/img/post/itensor-vscode-05.png" width="768" alt="用户名文件夹"/>
在当前目录下新建文件夹即可
### 3.4 正式编写代码
在vscode的菜单栏点击`文件-->打开文件夹`，在弹出的窗口选择你要打开的文件夹（一般为上一步创建的文件夹），点击`确定`即可
<img src="/img/post/itensor-vscode-07.png" width="768" alt="文件-->打开文件夹"/>
上图中打开的文件夹即为`test`，在此处右键即可选择新建文件或者文件夹<img src="/img/post/itensor-vscode-08.png" width="768" alt="新建文件或者文件夹"/>
这里以`test`文件夹为例，需要注意的是`Makefile`文件来源于github下载的itensor压缩包的`tutorial/project_template`文件夹下，Makefile文件里面的对应变量需要修改（根据步骤2即可），`.cpp`文件和`.h`文件根据自己需要修改为自己的代码
**下面是最重要的设置路径和任务环节，配置一次即可以后复制过来永久使用**  

1. 创建文件夹`.vscode`，不要忘记前面的`.`<img src="/img/post/itensor-vscode-09.png" width="768" alt="创建文件夹.vscode"/>
2. 在`.vscode`文件夹下为`C/C++`扩展添加配置文件`c_cpp_properties.json`，内容如下
```json
{
    "configurations": [
        {
            "name": "Linux",
            "includePath": [
                "${workspaceFolder}/**",
                "/home/zfb/itensor/**"
            ],
            // 修改includePath的第二个值为itensor的安装路径
            // 即options.mk文件所在的目录
            "defines": [],
            "compilerPath": "/usr/bin/gcc",
            "cStandard": "c11",
            "cppStandard": "c++17",
            "intelliSenseMode": "clang-x64"
        }
    ],
    "version": 4
}
```
3. 在`.vscode`文件夹下添加配置文件`tasks.json`，内容如下
```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "itensor-build",
            "command": "make",
            "args": [],
            "type": "shell"
          },
          {
            "label": "itensor-build-debug",
            "command": "make",
            "args": [
              "debug"
            ],
            "type": "shell"
          },
          {
            "label": "itensor-clean",
            "command": "make",
            "args": [
              "clean"
            ],
            "type": "shell"
          }
    ]
}
```
4. 在`.vscode`文件夹下添加配置文件`launch.json`，内容如下
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "(gdb) Launch",
            "type": "cppdbg",
            "request": "launch",
            "program": "${fileDirname}/${fileBasenameNoExtension}-g",
            "args": [],
            "stopAtEntry": false,
            "cwd": "${fileDirname}",
            "environment": [],
            "externalConsole": false,
            "MIMode": "gdb",
            "miDebuggerPath": "gdb",
            "setupCommands": [
                {
                    "description": "Enable pretty-printing for gdb",
                    "text": "-enable-pretty-printing",
                    "ignoreFailures": false,
                }
            ],
            "preLaunchTask": "itensor-build-debug" 
            // 调试会话开始前执行的任务，与tasks.json的label相对应
        }
    ]
}
```

以上四步执行完毕后的目录如下
<img src="/img/post/itensor-vscode-10.png" width="768" alt="项目目录"/>

### 3.5 编译和运行
**第一种方法**：
1. 打开`main()`函数所在的`.cpp`文件，保证激活的窗口这里为此文件，也可以打开其他文件，但是一定要保证当前编辑器窗口显示的是此文件的代码<img src="/img/post/itensor-vscode-11.png" width="768" alt="文件代码"/>
2. 菜单栏选择`调试-->启动调试`即可运行此代码（不要设置断点，否则就进入调试了），若出现下图
<img src="/img/post/itensor-vscode-12.png" width="768" alt="调试-->启动调试"/>
则点击图中的`终端`即可切换到程序输出结果界面
<img src="/img/post/itensor-vscode-13.png" width="768" alt="点击终端"/>

**第二种方法**：
点击菜单栏的`终端-->新建终端`，然后在弹出的窗口里面即可使用Ubuntu命令，编译使用`make`，运行使用`./myappname`等等
<img src="/img/post/itensor-vscode-14.png" width="768" alt="终端-->新建终端"/>
### 3.6 调试代码
1. 鼠标移动到你需要暂停的那一行的行号的前面，鼠标指针会变成小手形状，同时会有一个虚的红点，左键点击即可在当前位置设置断点，同理可以在其他位置也添加断点
<img src="/img/post/itensor-vscode-15.png" width="768" alt="设置断点"/>
2. 菜单栏选择`调试-->启动调试`即可调试此代码
<img src="/img/post/itensor-vscode-16.png" width="768" alt="调试-->启动调试"/>

上面中间位置的工具栏可以控制进行`继续运行直到下一个断点`、`单步跳过`、`单步调试`、`单步跳出`、`重启程序`、`结束调试`  
左侧可以查看变量的值，鼠标在编辑区的变量上悬停也可以看到变量的值
## 4. 快速使用
建立在已经熟悉前面三个步骤的基础上，直接新建文件夹`test1`，然后把`.vscode`文件夹和里面的文件直接复制到`test1`文件夹下，在此文件下编写代码，运行调试即可