// index.html页面加载时调用: createRecord(Counter, false)
// post.html页面加载时调用: createRecord(Counter, true)
function createRecord(Counter, is_detail){
  // 设置 ACL
  var acl = new AV.ACL();
  acl.setPublicReadAccess(true);
  acl.setPublicWriteAccess(true);
  // 获得span的所有元素
  var elements=document.getElementsByClassName('leancloud_visitors');
  // 一次创建多条记录
  var allcounter=[];
  for (var i = 0; i < elements.length ; i++) {
    // 若某span的内容不包括 '-' ，则不必创建记录
    if(elements[i].textContent.indexOf('-') == -1){
      continue;
    }
    var title = elements[i].getAttribute('data-flag-title');
    var url = elements[i].id;
    var newcounter = new Counter();
    newcounter.setACL(acl);
    newcounter.set("title", title);
    newcounter.set("url", url);
    newcounter.set("time", 0);
    allcounter.push(newcounter);
    // 顺便更新显示span为默认值0
    elements[i].textContent=0;
  }
  // 判断是否需要新建记录
  if(allcounter.length == 0){
    return;
  }
  if(!is_detail){
    // 判断是否需要新建记录
    if(allcounter.length == 0){
        return;
    }
  }
  AV.Object.saveAll(allcounter).then(function (todo) {
    // 成功保存记录之后
    console.log('创建记录成功！');
  }, function (error) {
    // 异常错误 
    console.error('创建记录失败: ' + error.message);
  });
}

// index.html页面加载时调用
function showCount(Counter){
  // 是否需要创建新纪录的标志（添加一篇新文章）
  var flag=false;
  var is_detail = false;
  var query = new AV.Query(name);
  query.greaterThanOrEqualTo('time', 0);
  query.find().then(function (results) {
    // 当获取到的记录为0时置默认值
    if(results.length==0){
      $('.leancloud_visitors').text('-');
      flag=true;
      console.log('返回查询记录为空');
      // 如果获取到空记录就创建新记录
      createRecord(Counter, is_detail);
      return;
    }
    // 将获取到的数据设置为text
    for (var i = 0; i < results.length; i++) {
      var item = results[i];
      var url = item.get('url');
      var time = item.get('time');
      try {
          var element = document.getElementById(url);
          // 删除原字符串中的空格
          if(element.textContent.replace(/\s+|&nbsp;/ig,'') == '-' || parseInt(element.textContent) < time){
            element.textContent = time;
          }
        } catch (error) {
          // console.log("获取"+url+"的网页元素出错："+error);
      }
    }
    // 当某个span含有默认值时说明需要创建记录
    if($('.leancloud_visitors').text().indexOf("-") != -1){
      flag=true;
    }
    // 当获取的记录数与span个数不吻合时
    if(results.length != $('.leancloud_visitors').length){
      flag=true;
    }
    if(flag){
      createRecord(Counter, is_detail);
    }
  }, function (error) {
    console.log('query error:'+error.message);
  });
}

// post.html页面加载时调用
function updateCount(Counter){
  // 获得span
  var elements=document.getElementsByClassName('leancloud_visitors');
  var url = elements[0].id;
  var query = new AV.Query(name);
  query.equalTo('url', url);
  query.find().then(function(results) {
      // 当获取到的记录为0时置默认值
      if(results.length==0){
        $('.leancloud_visitors').text('-');
        flag=true;
        console.log('返回查询内容为空!');
        // 如果获取到空记录就创建新记录
        createRecord(Counter, true);
        return;
      }
      var counter = results[0];
      counter.increment("time");
      counter.save(null, {fetchWhenSave: true}).then(function(counter) {
          // 将获取到的数据设置为text
          for (var i = 0; i < elements.length; i++) {
            elements[i].textContent = counter.get('time');
          }
        },function(error) {
          console.log('保存更新后数字失败: ' + error.message);
        });
    },function(error) {
      console.log('查询失败: ' + error.code + " " + error.message);
    });
}