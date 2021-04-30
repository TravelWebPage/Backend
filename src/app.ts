import express, { Request, Response, NextFunction } from "express";
import router from "./router/router";

const app = express();

const mysql = require('mysql');

var connection = mysql.createConnection({
  host:process.env.DB_HOST,
  port:process.env.DB_PORT,
  user:process.env.DB_USER ,
  password:process.env.DB_PASSWORD,
  database:process.env.DB_DATABASE
});

connection.connect();

app.get("/", (request: Request, response: Response, next: NextFunction) => {
  response.send("hello");
});

app.use("/router", router);

app.listen(3000, () => {
  console.log("start");
});