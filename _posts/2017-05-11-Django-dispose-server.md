---
layout: post
title: 部署Django项目
subtitle: "目标服务器为Ubuntu16.04"
category : [Django,Linux,Ubuntu]
tags : [Django,Linux,Ubuntu,Python]
date:       2017-05-11
author:     "晨曦"
header-img: "/img/post/django-bg.png"
description:  "这是花费了一个月的时间摸索整理出来的一份总结。分享出来一方面是给新人一个借鉴，另一方面对自己也算是个备份。"
---

***
# Django[ˈdʒæŋɡoʊ]部分  
***
## 整个Django项目：   

```
├── examples.desktop  
├── microblog  
│   ├── blog  
│   │   ├── admin.py  
│   │   ├── __init__.py  
│   │   ├── migrations  
│   │   │   └── __init__.py  
│   │   ├── models.py  
│   │   ├── __pycache__  
│   │   │   ├── __init__.cpython-35.pyc  
│   │   │   └── views.cpython-35.pyc  
│   │   ├── static  
│   │   │   └── zfbcdn.js  
│   │   ├── templates  
│   │   │   └── index.html  
│   │   ├── tests.py  
│   │   └── views.py  
│   ├── db.sqlite3  
│   ├── manage.py  
│   └── microblog  
│       ├── __init__.py  
│       ├── __pycache__  
│       │   ├── __init__.cpython-35.pyc  
│       │   ├── settings.cpython-35.pyc  
│       │   ├── urls.cpython-35.pyc  
│       │   └── wsgi.cpython-35.pyc  
│       ├── settings.py  
│       ├── urls.py  
│       └── wsgi.py  
├── PycharmProjects  
│   ├── 1A  
│   │   ├── setup.py  
│   │   └── testA.py  
```
这是整个项目的样子：  

## Django项目如何创建呢？  

### 首先需要在ubuntu上面安装python-pip    
        `sudo apt-get install python3-pip`
### 升级pip      
        `(sudo) pip3 install –upgrade pip`   
### 安装django    
        `sudo pip3 install Django==1.8.0`  
### 创建工程项目microblog  
        `django-admin.py startproject microblog`      
此时的情况：         
```
	│── microblog      
	│   ├── db.sqlite3      
	│   ├── manage.py      
	│   └── microblog      
	│       ├── __init__.py      
	│       ├── __pycache__      
	│       │      ├── __init__.cpython-35.pyc      
	│       ├── settings.py      
	│       ├── urls.py      
   	│       └── wsgi.py      
``` 
    
### 创建app项目blog（此命令在manage.py同级的目录处执行）      
        `python3 manage.py startapp blog`  
### 首先在settings.py中添加自己的app名称：      
```python
	INSTALLED_APPS = (
	'django.contrib.admin',
	'django.contrib.auth',
	'django.contrib.contenttypes',
	'django.contrib.sessions',
	'django.contrib.messages',
	'django.contrib.staticfiles',
	
	'blog',
	)
```
新建的 app 如果不加到 INSTALL\_APPS 中的话, Django 就不能自动找到app中的模板文件(app-name/templates/下的文件)和静态文件(app-name/static/中的文件)    

