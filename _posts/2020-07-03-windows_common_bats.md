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
:: 指定起始文件夹：需要将此bat文件放在这些文件夹的同级
set DIR="%cd%"
echo 当前目录为：%DIR%
set src_dir=C:\Users\zfb\Desktop\test\
set name1=%src_dir%a.txt
set name2=%src_dir%b.txt

for /f "delims=" %%i in ('dir /ad /b /s "%DIR%"') do (
    echo 正在复制文件%name1%到文件夹%%i
    copy %name1% %%i
    echo 正在复制文件%name2%到文件夹%%i
    copy %name2% %%i
    md %%i\dir_new
)
pause
```
或者直接下载[蓝奏云文件](https://zfb132.lanzous.com/iQXZxe9ptuh "copy_file.bat")，双击即可实现功能。具体功能解释：目标文件夹的结构以及`.bat`文件放置如下：  
```txt
|--test
|------copy_files.bat
|------file01
|------dir01
|----------dir01A
|----------dir01B
|------dir02
|----------dir01A
|----------dir01B
|----------dir01C
|------dir03
|----------file01
```
要将这两个文件`C:\Users\zfb\Desktop\test\a.txt、C:\Users\zfb\Desktop\test\b.txt`复制到目标文件夹及其每个子目录下，另外再新建一个目录`dir_new`，最后效果如下：  
```txt
|--test
|------copy_files.bat
|------file01
|------dir01
|----------a.txt
|----------b.txt
|----------dir_new
|----------dir01A
|--------------a.txt
|--------------b.txt
|--------------dir_new
|----------dir01B
|--------------a.txt
|--------------b.txt
|--------------dir_new
|------dir02
|----------a.txt
|----------b.txt
|----------dir_new
|----------dir01A
|--------------a.txt
|--------------b.txt
|--------------dir_new
|----------dir01B
|--------------a.txt
|--------------b.txt
|--------------dir_new
|----------dir01C
|--------------a.txt
|--------------b.txt
|--------------dir_new
|------dir03
|----------a.txt
|----------b.txt
|----------dir_new
|----------file01
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