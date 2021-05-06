import express, { Request, Response, NextFunction } from "express";
import router from "./router/router";
import index from "./router/index";

const app = express();
const port = 3002;
const mysql = require('mysql');

require('dotenv').config();

var connection = mysql.createConnection({
  host:process.env.DB_HOST,
  port:process.env.DB_PORT,
  user:process.env.DB_USER ,
  password:process.env.DB_PASSWORD,
  database:process.env.DB_DATABASE
});

connection.connect();


app.use("/router", router);
app.use("/",index);

const hostname = "10.120.75.224";
app.listen(port,hostname, () => console.log(`listening on port ${port}!`));