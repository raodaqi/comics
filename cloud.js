var AV = require('leanengine');

function getComicsData(){
  console.log("123");
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
