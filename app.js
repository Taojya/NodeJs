'use strict'
const express = require('express');
//解析post请求体数据
const bodyParser = require('body-parser');
//文件功能增强的包
const fse = require('fs-extra');
//解析上传文件的包
const formidable = require('formidable');
//引入path核心对象
const path = require('path');

const mysql = require('mysql')
const pool = mysql.createPool({
  connectionLimit: 10,
  host: '127.0.0.1',
  user: 'root',
  password: 'mysql',
  database: 'album'
})

// 创建服务器
let app = express()
// 配置模板引擎
app.engine('html', require('express-art-template'))
//配置路由规则
let router = express.Router()

// 测试路由
router.get('/test', (req, res, next) => {
    pool.getConnection(function (errr, connection) {
      connection.query('SELECT * FROM album_dir',
        function (error, results, fields) {
          connection.release()
          if (error) throw error
          res.render('test.html', {
            text: results[2].dir
          })
        })
    })
  })

  //显示相册列表
  .get('/', (req, res, next) => {
    //获取连接
    pool.getConnection((err, connection) => {
      //获取连接异常处理
      if (err) return next(err)
      //查询数据
      connection.query('select * from album_dir',
        (error, results) => {
          // 查询完毕，释放链接
          connection.release()
          // 查询失败异常处理
          if (err) return next(err)
          res.render('index.html', {
            album: results
          })
        })
    })
  })
  //显示照片列表
  .get('/showDir', (req, res, next) => {
    //获得url上查询字符串
    let dirname = req.query.dir
    // console.log(dirname)
    pool.getConnection((err, connection) => {
      // 处理链接异常
      if (err) return next(err)
      connection.query('select * from album_file where dir =?', [dirname], (error, results) => {
        // 查询完毕释放链接
        connection.release()
        if (err) return next(err)

        // 记录相册名
        res.render('album.html', {
          album: results,
          dir: dirname
        })
      })
    })
  })
//添加目录
.post('/addDir',(req,res,next) => {
  let dirname =req.body.dirname
  pool.getConnection((err,connection) => {
    // 处理链接异常
    if(err) return next(err)
    //插入数据
    connection.query('insert into album_dir values (?)',[dirname],(error,results) => {
      connection.release()
      if(err) return next(err)
      // 直接跳转相册界面
      res.redirect('/showDir?dir='+dirname)
    })
  })
})

//处理静态资源
// /public/vender/bootstrap/js/bootstrap.js
app.use('/public', express.static('./public'));
//向外暴露相片静态资源目录
app.use('/resource', express.static('./resource'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: false
}));
// parse application/json
app.use(bodyParser.json());
///中间件执行列表
app.use(router);
// 错误处理中间件
app.use((err, req, res, next) => {
  console.log('出错啦.-------------------------');
  console.log(err);
  console.log('出错啦.-------------------------');
  res.send(`
                您要访问的页面出异常拉...请稍后再试..
                <a href="/">去首页玩</a>
        `);
})

//开启服务器
app.listen(5555, () => {
  console.log('服务器启动了')
})