import express, { Request, Response, NextFunction } from "express";

const router = express.Router();

let client = require('cheerio-httpcli');
let urlType = require('url');

let cheerio = require('cheerio');
let request = require('request');
let url = "http://www.kweather.co.kr/kma/kma_city.html";
let param = {};

let region:string[] = new Array(91);
let weather:string[] = new Array(91);
let tem:string[] = new Array(91);

let nature = new Array(38);
let mountain = [ 4,6,8,9,13,14,15,17,18,20,21,22,27,29,30,31,34,35,36 ];

const travel = [
    {
      where:'경포해수욕장',
      url:'https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Fcfile%2Ftistory%2F24292337596AB3D51E',
      envir: 'sea',
      explain: '하얀 모래밭과, 시끄러운 일상을 조용히 차단하는 울창한 송림병풍의 조화가 해변 특유의 아름다움을 자아낸다. 또한 주변에 설악산,오대산 국립공원이 있어 산, 바다, 계곡 등을 두루두루 돌아 볼 수 있다.',
    }
]

for (let index = 0; index < nature.length; index++) {
    let flag = 0;
    let element = nature[index];
  
    for (let number = 0; number < mountain.length; number++) {
      if(index == mountain[number]) {
      flag = 1;   
      }
  
      if(flag == 1) nature[index] = '산'
      else nature[index] = '바다';
    }
    flag = 0;
}

let num = [1,7,9,10,11,13,15,17,19,20,22,23,26,28,30,35,36,38,40,41,42,44,45,48,49,54,55,56,63,64,66,67,70,72,73,74,75,88];

request(url, function (error:Error, response:any, html:any){
    let $ = cheerio.load(html);
    for (let index = 0; index < 91; index++) {
        for (let number = 0; number < num.length; number++) {
        if(index == num[number])
        region[index] = $(`#Container > div:nth-child(3) > div.kma_city_present > ul > li > table > tbody > tr:nth-child(${num[number]}) > td:nth-child(1)`).text();
        }
    }
    region = region.filter(function(item) {
        //return item !== num && item !== undefined && item !== "";
        return item !== undefined && item !== "";
    });
    //console.log(region);

});

router.get('/', function(req:Request, res:Response, next:NextFunction) {
    if(req.body.userIndex) { //가져온 변수가 있는 지 확인하여 불러오는 데이터를 바꾼다.
      res.render('index', {region:region,weather:weather,tem:tem,nature:nature,travel:travel });
    } else {
      res.render('index', { region:region,weather:weather,tem:tem,nature:nature,travel:travel });
    }
  //  console.log(nature);
  });