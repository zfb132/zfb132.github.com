#coding=utf-8
from flask import render_template
from app import app

#此包是为了query而导入的
from flask import request
#此包是为了反向路由
from flask import url_for
#此包是为了消息闪现,需要配置秘钥对消息进行加密
from flask import flash
import time
app.secret_key='123'




@app.route('/')	
@app.route('/index',methods=["POST","GET"])
def index():
	f=open("/home/ubuntu/pytest/microblog/log.txt","a")
	f.write(request.remote_addr+"\t"+time.strftime("%Y-%m-%d %H:%M:%S",time.localtime())+"查看主页"+"\n")
	if f:
		f.close()
	return render_template('index.html')

@app.route('/love')
def love():
	f=open("/home/ubuntu/pytest/microblog/log.txt","a")
	f.write(request.remote_addr+"\t"+time.strftime("%Y-%m-%d %H:%M:%S",time.localtime())+"查看love"+"\n")
	if f:
		f.close()
	return render_template('/showlove/love.html')

@app.route('/zfbcdn.js')
def cdn():
        return render_template('zfbcdn.js')

@app.route('/jump')
def jump():
	f=open("/home/ubuntu/pytest/microblog/log.txt","a")
	f.write(request.remote_addr+"\t"+time.strftime("%Y-%m-%d %H:%M:%S",time.localtime())+"查看阻尼运动"+"\n")
	if f:
		f.close()
	return render_template('jump.html')


@app.route('/login')
def login():
	user={'nickname':"michile"}
	loop=list(range(1,11))
	flash("我是消息闪现信息")
	content="hello,world,this is content"
	#渲染模板，这些title、user、content均为自定义，是在.html文件中
	#使用{{title}}定义过的
	return render_template('login.html',title='home',user=user,content=content,loop=loop)

#html中的form的action指定表单向那个页面提交
@app.route('/user',methods=['POST'])
def user():
	ff=open("/home/ubuntu/pytest/microblog/log.txt","a")
	s=""
	for i in request.form:
		s=s+"\n\t"+i+"\t"+request.form[i]
	ff.write(request.remote_addr+"\t"+time.strftime("%Y-%m-%d %H:%M:%S",time.localtime())+"查看user页面"+s+"\n")
	if ff:
		ff.close()
	form=request.form
	username=form.get('user')
	pwd=form.get('psw')

	if not username:
		flash("请输入用户名")
		return render_template("login.html")
	if not pwd:
		flash("请输入密码")
		return render_template("login.html")
	if username=='admin' and pwd=='123456':
		f=open("/home/ubuntu/pytest/microblog/log.txt","r")
		s=f.readlines()
		f.close()
		m=""
		for i in s:
			m=m+i
		flash('hello，%s' %username)
		pre="登陆成功，欢迎:"+username+"\n"+m
		return render_template("user.html",pre=pre)
	else:
		flash('用户名或密码错误')
		return render_template("login.html")


#在路由中进行参数传递
#这种方法要在浏览器地址栏输入http://127.0.0.1:8888/123456
@app.route('/user/<id>')
def query_userA(id):
	return "hello,"+id

#这种方法要在浏览器地址栏输入http://127.0.0.1:8888/query_user?id=123456
@app.route('/query_user')
def query_userB():
	id=request.args.get('id')
	return "user:"+id

#根据视图函数反向路由
@app.route('/query_url')
def query_url():
	return "url:"+url_for("query_userB")


@app.route('/hello')
def hello():
	return "<h1>helloworld</h1>"

#关于继承
@app.route('/base')
def base():
	return render_template('base.html')

@app.route('/extend')
def extend():
	return render_template('extendA.html')
