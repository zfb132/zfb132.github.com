---
layout: post
title: "使用Python代码在Windows资源管理器中定位文件"
subtitle: "利用pywin32的api实现该功能"
category : [Python,Windows]
tags : [Python,Windows]
date:       2022-12-27 21:51:00 +08:00
author:     "晨曦"
header-img: "/img/post/win10-bg.jpg"
description:  "通过代码打开资源管理器并选中单个文件或多个文件"
---
  
## 目录
{: .no_toc}

* 目录
{:toc}

## 1. 安装pywin32
```bash
pip install pywin32
```

## 2. 脚本文件内容
```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-
# author: 'zfb'
# time: 2021-01-06 13:33

import os
from pathlib import Path
import win32com.shell.shell as shell

def launch_file_explorer(file_with_abs_path):
    '''
    每次弹出文件资源管理器，只能打开一个文件夹，然后（定位）选择一个文件（夹）
    '''
    file = Path(file_with_abs_path)
    # 对于Linux系统来说
    #    如果使用Unity/Gnome桌面，可以使用命令
    #        nautilus ~/Documents/foo.txt
    #    对于其他桌面系统，可参考 xdg-open 命令
    # 严格按照此格式，不能自己加空格
    os.system('explorer.exe /e,/select,"{}"'.format(file))


def launch_files_explorer(path, files):
    '''
    每次弹出文件资源管理器，只能打开一个文件夹，可以选择多个文件（夹）
    '''
    if len(files) == 0:
        return
    path = str(Path(path))
    folder_pidl = shell.SHILCreateFromPath(path, 0)[0]
    desktop = shell.SHGetDesktopFolder()
    shell_folder = desktop.BindToObject(folder_pidl, None, shell.IID_IShellFolder)
    name_to_item_mapping = dict([(desktop.GetDisplayNameOf(item, 0), item) for item in shell_folder])
    to_show = []
    for file in files:
        if not file in name_to_item_mapping:
            raise Exception("目录{}下找不到文件{}".format(path, file))
        to_show.append(name_to_item_mapping[file])
    shell.SHOpenFolderAndSelectItems(folder_pidl, to_show, 0)


if __name__ == "__main__":
    name = os.path.abspath(__file__)
    path = "D:/github/zfb132.github.com/"
    names = ["index.html", "README.md", "robots.txt"]
    launch_file_explorer(name)
    launch_files_explorer(path, names)
```