### 在views.py中定义视图函数：    
```python
# coding:utf-8
# !usr/bin/env python3

from django.http import HttpResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

# Create your views here.

# 定义了一个index()函数，第一个参数必须是 request，与网页发来的请求有关，request 变量里面包含get或post的内容，用户浏览器，系统等信息在里面
# HttpResponse，它是用来向网页返回内容的，就像Python中的 print 一样，只不过 HttpResponse 是把内容显示到网页上


def index(request):
    return render(request, 'index.html', {'title': '我是自由修改的标题'})
    # return HttpResponse(u'欢应')


# 由于使用POST要CSTF，因此要加上这个
@csrf_exempt
def user(request):
    if request.method=='POST':
        m_user = request.POST.get('user', 'default')
        m_pwd = request.POST.get('pwd', '111111')
        m_option = request.POST.get('love', 'default')
        return HttpResponse(m_user + m_pwd + m_option)
    else:
        return HttpResponse("这是get请求")
```
### 在urls.py中定义视图函数相关的url：   
```python
# coding:utf-8
# !usr/bin/env python3

from django.conf.urls import include, url
from django.contrib import admin

# 自己导入
from blog import views as blog

urlpatterns = [
    # Examples:
    # url(r'^$', 'microblog.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),


    url(r'^$', blog.index, name='default'),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^index', blog.index, name='index'),
    url(r'^user', blog.user, name='user')
]

```
（注意需要在settings.py添加模板的路径，顺便添加静态文件位置，以及ALLOWED_HOSTS：  
```python
# 需要在DIRS中添加模板文件路径
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': ['blog/templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
# 此处填写Ip(比如23.12.34.56)和对应的域名(www.baidu.com)
ALLOWED_HOSTS = ['XX.XXX.XX.X','XXX']

STATIC_URL = '/static/'

# python manage.py collectstatic
# 就会自动把所有STATICFILES_DIRS静态文件全部复制到STATIC_ROOT中
# STATIC_ROOT = os.path.join(BASE_DIR, '/home/')

# 用来存放单个App的静态文件
STATICFILES_DIRS = (
    'blog/static',
)
```


）

### 更改一下models.py文件并： 
  `python3 manage.py makemigrations`  
  `python3 manage.py migrate`  

### 此时运行： 
   `python3 manage.py runserver 8000`    
   
(默认在8000端口运行)    

***
# 服务器部分  
***

## 安装pip3：  
    `sudo apt install python3-pip`  
## 在服务器上下载uwsgi：  
    `sudo python3 -m pip install uwsgi`  

## 安装nginx：  
    `sudo apt-get install nginx`  

