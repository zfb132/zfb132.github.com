---
layout: post
title: MySQL的简单使用
subtitle: "对数据表记录的基础查找、更新等操作"
category : [MySQL]
tags : [MySQL]
date:       2017-08-19
author:     "晨曦"
header-img: "/img/post/mysql-bg.png"
description:  "本文主要介绍使用MySQL对数据记录进行一些基本的操作，所有内容仅限单表操作"
---

# 目录
{: .no_toc}

* 目录
{:toc}


## MySQL介绍  
[MySQL](http://blog.whuzfb.cn/blog/2017/08/11/database_introduction/#mysql "MySQL")为关系型数据库管理系统（Relational Database Management System，简称RDBMS），主要有以下特点：  
* 数据以表格的形式出现
* 每行为各种记录名称
* 每列为记录名称所对应的数据域
* 许多的行和列组成一张表单
* 若干的表单组成数据库  

还有一些RDBMS的常用术语如下：  
* 数据库: 一些关联表的集合
* 数据表: 表是数据的矩阵；一个数据库中的表看起来像一个简单的电子表格
* 列: 一列(数据元素) 包含了相同类型的数据
* 行：一行（元组，或记录）是一组相关的数据
* 值：行的具体信息, 每个值必须与该列的数据类型相同
* 键：表中用来识别某个特定的人\物的方法, 键的值在当前列中具有唯一性
* 冗余：存储两倍数据，冗余降低了性能，但提高了数据的安全性
* 主键：主键是唯一的；可以使用主键来查询数据
* 外键：用于关联两个表
* 复合键：复合键（组合键）将多个列作为一个索引键
* 索引：是对数据库表中一列或多列的值进行排序的一种结构；可快速访问数据库表中的特定信息  

**注意：每一个数据表的主键（Primary_Key）都是唯一的，有且仅有一个，可以在创建表的时候就为表加上主键，也可以更新表结构时为表加上主键。定义为主键的列都隐含定义为`not null`约束**  
## 前期准备
从[MySQL官网](https://dev.mysql.com/downloads/ "MySQL官网")下载并安装MySQL社区版，成功安装后就可以使用了。可以在[命令行](https://baike.baidu.com/item/%E5%91%BD%E4%BB%A4%E6%8F%90%E7%A4%BA%E7%AC%A6 "命令行介绍")窗口**以管理员身份**运行命令`net start MySQL57`打开MySQL服务；运行命令`net stop MySQL57`关闭MySQL服务（其中MySQL57为自己创建的服务名）     
```bash
PS C:\Windows\system32> net start MySQL57
MySQL57 服务正在启动 ..
MySQL57 服务已经启动成功。

PS C:\Windows\system32> net stop MySQL57
MySQL57 服务正在停止.
MySQL57 服务已成功停止。
```  
如果在安装过程中同意创建快键方式到桌面的话，可以双击打开MySQL服务，<img src="/img/post/mysql-screenshot-service.png" width="768" alt="ScreenShot">
然后在最小化图标处可视化开启/关闭服务  
服务开启以后，在命令行窗口输入`mysql -u root -p`，回车并键入密码  
```bash
PS C:\Windows\system32> mysql -u root -p
Enter password: **********
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 3
Server version: 5.7.18-log MySQL Community Server (GPL)

Copyright (c) 2000, 2017, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```  
**注意**：登录数据库的完整指令参数是`mysql -D world -h localhost -u root -p`，每个参数的意思如下：
* -D：选择登录数据库后要连接的数据库（`world`为数据库名称）
* -h：指定客户端所要登录的MySQL主机名, 登录当前机器该参数可以省略
* -u：指定登录的用户名
* -p: 告诉服务器将会使用一个密码来登录, 如果所要登录的用户名密码为空, 可以忽略此参数  

**[更改数据默认保存编码](http://blog.csdn.net/yuanyuan_186/article/details/12376783 "MySQL改变默认编码为UTF-8")**  
## 语法规则
MySQL具有一套对字符、单词以及特殊符号的使用规定, 它通过执行SQL脚本来完成对数据库的操作, 该脚本由一条或多条MySQL语句(SQL语句 + 扩展语句)组成, 保存时脚本文件后缀名一般为`.sql`。在控制台下, MySQL客户端也可以对语句进行单句的执行而不用保存为`.sql`文件。**标识符**用来命名一些对象, 如数据库、表、列、变量等, 以便在脚本中的其他地方引用。对于标识符是否大小写敏感取决于当前的操作系统, **Windows下是不敏感**的, 但对于大多数 Linux\Unix 系统来说, 这些标识符是大小写敏感的；MySQL语句**以分号`;`作为语句的结束**（`USE`和`QUIT`可不加）, 若在语句结尾不添加`;`时, 命令提示符会以`->`提示你继续输入
### 查看基本信息
`show variables like '%char%';` 查看当前编码格式  
`show global variables like "%datadir%";` 查看数据库文件存储位置  
`show processlist;` 查看MySQL当前用户占用的连接数（前100条）  
`show full processlist;` 查看MySQL当前用户占用的所有连接数  
`show warnings;` 显示当前列出的警告  
`select version();` 查看MySQL的版本号  
`select current_date();` 查看MySQL的当前日期  
`select version(),current_date();` 同时查看MySQL的版本号和当前日期  
`show databases;` 显示当前存在的数据库  
`use world` 选择使用`world`数据库，**进行所有查询、更改操作之前必须指定数据库**  
`select database();` 显示当前选择的数据库  
`show tables;` 显示当前数据库中存在的数据表  
`describe test;` 显示`test`数据表的结构，简写`desc test`  
`show columns from test;` 显示`test`数据表的结构   
`show index from test;` 显示`test`数据表的详细索引信息，包括PRIMARY KEY（主键）   
`show table status from world;` 显示`world`数据库中所有表的信息  
`show table status from world like 'wor%' \G;` 显示`world`数据库中表名以`wor`开头的数据表的信息，并按列打印    
`select * from test;` 显示`test`数据表的内容   
`select count(*) from test;` 显示`test`数据表的记录的个数   
### 创建数据库
使用`create database`语句可完成对数据库的创建，创建命令的格式如下：  
`create database if not exists test_db character set gbk;`  
其中`if not exists`是该语句的可选子句，可防止创建数据库服务器中已存在的新数据库的错误；`test_db`是新创建的数据库的名字；`character set gbk`也是该语句的可选子句，在创建时将数据库字符编码指定为`gbk`   
```sql
mysql> create database if not exists test_db character set gbk;
Query OK, 1 row affected (0.03 sec)

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| sakila             |
| sys                |
| test_db            |
| world              |
+--------------------+
7 rows in set (0.00 sec)
```
### 删除数据库
删除数据库意味着数据库中的所有数据和关联对象将被永久删除，并且无法撤消。使用`drop database`语句可以删除指定数据库，命令格式如下：  
`drop database if exists test_db;`   
其中`if exists`是该语句的可选子句，可防止删除一个不存在的数据库
### 创建数据表
使用`create table`语句可以在数据库中创建一个新表，命令格式如下：    
```sql
create table if not exists mytest(
    id int(11) not null auto_increment,
    name varchar(45) default null,
    sex enum('男','女') not null,
    birthday date default null,
    school varchar(90) default 'WHU',
    primary key(id)
)engine=InnoDB default charset=utf8;
```
[MySQL支持的数据类型](http://blog.whuzfb.cn/ "待添加")有很多，这里不再介绍。`if not exists`是可选语句，防止创建已存在的新表而产生错误；`mytest`是新建的数据表的名称；`()`内部的都是列定义，`id`、`name`、`sex`、`birthday`、`school`是每列的名称，`int(11)`指定该列数据为整数型，宽度为11；`not null`表示该列不接受`null`值；`default 'WHU'`表示该列的默认值为`'WHU'`；`auto_increment`表示每当将新行插入到表中时，该列的值会自动增加，**每个表中最多只能有一列被设置为此属性**，具有该属性的列一般为主键；`primary key(id)`表示将表的特定列`id`设置为主键；`engine=InnoDB`是可选语句，用于设置表的存储引擎（MySQL支持的存储引擎：`InnoDB，MyISAM，HEAP，EXAMPLE，CSV，ARCHIVE，MERGE，FEDERATED、NDBCLUSTER`），默认为`InnoDB`；`charset`是可选语句，用于设置编码格式  
控制台输出如下：  
```sql
mysql> create table if not exists mytest(
    ->     id int(11) not null auto_increment,
    ->     name varchar(45) default null,
    ->     sex enum('男','女') not null,
    ->     birthday date default null,
    ->     school varchar(90) default 'WHU',
    ->     primary key(id)
    -> )engine=InnoDB default charset=utf8;
Query OK, 0 rows affected (0.11 sec)

mysql> describe mytest;
+----------+-------------------+------+-----+---------+----------------+
| Field    | Type              | Null | Key | Default | Extra          |
+----------+-------------------+------+-----+---------+----------------+
| id       | int(11)           | NO   | PRI | NULL    | auto_increment |
| name     | varchar(45)       | YES  |     | NULL    |                |
| sex      | enum('男','女')   | NO   |     | NULL    |                |
| birthday | date              | YES  |     | NULL    |                |
| school   | varchar(90)       | YES  |     | WHU     |                |
+----------+-------------------+------+-----+---------+----------------+
5 rows in set (0.01 sec)
```  
**另外，也可复制其他表结构来创建一个新表**：  
`create table mytest2 like mytest;`  
### 修改表结构
使用`alter table`来更改现有表的结构，可用来**添加列，删除列，更改列的数据类型，添加主键，重命名表等等**，命令格式举例如下：  

* `alter table mytest add column tel int(11) null after school;`  
`mytest`为要修改的数据表；`add column`表示**添加列**的操作；`tel int(11) null`是列定义；`after school`是可选语句，指明添加的列在数据表中的位置，默认为最后一列
* `alter table mytest drop column tel;`  
`drop column`表示**删除列**的操作；`tel`指定要删除的列的名称  
* `alter teble mytest change column id id int(15) not null auto_increment;`
`change id`表示**更改列**`id`**属性**的操作；`id int(15) not null auto_increment`是修改后的列定义
* `alter table mytest add primary key(sex);`   
`add primary key(sex)`表示**将列**`sex`**定义为主键**，此时要注意的是：**MySQL不能单独定义两个主键，在创建表时定义主键后就不能再修改了，只有在建表时未定义主键才可使用此方法；不过在创建表时可以创建一个复合主键**`primary key(id,sex)`
* `alter table mytest rename to test_tb;`  
注意，在**重命名表**之前，应该认真考虑是否影响数据库和应用程序层

### 创建索引
#### create  
使用`create index`语句在表中创建**索引**，其特点是：  
在表中创建索引的目的是更加快速高效地查询数据；用户无法看到索引，它们只能被用来加速搜索/查询；更新一个包含索引的表需要比更新一个没有索引的表更多的时间，这是由于索引本身也需要更新。因此，理想的做法是仅仅在经常被搜索的列（以及表）上面创建索引。命令格式如下：  
`create unique index nameIndex on mytest (name desc)`   
其中`nameIndex`为创建的索引的名字，`unique`表示不允许使用重复的值（可选参数），`mytest`为要操作的表的名字，`name`为`mytest`表中的某一列，`desc`表示以降序索引该列的值（可选参数）。如果希望索引不止一个列，可以在括号中列出这些列的名称，用逗号隔开，例如：  
`create index allIndex on mytest (name,sex)`   
#### alter 
使用`alter table`也可以在表中创建索引，命令格式如下：  
`alter table mytest add index nameIndex (name)`  
其中`nameIndex`为创建的索引的名字，`mytest`为要操作的表的名字，`name`为`mytest`表中的某一列。如果希望索引不止一个列，可以在括号中列出这些列的名称，用逗号隔开。  
`alter table mytest add unique nameIndex (name)`  
表示创建唯一的索引，其中`nameIndex`为创建的索引的名字，`mytest`为要操作的表的名字，`name`为`mytest`表中的某一列。如果希望索引不止一个列，可以在括号中列出这些列的名称，用逗号隔开。  
### 删除索引  
### 删除数据表
使用`drop table`语句可以删除指定数据库，命令格式如下：  
`drop table if exists mytest;`   
其中`if exists`是该语句的可选子句，可防止删除一个不存在的数据库
### 插入数据
使用`insert into`语句可以将数据插入到指定数据表中，命令格式如下：  
`insert into mytest(id,name,sex) values (1,'Michael','男'),(2,'Jane','女');`  
其中`mytest`为要插入数据记录的表格；`id,name,sex`为要插入的数据的列；当需要一次性插入**多条数据**时，每组数据之间用`,`隔开；如果为表中的**所有列**指定相应列的值，则可以`insert into mytest values (3,'Maria','女',19980909,'HUST');`
注意：**不必为自动递增的列指定值**，它会自动将当前的最大值加1作为新纪录的值  
还可以通过与`select`语句结合实现快速复制表（前提：两个表**结构基本相同**）：  
`insert into mytest2(id,sex) select id,sex from mytest;`   
将`mytest`表中的两列数据复制到`mytest2中`  
`insert into mytest2 select * from mytest;`   
将`mytest`表中的所有数据复制到`mytest2中`  
