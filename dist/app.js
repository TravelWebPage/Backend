"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router_1 = __importDefault(require("./router/router"));
const index_1 = __importDefault(require("./router/index"));
const app = express_1.default();
const port = 3002;
const mysql = require('mysql');
require('dotenv').config();
var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});
connection.connect();
app.use("/router", router_1.default);
app.use("/", index_1.default);
const hostname = "10.120.75.224";
app.listen(port, hostname, () => console.log(`listening on port ${port}!`));