## 在工程目录下建立myweb_uwsgi.ini文件：  
```
|-- blog  
|   |-- __init__.py  
|   |-- __pycache__  
|   |   |-- __init__.cpython-35.pyc  
|   |   |-- views.cpython-35.pyc  
|   |-- admin.py  
|   |-- migrations  
|   |   |-- __init__.py  
|   |-- models.py  
|   |-- static  
|   |   |-- zfbcdn.js  
|   |-- templates  
|   |   |-- index.html  
|   |-- tests.py  
|   |-- views.py  
|-- db.sqlite3  
|-- manage.py  
|-- microblog  
|   |-- __init__.py  
|   |-- __pycache__  
|   |   |-- __init__.cpython-35.pyc  
|   |   |-- settings.cpython-35.pyc  
|   |   |-- urls.cpython-35.pyc  
|   |   |-- wsgi.cpython-35.pyc  
|   |-- settings.py  
|   |-- urls.py  
|   |-- wsgi.py  
|-- myweb_uwsgi.ini  
```
文件内容如下：  
```python
# myweb_uwsgi.ini file
[uwsgi]
# django-related settings
# django project socket port
socket = :8000
# set running directory before loading
chdir = /home/microblog
# python project's wsgi file location
module = microblog.wsgi
# enable master process
master = true
# processes that were opened
processes = 4
# file permission
chomd-socket = 664
# autoclean environments when server exits
vacuum = true
# let process run in daemonize
daemonize = /home/log/blogserver.log
# split log file by size(KB)
log-maxsize = 1000000

```
## 然后进入/etc/nginx目录下：    
```
mylinux@VM-11-11-mylinux:/home/microblog$ cd /etc/nginx
mylinux@VM-11-11-mylinux:/etc/nginx$ ls
conf.d          koi-utf     nginx.conf    sites-available  uwsgi_params
fastcgi.conf    koi-win     proxy_params  sites-enabled    win-utf
fastcgi_params  mime.types  scgi_params   snippets
mylinux@VM-11-11-mylinux:/etc/nginx$ 
```
然后`sudo vi nginx.conf`后不更该其他内容，只在`http{}`内进行操作：  
```
user www-data;
worker_processes auto;
pid /run/nginx.pid;

events {
        worker_connections 768;
        # multi_accept on;
}



http {


        server {
        listen 80 ;
# 此处填写域名，比如www.baidu.com
        server_name XX ;
        charset UTF-8 ;
        access_log /home/log/myweb_access.log ;
        error_log /home/log/myweb_error.log ;

        client_max_body_size 75M ;

        location / {
            include uwsgi_params ;
            uwsgi_pass 127.0.0.1:8000 ;
            uwsgi_read_timeout 2 ;
        }

        location /static {
            expires 30d ;
            autoindex on ;
            add_header Cache-Control private ;
            alias /home/microblog/blog/static/ ;
        }
}





        ##
        # Basic Settings
        ##

#       sendfile on;
#       tcp_nopush on;
#       tcp_nodelay on;
#       keepalive_timeout 65;
#       types_hash_max_size 2048;
        # server_tokens off;

        # server_names_hash_bucket_size 64;
        # server_name_in_redirect off;

#       include /etc/nginx/mime.types;
#       default_type application/octet-stream;

        ##
        # SSL Settings
        ##

#       ssl_protocols TLSv1 TLSv1.1 TLSv1.2; # Dropping SSLv3, ref: POODLE
#       ssl_prefer_server_ciphers on;

        ##
        # Logging Settings
        ##

#       access_log /var/log/nginx/access.log;
#       error_log /var/log/nginx/error.log;

        ##
        # Gzip Settings
        ##

#       gzip on;
#       gzip_disable "msie6";

        # gzip_vary on;
        # gzip_proxied any;
        # gzip_comp_level 6;
        # gzip_buffers 16 8k;
        # gzip_http_version 1.1;
        # gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

        ##
        # Virtual Host Configs
        ##

#       include /etc/nginx/conf.d/*.conf;
#       include /etc/nginx/sites-enabled/*;
}

#mail {
#       # See sample authentication script at:
#       # http://wiki.nginx.org/ImapAuthenticateWithApachePhpScript
#
#       # auth_http localhost/auth.php;
#       # pop3_capabilities "TOP" "USER";
#       # imap_capabilities "IMAP4rev1" "UIDPLUS";
#
#       server {
#               listen     localhost:110;
#               protocol   pop3;
#               proxy      on;
#       }
#
#       server {
#               listen     localhost:143;
#               protocol   imap;
#               proxy      on;
#       }
#}

```
## 然后运行Django项目：  
    `uwsgi –ini /home/microblog/myweb_uwsgi.ini`  

## 然后运行或重启nginx：  
    `service nginx restart`  

## 成功  


***
# 附录：各文件内容  
***
  
