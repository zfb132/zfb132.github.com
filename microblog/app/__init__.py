#coding=utf-8
from flask import Flask
#创建flask实例
#MVC:model views control
app=Flask(__name__)
from app import views
