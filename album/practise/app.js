'use strict'
// 服务器基本事件套
// 1-引入对象
const express =require('express')
 //-引入第三方包对象
 const bodyParser= require('body-parser')
 let heros=[
   {id:1,name:'jack'},
   {id:2,name:'rose'},
   {id:3,name:'tom'}
 ]


//  数据库包
const mysql =require('mysql')
//连接数据库
const pool = mysql.createPool({
  connectionLimit:10,
  host:'127.0.0.1',
  user:'root',
  password:'mysql',
  database:'itcast'
})
// 2-创建服务器
let app = express()
// 3-监听端口，开始服务器
app.listen(5555,() => {
  console.log('服务器启动了')
  
})

//配置模板引擎
app.engine('html',require('express-art-template'))

let router =express.Router()
router.get('/',(req,res) => {
  res.json({name:'home'}) 
})
.get('/list',(req,res) => {
  //获取查询字符串参数
  let dir =req.query.dir
  console.log(dir)
  res.json({
    name:'list',
    query:dir
  })  
})
.post('/add',(req,res) => {
//post请求体数据
let type =req.body.type
console.log(type)

res.json({
  name:'add',
  body:type
})
})
.get('/heros',(req,res) => {
  res.render('index.html',{myHeros:heros})
})
.get('/showHero/:heroid',(req,res) => {
  let id =req.params.heroid
  pool.getConnection(function(err,connection){
    connection.query('select * from articles where id = ?',[id],function(error,results,flieds){
      connection.release()
      if(error) throw error
      res.json({
        name:`您点的是${id}`,
        data:results[0]
      })
    })
  })
})
// 重定向
.post('/add-hero',(req,res) => {
  // 模拟业务操作添加完毕
  res.redirect('/showHero/1')
})



// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
// 4-处理请求响应数据
app.use(router)