import express, { Request, Response, NextFunction } from "express";

const router = express.Router();

const mysql = require('mysql');
var connection = mysql.createConnection({
    host:process.env.DB_HOST,
    port:process.env.DB_PORT,
    user:process.env.DB_USER ,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_DATABASE
  });
  connection.connect();

let user:number;
router.post('/', function(req:Request, res:Response, next:NextFunction){
    //회원가입
      console.log('login post');
      var name = req.body.name;
      var email = req.body.email;
      var password = req.body.password;
      var data = [name, email, password];
  //회원정보값 입력
      connection.query("INSERT INTO userdata (email,passwd,username) VALUES ('"+email +"', '"+password+"', '"+name+"')",
      function(error:Error, result:any, fields:any) {
          if(error) {
              //파일 (다시)
              console.log('insert fail');
          } else {
              //파일(메인)
              console.log('insert success');
          }
      });
  //userlike 테이블 생성
      connection.query("INSERT INTO userlike (likeIndex) VALUES ('insert')",
      function(error:Error, results:any, fields:any) {
          if(error) {
              //파일(다시)
              console.log('userlike insert error');
          } else {
              //go main
              console.log('userlike insert success');
          }
      });
      //console.log(data);
  //userIndex값 받아오기
      connection.query("SELECT userIndex FROM userdata WHERE email = ?",[email],
      function(err:Error,results:any,fields:any) {
          if(err) {
              console.log('select err');
              //파일(다시)
          } else {
              user = results[0].userIndex;
          }
      });
      res.render('index', {userIndex:user}); //userIndex를 가지고 index페이지 보내기
  
  })
  