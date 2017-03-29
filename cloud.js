var AV = require('leanengine');

function saveComics(i,data){
  console.log(i);
  if(!data[i].img){
    saveComics(i+1,data);
    return;
  }
  if(i >= data.length){
    return;
  }
  var Comics = AV.Object.extend('Comics');
  var comics = new AV.Query(Comics);
  //去除空格
  var title = data[i].title.replace(/(^\s+)|(\s+$)/g,"");
  title = title.replace(/\s/g,"");
  comics.equalTo('title',title);
  comics.find().then(function(results) {
      // console.log(results);
      //判断是否存在
      if(results.length){
        //存在
        console.log("存在");
        saveComics(i+1,data);
      }else{
        //不存在
        //创建应用
        var comics = new Comics;
        comics.set("title",title);
        comics.set("img",data[i].img);
        comics.set("link",data[i].link);
        comics.set("c_time",data[i].cCreateTime);
        comics.save().then(function (comics) {
          console.log("保存成功");
          saveComics(i+1,data);
        }, function (error) {
          console.log("保存失败")
        });                                              
      }
    }, function(err) {
      if (err.code === 101) {
      // res.send(err);
      console.log("已存在")
      } else {
        next(err);
      }
  }).catch(next);
}


function getComicsData(){
  // console.log("123");
  AV.Cloud.httpRequest({
    method: 'GET',
    url: 'http://project.miqclan.com.cn/m/cartoon/get_list.json?showCount=100&currentPage=0',
    success: function(httpResponse) {
      // console.log(httpResponse.text);
      var data = JSON.parse(httpResponse.text);
      //获取漫画列表
      var dataList = data.data.contentlist;
      console.log(dataList.length);
      saveComics(0,dataList);
    },
    error: function(httpResponse) {
      console.log("请求超时");
    }
  });
}



/**
 * 一个简单的云代码方法
 */
AV.Cloud.define('hello', function(request, response) {
  response.success('Hello world!');
});

AV.Cloud.define("getComicsData", function(request, response) { 
  	getComicsData();
  	console.log("获取内涵漫画");
});

module.exports = AV.Cloud;
