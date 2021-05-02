import express, { Request, Response, NextFunction } from "express";
import router from "./router/router";
import index from "./router/index";

const app = express();

const mysql = require('mysql');

var connection = mysql.createConnection({
  host:process.env.DB_HOST,
  port:process.env.DB_PORT,
  user:process.env.DB_USER ,
  password:process.env.DB_PASSWORD,
  database:process.env.DB_DATABASE
});

//connection.connect();


app.use("/router", router);
app.use("/",index);

app.listen(3000, () => {
  console.log("start");
});