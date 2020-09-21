---
layout: post
title: Windows常用批处理文件
subtitle: "windows一些比较好用的小技巧"
category : [Windows]
tags : [Windows,BAT]
date:       2020-07-03 17:34:25 +08:00
author:     "晨曦"
header-img: "/img/post/win10-bg.jpg"
description:  "批处理功能在解决批量解压、复制、重命名以及删除文件时，可以节省大量人工"
---
  
# 目录
{: .no_toc}

* 目录
{:toc}


## 1. 批量复制文件  
创建文件`copy_file.bat`，内容如下，保存为`ANSI`编码，否则中文会乱码：  
```bat
@echo off & color 0A
REM 指定起始文件夹：需要将此bat文件放在这些文件夹的同级
set MYDIR="%cd%"
echo 当前目录为：%MYDIR%
set src_dir=C:\Users\zfb\Desktop\test-bat\
set name1=%src_dir%Fig.m
set name2=%src_dir%c.m
set name3=%src_dir%e.m
REM set name4=%src_dir%x.m
REM set name5=%src_dir%y.m
REM set name6=%src_dir%z.m

REM dir /ad /b /s "%MYDIR%"
REM 此命令会递归子目录下的文件夹
for /f "delims=" %%i in ('dir /ad /b "%MYDIR%"') do (
    echo %%i
    echo 正在复制文件%name1%到文件夹%%i
    copy %name1% %%i
    echo 正在复制文件%name2%到文件夹%%i
    copy %name2% %%i
    echo 正在复制文件%name3%到文件夹%%i
    copy %name3% %%i
    md %%i\SpectralLine\6.6MHz\High
    md %%i\SpectralLine\6.6MHz\Low
    md %%i\SpectralLine\8.0MHz\High
    md %%i\SpectralLine\8.0MHz\Low
    md %%i\SpectralLine\9.4MHz\High
    md %%i\SpectralLine\9.4MHz\Low
    md %%i\SpectralLine\PL
    echo 已创建文件夹SpectralLine
)
pause
```
或者直接下载[蓝奏云文件](https://zfb132.lanzous.com/iMtYxgtgd5e "copy_file.bat")，双击即可实现功能。  
具体功能解释：  
  
把需要被复制的文件和文件夹放置在`C:\Users\zfb\Desktop\test-bat\`目录下面  
```txt  
test-bat
├── Fig.m
├── c.m
├── e.m
└── SpectralLine
    ├── 6.6MHz
    │   ├── Line
    │   └── Surf
    ├── 8.0MHz
    │   ├── Line
    │   └── Surf
    ├── 9.4MHz
    │   ├── Line
    │   └── Surf
    └── PL

11 directories, 3 files
```
  
目标文件夹的结构以及`.bat`文件放置如下：  
```txt  
dst_dir
├── 20051007_tau8
│   ├── test1
│   ├── test2
│   └── 新建文本文档.txt
├── 20151107_tau9
│   ├── test1
│   ├── test2
│   └── 新建文本文档.txt
├── 20151208_beata_FI
│   ├── my.txt
│   ├── test1
│   └── test2
└── copy_file.bat

9 directories, 4 files
```
  
要将这两个文件`C:\Users\zfb\Desktop\test-bat\`目录下的所有内容复制到，`copy_file.bat`所在文件夹的每个子目录下。最终效果：  
```txt  
dst_dir
├── 20051007_tau8
│   ├── Fig.m
│   ├── SpectralLine
│   │   ├── 6.6MHz
│   │   │   ├── High
│   │   │   └── Low
│   │   ├── 8.0MHz
│   │   │   ├── High
│   │   │   └── Low
│   │   ├── 9.4MHz
│   │   │   ├── High
│   │   │   └── Low
│   │   └── PL
│   ├── c.m
│   ├── e.m
│   ├── test1
│   ├── test2
│   └── 新建文本文档.txt
├── 20151107_tau9
│   ├── Fig.m
│   ├── SpectralLine
│   │   ├── 6.6MHz
│   │   │   ├── High
│   │   │   └── Low
│   │   ├── 8.0MHz
│   │   │   ├── High
│   │   │   └── Low
│   │   ├── 9.4MHz
│   │   │   ├── High
│   │   │   └── Low
│   │   └── PL
│   ├── c.m
│   ├── e.m
│   ├── test1
│   ├── test2
│   └── 新建文本文档.txt
├── 20151208_beata_FI
│   ├── Fig.m
│   ├── SpectralLine
│   │   ├── 6.6MHz
│   │   │   ├── High
│   │   │   └── Low
│   │   ├── 8.0MHz
│   │   │   ├── High
│   │   │   └── Low
│   │   ├── 9.4MHz
│   │   │   ├── High
│   │   │   └── Low
│   │   └── PL
│   ├── c.m
│   ├── e.m
│   ├── my.txt
│   ├── test1
│   └── test2
└── copy_file.bat

42 directories, 14 files
```
  
## 2. 批量解压文件  
经常会遇到下载的原始数据是按照特定规律的许多压缩包，它们可能分布在不同的文件夹下面，但是文件的扩展名是一致的。如果想要将每个压缩包`解压到其所在的当前文件夹`、`覆盖已经解压过的文件`（方便程序异常退出后重新运行）、`删除解压成功的压缩包`、`保留解压失败的压缩包及其路径`等操作，则可以新建`unzip_all_files.bat`文件，内容如下：  
```bat
@echo off
set WinRAR="C:\Program Files\WinRAR\WinRAR.exe"
set log_name="\log.txt"
set log=%cd%%log_name%
for /r . %%a in (*.rar *.zip *.Z *.gz) do ( 
    cd "%%~pa" 
    rem auto replace files that exists
    rem x : extract
    rem -o+ : cover mode
    rem -ilog : error msg to file
    rem -inul : do not display error window
    rem -iback : run in the background
    rem -mt : thread num
    %WinRAR% x -o+ -ilog%log% -inul -iback -mt12 "%%a"
    rem last command run successfully
    if %errorlevel% == 0 (
        rem delete compress file
        del "%%a"
    )
)
```
或者直接下载[蓝奏云文件](https://zfb132.lanzous.com/imANFe9qghc "unzip_all_files.bat")，双击即可实现功能  
## 3. 批量重命名文件后缀
新建文件`rename_suffix.bat`，内容如下：  
```bat
ren *.7z *.zip
```
双击此文件，即可将当前目录下的所有`.7z`文件的扩展名修改为`.zip`  
## 4. 解决Win10局域网共享问题（未测试）
创建文件`fix_lan_share.bat`，内容如下：  
```bat
@echo off
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
setlocal enabledelayedexpansion
echo.
ver | find "10." > NUL && goto win10
 
:error
mshta vbscript:msgbox(" 脚本只适用Win10系统",vbSystemModal+64,"警告")(window.close) 
exit
 
:win10
::改写组策略
echo Windows Registry Editor Version 5.00 >%temp%\smb.reg
echo. >> %temp%\smb.reg
echo [HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows\LanmanWorkstation] >> %temp%\smb.reg
echo @=""  >> %temp%\smb.reg
echo "AllowInsecureGuestAuth"=dword:00000001 >> %temp%\smb.reg
regedit /s %temp%\smb.reg
 
echo 添加smb访问组件
dism /online /format:table /get-features
dism /online /enable-feature /featurename:SMB1Protocol
 
mshta vbscript:msgbox(" 设置完成。电脑重启后生效！",vbSystemModal+64,"注意")(window.close) 
 
exit
```
或者直接下载[蓝奏云文件](https://zfb132.lanzous.com/iwGEUe9qvni "rename_suffix.bat")，双击即可实现功能  