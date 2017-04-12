'use strict';
var router = require('express').Router();
var AV = require('leanengine');

var Comics = AV.Object.extend('Comics');

// function setShow(i,item,res){
//   if(i >= item.length){
//     res.send("发布成功");
//     return;
//   }
//   console.log(item[i]);
//   item[i].set("status",1);
//   item[i].save().then(function (todo) {
//     console.log(todo);
//     setShow(i+1,item,res);
//   }, function (error) {
//     console.error(error);
//   });;
// }

// 查询 Todo 列表
router.get('/list', function(req, res, next) {
  var title = req.query.title ? req.query.title : "妖妖小精";
  var query = new AV.Query(Comics);
  query.contains('title',title);
  query.find().then(function(comics) {
    comics.forEach(function(comic) {
      comic.set('status', 1);
    });
    return AV.Object.saveAll(comics);

  }, function(err) {
    if (err.code === 101) {
      // 该错误的信息为：{ code: 101, message: 'Class or object doesn\'t exists.' }，说明 Todo 数据表还未创建，所以返回空的 Todo 列表。
      // 具体的错误代码详见：https://leancloud.cn/docs/error_code.html
      res.render('todos', {
        title: 'TODO 列表',
        todos: []
      });
    } else {
      next(err);
    }
  }).catch(next);
});



// 新增 Todo 项目
router.post('/', function(req, res, next) {
  var content = req.body.content;
  var todo = new Todo();
  todo.set('content', content);
  todo.save().then(function(todo) {
    res.redirect('/todos');
  }).catch(next);
});

module.exports = router;
