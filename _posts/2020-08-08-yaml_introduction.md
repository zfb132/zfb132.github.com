---
layout: post
title: YAML语言的介绍和语法规则
subtitle: "持续集成工具的配置文件都是使用YAML语言编写的"
category : [Ubuntu,Linux,Windows,Git]
tags : [Ubuntu,Linux,Windows,Git,GitHub]
date:       2020-08-08 17:48:07 +08:00
author:     "晨曦"
header-img: "/img/post/ubuntu-canonical-bg.png"
description:  "本文主要介绍如何使用YAML语言的基础数据类型"
---
  
## 目录
{: .no_toc}

* 目录
{:toc}

## 1. YAML语言概述
YAML 语言的基本语法规则如下  
* 大小写敏感
* 使用缩进表示层级关系
* 缩进时不允许使用Tab键，只允许使用空格。
* 缩进的空格数目不重要，只要相同层级的元素左侧对齐即可
* \# 表示注释，从这个字符一直到行尾，都会被解析器忽略

YAML 支持的数据结构有三种  
* 对象：键值对的集合，又称为映射（mapping）/ 哈希（hashes） / 字典（dictionary）
* 数组：一组按次序排列的值，又称为序列（sequence） / 列表（list）
* 纯量（scalars）：单个的、不可再分的值

## 2. YAML语言的对象
对象的一组键值对，使用冒号结构表示  
```yaml
animal: pets
```
相当于 JavaScript 的对象  
```js
{ animal: 'pets' }
```
也允许另一种写法，将所有键值对写成一个行内对象  
```yaml
hash: { name: Steve, foo: bar } 
```
相当于 JavaScript 的对象  
```js
{   
    hash: { name: 'Steve', foo: 'bar' } 
}
```
## 3. YAML语言的数组
一组连词线开头的行，构成一个数组  
```yaml
- Cat
- Dog
- Goldfish
```
转为 JavaScript 表示如下  
```js
[ 'Cat', 'Dog', 'Goldfish' ]
```
数据结构的子成员是一个数组，则可以在该项下面缩进一个空格  
```yaml
-
 - Cat
 - Dog
 - Goldfish
```
转为 JavaScript 表示如下  
```js
[ 
    [ 'Cat', 'Dog', 'Goldfish' ] 
]
```
数组也可以采用行内表示法  
```yaml
animal: [Cat, Dog]
```
转为 JavaScript 表示如下  
```js
{ animal: [ 'Cat', 'Dog' ] }
```
## 4. YAML语言的复合结构
对象和数组可以结合使用，形成复合结构  
```yaml
languages:
 - Ruby
 - Perl
 - Python 
websites:
 YAML: yaml.org 
 Ruby: ruby-lang.org 
 Python: python.org 
 Perl: use.perl.org 
```
转为 JavaScript 表示如下  
```js
{    
    languages: [ 'Ruby', 'Perl', 'Python' ],
    websites: 
    {
        YAML: 'yaml.org',
        Ruby: 'ruby-lang.org',
        Python: 'python.org',
        Perl: 'use.perl.org' 
    } 
}
```
## 5. YAML语言的纯量
纯量是最基本的、不可再分的值。以下数据类型都属于 JavaScript 的纯量：字符串、布尔值、整数、浮点数、Null、时间、日期、数值直接以字面量的形式表示  
```yaml
number: 12.30
isSet: true
parent: ~
iso8601: 2001-12-14t21:59:43.10-05:00 
date: 1976-07-31
# 使用两个感叹号，强制转换数据类型
e: !!str 123
f: !!str true
```
转为 JavaScript 如下  
```js
{    
    number: 12.30,
    isSet: true,
    parent: null,
    iso8601: new Date('2001-12-14t21:59:43.10-05:00'),
    date: new Date('1976-07-31'),
    e: '123', 
    f: 'true',
}
```
## 6. YAML语言的字符串
字符串是最常见，也是最复杂的一种数据类型,字符串默认不使用引号表示  
```yaml
str1: 这是一行字符串
# 字符串之中包含空格、冒号或特殊字符，需要放在引号之中
str2: '内容： 字符串'
# 单引号和双引号都可以使用，双引号不会对特殊字符转义
s1: '内容\n字符串'
s2: "内容\n字符串"
# 单引号之中如果还有单引号，必须连续使用两个单引号转义
str3: 'labor''s day' 
# 字符串可以写成多行，从第二行开始，必须有一个单空格缩进，换行符会被转为空格
st4: 这是一段
  多行
  字符串
# 多行字符串可以使用|保留换行符，也可以使用>折叠换行
this: |
  Foo
  Bar
that: >
  Foo
  Bar
# +表示保留文字块末尾的换行，-表示删除字符串末尾的换行
s3: |
  Foo

s4: |+
  Foo


s5: |-
  Foo
# 字符串之中可以插入 HTML 标记
message: |

  <p style="color: red">
    段落
  </p>
```
转为 JavaScript 如下  
```js
{    
    str1: '这是一行字符串',
    str2: '内容: 字符串',
    s1: '内容\\n字符串', 
    s2: '内容\n字符串',
    str3: 'labor\'s day',
    str4: '这是一段 多行 字符串',
    this: 'Foo\nBar\n', 
    that: 'Foo Bar\n',
    s3: 'Foo\n', 
    s4: 'Foo\n\n\n', 
    s5: 'Foo',
    message: '\n<p style="color: red">\n  段落\n</p>\n'
}
```
## 7. YAML语言的引用
锚点`&`和别名`*`可以用来引用  
```yaml
defaults: &defaults
  adapter:  postgres
  host:     localhost

development:
  database: myapp_development
  <<: *defaults

test:
  database: myapp_test
  <<: *defaults
```
等同于下面的代码  
```yaml
defaults:
  adapter:  postgres
  host:     localhost

development:
  database: myapp_development
  adapter:  postgres
  host:     localhost

test:
  database: myapp_test
  adapter:  postgres
  host:     localhost
```
`&`用来建立锚点（`defaults`），`<<`表示合并到当前数据，`*`用来引用锚点  
下面是另一个例子  
```yaml
- &showell Steve 
- Clark 
- Brian 
- Oren 
- *showell 
```
转为 JavaScript 代码如下  
```js
[ 'Steve', 'Clark', 'Brian', 'Oren', 'Steve' ]
```
引用变量和数组变量示例  
```yaml
country: 中国
city:
    - 北京
    - 上海
    - 深圳
    - 南京
    - 重庆
websites:
    YAML: yaml.org 
    Ruby: ruby-lang.org 
    Python: python.org 
    Perl: use.perl.org 
myCountry: ${country}
myCity: ${city[0]}
myweb: ${websites.YAML} by zfb
```