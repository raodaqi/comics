'use strict';
var express = require('express');
var timeout = require('connect-timeout');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var AV = require('leanengine');

// 加载云函数定义，你可以将云函数拆分到多个文件方便管理，但需要在主文件中加载它们
require('./cloud');

var app = express();

// 设置模板引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static('public'));

// 设置默认超时时间
app.use(timeout('15s'));

// 加载云引擎中间件
app.use(AV.express());

app.enable('trust proxy');
// 需要重定向到 HTTPS 可去除下一行的注释。
// app.use(AV.Cloud.HttpsRedirect());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', function(req, res) {
  res.render('index', { currentTime: new Date() });
});

// 可以将一类的路由单独保存在一个文件中
app.use('/todos', require('./routes/todos'));

app.use(function(req, res, next) {
  // 如果任何一个路由都没有返回响应，则抛出一个 404 异常给后续的异常处理器
  if (!res.headersSent) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  }
});

// error handlers
app.use(function(err, req, res, next) {
  if (req.timedout && req.headers.upgrade === 'websocket') {
    // 忽略 websocket 的超时
    return;
  }

  var statusCode = err.status || 500;
  if (statusCode === 500) {
    console.error(err.stack || err);
  }
  if (req.timedout) {
    console.error('请求超时: url=%s, timeout=%d, 请确认方法执行耗时很长，或没有正确的 response 回调。', req.originalUrl, err.timeout);
  }
  res.status(statusCode);
  // 默认不输出异常详情
  var error = {}
  if (app.get('env') === 'development') {
    // 如果是开发环境，则将异常堆栈输出到页面，方便开发调试
    error = err;
  }
  res.render('error', {
    message: err.message,
    error: error
  });
});

function addComicsData(){
  var Comics = AV.Object.extend('Comics');
  var comics = new Comics();
  comics.set("title",title);
  comics.set("link",link);
  comics.set("img",img);
  comics.save().then(function (app) {
    var result = {
      code : 200,
      data : app,
      message : "success"
    }
    res.send(result);
  }, function (error) {
    var result = {
      code : 500,
      message : "保存出错",
      data:''
    }
    res.send(result);
  });
}

// function saveComics(i,data){
//   console.log(i);
//   if(!data[i].img){
//     saveComics(i+1,data);
//     return;
//   }
//   if(i >= data.length){
//     return;
//   }
//   var Comics = AV.Object.extend('Comics');
//   var comics = new AV.Query(Comics);
//   //去除空格
//   var title = data[i].title.replace(/(^\s+)|(\s+$)/g,"");
//   title = title.replace(/\s/g,"");
//   comics.equalTo('title',title);
//   comics.find().then(function(results) {
//       // console.log(results);
//       //判断是否存在
//       if(results.length){
//         //存在
//         console.log("存在");
//         saveComics(i+1,data);
//       }else{
//         //不存在
//         //创建应用
//         var comics = new Comics;
//         comics.set("title",title);
//         comics.set("img",data[i].img);
//         comics.set("link",data[i].link);
//         comics.set("c_time",data[i].cCreateTime);
//         comics.save().then(function (comics) {
//           console.log("保存成功");
//           saveComics(i+1,data);
//         }, function (error) {
//           console.log("保存失败")
//         });                                              
//       }
//     }, function(err) {
//       if (err.code === 101) {
//       // res.send(err);
//       console.log("已存在")
//       } else {
//         next(err);
//       }
//   }).catch(next);
// }


// AV.Cloud.httpRequest({
//     method: 'GET',
//     url: 'http://project.miqclan.com.cn/m/cartoon/get_list.json?showCount=10&currentPage=0',
//     success: function(httpResponse) {
//       // console.log(httpResponse.text);
//       var data = JSON.parse(httpResponse.text);
//       //获取漫画列表
//       var dataList = data.data.contentlist;
//       console.log(dataList.length);
//       saveComics(0,dataList);
//     },
//     error: function(httpResponse) {
//       console.log("请求超时");
//     }
//   });

module.exports = app;