## manage.py   
```python
# manage.py
#!/usr/bin/env python
# manage.py
import os
import sys

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "microblog.settings")

    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)
```
***
## settings.py  
```python
# coding:utf-8
# !usr/bin/env python3
# settings.py
"""
Django settings for microblog project.

Generated by 'django-admin startproject' using Django 1.8.

For more information on this file, see
https://docs.djangoproject.com/en/1.8/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.8/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.8/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'v%-j08&2k4!$&jlr7ld(v+e*1#-x3j7xl)6$x-1@xokqena5rt'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []


# Application definition

# following lists were added by myself
"""
新建的 app 如果不加到 INSTALL_APPS 中的话, django 就不能自动找到app中的模板文件(app-name/templates/下的文件)和静态文件(app-name/static/中的文件)
"""
INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',


    'microblog',
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.security.SecurityMiddleware',
)

ROOT_URLCONF = 'microblog.urls'

# 需要在DIRS中添加模板文件路径
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': ['blog/templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'microblog.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.8/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}


# Internationalization
# https://docs.djangoproject.com/en/1.8/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.8/howto/static-files/

STATIC_URL = '/static/'

# python manage.py collectstatic
# 就会自动把所有STATICFILES_DIRS静态文件全部复制到STATIC_ROOT中
# STATIC_ROOT = os.path.join(BASE_DIR, '/home/')

# 用来存放单个App的静态文件
STATICFILES_DIRS = (
    'blog/static',
)

'''
STATIC_URL = '/static/'
# 当运行 python manage.py collectstatic 的时候
# STATIC_ROOT 文件夹 是用来将所有STATICFILES_DIRS中所有文件夹中的文件，以及各app中static中的文件都复制过来
# 把这些文件放到一起是为了用apache等部署的时候更方便
STATIC_ROOT = os.path.join(BASE_DIR, 'collected_static')

# 其它 存放静态文件的文件夹，可以用来存放项目中公用的静态文件，里面不能包含 STATIC_ROOT
# 如果不想用 STATICFILES_DIRS 可以不用，都放在 app 里的 static 中也可以
STATICFILES_DIRS = (
    os.path.join(BASE_DIR, "common_static"),
    '/path/to/others/static/',  # 用不到的时候可以不写这一行
)

# 这个是默认设置，Django 默认会在 STATICFILES_DIRS中的文件夹 和 各app下的static文件夹中找文件
# 注意有先后顺序，找到了就不再继续找了
STATICFILES_FINDERS = (
    "django.contrib.staticfiles.finders.FileSystemFinder",
    "django.contrib.staticfiles.finders.AppDirectoriesFinder"
)
'''
```
***
## urls.py  
```python
# coding:utf-8
# !usr/bin/env python3
# urls.py

from django.conf.urls import include, url
from django.contrib import admin

# 自己导入
from blog import views as blog

urlpatterns = [
    # Examples:
    # url(r'^$', 'microblog.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),


    url(r'^$', blog.index, name='default'),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^index', blog.index, name='index'),
    url(r'^user', blog.user, name='user')
]
```
***
## wsgi.py  
```python
# wsgi.py
"""
WSGI config for microblog project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.8/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "microblog.settings")

application = get_wsgi_application()
```
***
## admin.py  
```python
# coding:utf-8
# !usr/bin/env python3
# admin.py

# Register your models here.
from django.contrib import admin
from .models import Article, Person


class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'pub_date', 'update_time',)
```
***
## views.py
```python
# coding:utf-8
# !usr/bin/env python3
# views.py

from django.http import HttpResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

# Create your views here.

# 定义了一个index()函数，第一个参数必须是 request，与网页发来的请求有关，request 变量里面包含get或post的内容，用户浏览器，系统等信息在里面
# HttpResponse，它是用来向网页返回内容的，就像Python中的 print 一样，只不过 HttpResponse 是把内容显示到网页上


def index(request):
    return render(request, 'index.html', {'title': '我是自由修改的标题'})
    # return HttpResponse(u'欢应')


# 由于使用POST要CSTF，因此要加上这个
@csrf_exempt
def user(request):
    if request.method=='POST':
        m_user = request.POST.get('user', 'default')
        m_pwd = request.POST.get('pwd', '111111')
        m_option = request.POST.get('love', 'default')
        return HttpResponse(m_user + m_pwd + m_option)
    else:
        return HttpResponse("这是get请求")

class PersonAdmin(admin.ModelAdmin):
    list_display = ('full_name',)


admin.site.register(Article, ArticleAdmin)
admin.site.register(Person, PersonAdmin)
```
***
## models.py  
```python
# coding:utf-8
# !usr/bin/env python3
# models.py

# Create your models here.
from __future__ import unicode_literals

from django.db import models
from django.utils.encoding import python_2_unicode_compatible


# python_2_unicode_compatible 会自动做一些处理去适应python不同的版本，
# 本例中的 unicode_literals 可以让python2.x 也像 python3 那个处理 unicode 字符

@python_2_unicode_compatible
class Article(models.Model):
    title = models.CharField(u'标题', max_length=256)
    content = models.TextField(u'内容')

    pub_date = models.DateTimeField(u'发表时间', auto_now_add=True, editable=True)
    update_time = models.DateTimeField(u'更新时间', auto_now=True, null=True)

    def __str__(self):
        return self.title


class Person(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)

    def my_property(self):
        return self.first_name + ' ' + self.last_name

    my_property.short_description = "Full name of the person"

    full_name = property(my_property)

```
***
## tests.py  
```python
# tests.py
from django.test import TestCase

# Create your tests here.
```
***
结束    

