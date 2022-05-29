---
layout: post
title: 为Github仓库添加Github Actions实现持续集成
subtitle: "Github Actions是Github推出的CI工具，配置文件采用yaml格式"
category : [Ubuntu,Linux,Windows,Git,Android]
tags : [Ubuntu,Linux,Windows,Git,GitHub,Android]
date:       2020-08-09 20:20:11 +08:00
author:     "晨曦"
header-img: "/img/post/ubuntu-canonical-bg.png"
description:  "公开仓库可以免费使用此功能，私有仓库也有一定的使用额度"
---
  
## 目录
{: .no_toc}

* 目录
{:toc}

## 说明
对于普通的github仓库，只需要在根目录创建`.github/workflows/`文件夹即可自动使用Actions功能，具体执行的操作可以创建一个配置文件（命名不限），如`build_apk.yml`  
[Github Actions产品](https://docs.github.com/cn/actions/getting-started-with-github-actions)对公开仓库是完全免费的，对私人仓库每月有2000分钟使用时间，详细说明见[费用](https://docs.github.com/cn/github/setting-up-and-managing-billing-and-payments-on-github/about-billing-for-github-actions)。另外，github有许多官方[已经实现好的actions](https://github.com/actions/)可以供用户直接调用，用户只需用设置参数即可  
每个配置文件称为一个工作流程（workflow），每个工作流程可以包含多个作业（job），每个作业可以包含一系列的步骤（steps），每个step可以称为action，可以认为这是三个层级  
* workflow的[基本语法](https://docs.github.com/cn/actions/reference/workflow-syntax-for-github-actions)
* workflow语法的[基本数据类型、函数和内置变量](https://docs.github.com/cn/actions/reference/context-and-expression-syntax-for-github-actions)
* workflow支持的所有[触发条件](https://docs.github.com/cn/actions/reference/events-that-trigger-workflows)，过滤[指定的触发条件](https://docs.github.com/cn/actions/configuring-and-managing-workflows/configuring-a-workflow#manually-running-a-workflow)
* 在workflow及以下层级[使用GITHUB_TOKEN秘钥](https://docs.github.com/cn/actions/configuring-and-managing-workflows/authenticating-with-the-github_token)的方法（内置，无需设置，直接调用）
* 在workflow及以下层级[使用其他秘钥](https://docs.github.com/cn/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets)的方法
* 在workflow的[多个job之间传递数据](https://docs.github.com/cn/actions/configuring-and-managing-workflows/persisting-workflow-data-using-artifacts)的方法
* job及其以下层级的[条件运行](https://docs.github.com/cn/actions/reference/workflow-syntax-for-github-actions#%E4%BD%BF%E7%94%A8%E4%B8%8A%E4%B8%8B%E6%96%87%E7%9A%84%E7%A4%BA%E4%BE%8B)
* 在job的不同step之间传递数据的方法
* 在job的某个step里面[使用Docker](https://docs.github.com/cn/actions/creating-actions/creating-a-docker-container-action)的方法
* 在job里面[使用cache](https://docs.github.com/cn/actions/configuring-and-managing-workflows/caching-dependencies-to-speed-up-workflows)来加快每次构建速度
* 为job下面的所有步骤的run命令[设置默认shell和工作目录](https://docs.github.com/cn/actions/reference/workflow-syntax-for-github-actions#defaultsrun)

## 1. 编写Android项目的CI配置文件
这里以项目[WhuHelper](https://github.com/zfb132/WhuHelper)为例，介绍如何使用YAML语法和Github Actions功能  
* 原始仓库的文件版本为[c1a78da](https://github.com/zfb132/WhuHelper/tree/c1a78da55e34b064907a957ce5c20cad8b999e42)
* 添加CI功能（自动进行`build test`、`build app-debug.apk`）以后的文件版本为[4ef2e90](https://github.com/zfb132/WhuHelper/tree/4ef2e900c40c569a47f872ee42c138a3c8ad925d)，只需要关注文件[build_apk.yml](https://github.com/zfb132/WhuHelper/blob/4ef2e900c40c569a47f872ee42c138a3c8ad925d/.github/workflows/build_apk.yml)即可，其他文件无变化
* 最终的CI功能包括自动进行构建测试、构建`app-debug.apk`、创建仓库的release（只包括代码，且只在`push tag`时触发）、为此次release添加apk文件，文件版本为[20fe364](https://github.com/zfb132/WhuHelper/tree/20fe36406e5d9c9114dadc2947d789b793e93f27)，只需要关注文件[build_apk.yml](https://github.com/zfb132/WhuHelper/blob/20fe36406e5d9c9114dadc2947d789b793e93f27/.github/workflows/build_apk.yml)即可，其他文件无变化

主要涉及到的操作为：设置workflow及以下层级的每个操作名字、设置workflow的触发条件、创建多个job、job的条件执行、调用别人写好的actions、自己为某个step设置输出参数供其他步骤调用、持久化build的结果、上传build的结果供用户下载、下载build的结果供下一步操作使用、多个job之间传递数据、多个step之间传递数据、使用环境变量  
实例`build_apk.yml`文件内容及解析如下：  
```yaml
name: Auto build debug apk

# 设置workflow的触发条件
# 在pull和push到主分支时触发workflow
# 在push tags时触发workflow
on:
  pull_request:
    branches:
      - 'master'
  push:
    branches:
      - 'master'
    # 在push tag时触发
    tags:
      - '*'

# workflow的所有作业job
jobs:
  # 单个job的名字：测试Android项目
  # 每个job执行完毕会默认删除所有文件等
  #   可通过cache来保留特定文件夹和文件
  #   也可使用upload-artifact上传来实现保留文件，再配合download-artifact实现多job之间的数据传递
  test:
    # test这个作业的实际名字
    # 也是执行build时Actions监控处显示的名字
    name: Run Unit Tests
    # job的运行平台，还有windows、macos及不同版本可供选择
    runs-on: ubuntu-18.04
    # test任务的具体步骤，可以有很多个步骤，都写在这里
    steps:
      # 使用别人写好的指定版本的actions脚本，名称是checkout
      # 这是步骤1，即每个'-'符号到下一个'-'符号之间的部分是一个步骤
      - uses: actions/checkout@v2
      # 这是步骤2，创建java环境，with里面填写actions的输入参数
      - name: set up JDK 1.8
        uses: actions/setup-java@v1
        # 设置setup-java脚本的输入参数
        with:
          java-version: 1.8
      # 步骤3，执行shell命令
      - name: Unit tests
        run: bash ./gradlew test --stacktrace

  apk:
    name: Generate APK
    runs-on: ubuntu-18.04

    steps:
      - uses: actions/checkout@v2
      - name: set up JDK 1.8
        uses: actions/setup-java@v1
        with:
          java-version: 1.8
      - name: Build debug APK
        run: bash ./gradlew assembleDebug --stacktrace
      # 利用upload-artifact实现build结果的保存（可以在Actions的控制台下载压缩文件）
      - name: Upload APK
        uses: actions/upload-artifact@v2
        with:
          # 设置压缩文件的名称，在控制台会得到WhuHelper-debug.zip文件的下载链接
          # 下载后解压缩，里面直接可以看到app-debug.apk，没有其他东西
          name: WhuHelper-debug
          path: app/build/outputs/apk/debug/app-debug.apk

  deploy:
    name: Upload Release Asset
    # 依赖上一个job
    needs: apk
    runs-on: ubuntu-latest
    # 只在tag时执行，即在自己终端运行以下代码后才会触发
    # git tag -a v0.1.0 -m "release 0.1.0 version"
    # git push origin –-tags
    if: contains(github.ref, 'tags/')
    steps:
      # 自己编写的shell命令
      # 学习如何设置单个任务的输出来被其他任务调用
      - name: Prepare Release
        # 设置id一般是为了其他step调用本步骤的输出
        id: prepare_release
        run: |
          TAG_NAME=`echo $GITHUB_REF | cut -d / -f3`
          echo ::set-output name=tag_name::$TAG_NAME
      - name: Download build result for job apk
        # 只有上一步获取到tag_name才继续，下载前面apk任务里面的WhuHelper-debug.zip文件
        # 自动解压缩到当前文件夹，自动删除原压缩文件
        # 多任务之间的数据交换
        if: steps.prepare_release.outputs.tag_name
        uses: actions/download-artifact@v2
        with:
          name: WhuHelper-debug
      - shell: bash
        # 手动更改apk名字
        run: |
          mv app-debug.apk  app-debug-${{steps.prepare_release.outputs.tag_name}}.apk 
      # 发布release，版本号是用户git push的tag里面的版本号，发布的只有代码压缩包（与手动默认发布一致）
      - name: Create Release
        id: create_release
        # 只有上一步获取到tag_name才继续
        if: steps.prepare_release.outputs.tag_name
        uses: actions/create-release@v1
        env:
          # GitHub 会自动创建 GITHUB_TOKEN 密码以在工作流程中使用
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          # 设置时区，默认是格林尼治时间
          # TZ: Asia/Shanghai
        with:
          tag_name: ${{steps.prepare_release.outputs.tag_name}}
          release_name: Release ${{steps.prepare_release.outputs.tag_name}} by zfb
          draft: false
          prerelease: false
      # 这一步是对上一步发布的release文件的补充，调用github api上传一个apk文件
      - name: Upload Release Asset
        id: upload-release-asset 
        # 只有create_release成功得到输出才继续
        if: steps.create_release.outputs.upload_url
        uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          upload_url: ${{ steps.create_release.outputs.upload_url }} 
          asset_path: ./app-debug-${{steps.prepare_release.outputs.tag_name}}.apk
          asset_name: app-debug-${{steps.prepare_release.outputs.tag_name}}.apk
          asset_content_type: application/vnd.android.package-archive
```
## 2. 编写Jekyll项目的CI配置文件
### 2.1 配置`coding.net`
主要包括以下步骤：  
* 首先新建一个空项目（如果已经有了的话就不需要再新建，但是要保证与Github的对应仓库版本一致，防止无法commit）
* coding.net的代码仓库新建`访问令牌`，授予仓库权限，假设名字为`GITHUB_AUTO_DEPLOY`，复制显示的token备用
* 在该代码仓库，找到`设置-->仓库设置`，即可看到[设置本仓库地址](https://zfbin.coding.net/p/zfbin/d/zfbin/git/settings/depot)的方法，本例子显示为（格式为`https://e.coding.net/团队名/项目名/仓库名.git`）  
`git remote set-url origin https://e.coding.net/zfbin/zfbin/zfbin.git`

使用token来读写远程仓库（格式为`https://用户名:token@e.coding.net/团队名/项目名/仓库名.git`），使用如下命令自己测试一下，用户名（默认是手机号码）为`13677888877`，上一步得到的token是`cdd0b865cdd0b865cdd0b865cdd0b865cf87ce84`，团队名称是`zfbin`，项目的名称是`zfbin`，代码仓库的名称是`zfbin`（这里所有配置的敏感信息都是示例）：
```text
 ~/work/github/zfbin > git push  "https://13677888877:cdd0b865cdd0b865cdd0b865cdd0b865cf87ce84@e.coding.net/zfbin/zfbin/zfbin.git" master:master
Everything up-to-date
 ~/work/github/zfbin >
```
### 2.2 配置`github`
打开Github的[此仓库的Secrets](https://github.com/zfb132/zfb132.github.com/settings/secrets)选项，新建以下秘钥：
```text
DEPLOY_CODING    cdd0b865cdd0b865cdd0b865cdd0b865cf87ce84
CODING_USERNAME  13677888877
CODING_REF       e.coding.net/zfbin/zfbin/zfbin.git
```
### 2.3 自动部署到`coding.net`
github的仓库的原始文件版本为[8570167](https://github.com/zfb132/zfb132.github.com/tree/857016713b4b3a191c5c5f86d213c6512c24137a)，最终添加github actions之后的文件版本为[0462a89e](https://github.com/zfb132/zfb132.github.com/tree/0462a89e81a1f05f59b03fa989cb3d3bfd26c351)，不需要关注其他文件，只考虑`.github/workflows/deploy_to_coding.yml`文件，其内容如下：  
```yaml
name: Auto deploy to coding pages

# 在push主分支时触发构建
on:
  push:
    branches:
      - 'master'

jobs:
  # job的名字：推送到coding
  deploy:
    name: Deploy to Coding
    # job的运行平台
    runs-on: ubuntu-18.04
    # test任务的步骤
    steps:
      # 使用别人写好的指定版本的actions脚本，名称是checkout，下载本仓库
      - uses: actions/checkout@v2
      - name: 设置提交者的个人信息
        # 这三个变量的值都放在 https://github.com/zfb132/zfb132.github.com/settings/secrets
        env:
          # 设置时区
          TZ: Asia/Shanghai
          # 在coding.net的某个仓库新建访问令牌出现的秘钥
          coding_token: ${{ secrets.DEPLOY_CODING }}
          # 团队中的某个人的用户名，一般默认是本人手机号码
          coding_username: ${{ secrets.CODING_USERNAME }}
          # 格式为：e.coding.net/组织名/项目名/仓库名.git
          coding_ref: ${{ secrets.CODING_REF }}
        run: |
          export message=$(git log --pretty=format:"%s" -1)
          [ -f CNAME ] && rm CNAME || echo "CNAME doesn't exist"
          rm -rf .github
          rm -rf .git
          git clone https://${coding_username}:${coding_token}@${coding_ref} coding_dir
          cd coding_dir && mv .git ../ && cd ../ && rm -rf coding_dir
          git config --local user.email "zfb132@gmail.com"
          git config --local user.name "zfb"
          git config core.filemode false
          git remote set-url origin https://${coding_ref}
          git add .
          git commit -m "$message"
          git push --force --quiet "https://${coding_username}:${coding_token}@${coding_ref}" master:master
```
具体运行的命令的解释：  
* `export message=$(git log --pretty=format:"%s" -1)`是获取github的提交的message  
* `rm CNAME`是删除github仓库的`CNAME`文件，因为coding.net不需要此文件  
* `rm -rf .github`是删除github actions的配置文件，因为coding.net不需要进行CI  
* `rm -rf .git`是删除github仓库时的git信息，为后面使用coding.net的git清理空间  
* `git clone https://${coding_username}:${coding_token}@${coding_ref} coding_dir`是克隆coding.net的对应仓库，主要为了`.git`文件夹，所以只是把此仓库下载到一个临时文件夹`coding_dir`  
* `cd coding_dir && mv .git ../ && cd ../ && rm -rf coding_dir`是把coding.net的`.git`文件夹替换掉原来的，并且删除临时文件夹  
* `git config --local user.email "zfb132@gmail.com"`是设置提交者的电子邮箱地址  
* `git config --local user.name "zfb"`是设置提交者的名字  
* `git config core.filemode false`忽略文件属性的问题，因为github的文件模式（权限）不一定与coding.net的相同  
* `git remote set-url origin https://${coding_ref}`是设置远程仓库的地址为coding.net的仓库  
* `git add .`是添加文件到暂存区  
* `git commit -m "$message"`设置commit的信息与github一致  
* `git push --force --quiet "https://${coding_username}:${coding_token}@${coding_ref}" master:master`是强制推送到远程仓库
