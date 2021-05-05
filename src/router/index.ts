import express, { Request, Response, NextFunction } from "express";

const index = express.Router();

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
    where: '무등산',
    url:'https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Fcfile%2Ftistory%2F24292337596AB3D51E',
    envir: '산',
    explain: '무등산은 비할 데 없이 높고 큰 산 또는 등급을 매길 수 없을 정도의 고귀한 산 이라는 의미를 지니고 있다. 최고봉인 천왕봉을 중심으로 서석대·입석대가 있다.',
  },
  {
    where: '펭귄마을',
    url:'https://pds.joins.com/news/component/joongboo/201802/07/1227836_1096803_3047.jpg',
    envir: '좋',
    explain: '전남 광주 양림동은 과거로 떠나는 타임머신 여행지다. 광주 근현대사 여행지로 인기가 높은 이곳엔 옛 추억을 불러일으키는 또 다른 시간 여행지가 있다. 이름도 재밌는 펭귄마을. 비록 펭귄은 살지 않지만 그보다 더 눈길을 끄는 잡다한 볼거리들이 가득하다. 시간 여행 속 색다른 여행지로 떠오르는 곳이다.',
  },
  {
    where: '대인시장',
    url:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Gyeongpodae_Pavilion_Gangneung.JPG/1200px-Gyeongpodae_Pavilion_Gangneung.JPG',
    envir: '좋',
    explain: '현재 광주 대인시장은 예술가와 상인들이 함께 거주하는 공간이 되었고, 매주 토요일 저녁 예술야시장 등을 개최하며 많은 사람들을 매료시키고 있다.',
  },
  {
    where: '운천저수지',
    url:'https://www.hanion.co.kr/news/photo/201809/8013_30381_421.jpg',
    envir: '바다',
    explain: '아름다운 풍경이 있는 저수지로, 산책하기 좋고 여러 종류의 꽃들이 피므로 꽃구경하기도 굉장히 좋다.',
  },
  {
    where: '518민주광장',
    url:'https://joyfesta.kr/uploadedfiles/spot/2019/04/%EB%B3%B4%EB%A6%AC%EB%B0%AD_173600583.jpg',
    envir: '역사',
    explain: '이곳은 과거 민주화 항쟁의 전초기지였으며, 도청 앞 분수대를 연단 삼아 각종 집회가 열리기도 했다. 현재도 5.18 민주화운동과 관련된 많은 행사들이 이곳에서 거행되고 있으며, 역사의 현장을 직접 보기 위한 많은 관광객들이 방문하고 있다. ',
  },
  {
    where: '왕인박사유적지',
    url:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRn56dYSYN---KoOa3pbcWfP2tXMzh0g_7yqA&usqp=CAU',
    envir: '역사',
    explain: '읍성 또는 성곽도시는 마을이나 도시 같은 중대규모 거주지를 치안, 행정, 방위의 목적으로 방벽으로 둘러친 성곽형 방어시설이다.',
  },
  {
    where: '월출산',
    url:'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fdf1jJq%2Fbtqu06craac%2FKKjj7c4Pt0Y84YxMDHfsyK%2Fimg.jpg',
    envir: '산',
    explain: '남포미술관은 남도 화단의 작가들이 대거 참여하여 정열적인 예술혼이 가득 담긴 서정적이고 격조 높은 회화작품들을 상설전시하는 1종 미술관이다',
  },
  {
    where: '도기 문화센터',
    url:'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbzdTrB%2Fbtqu1bq2xA1%2FMfcCF0gCaKN1jH1lnuuBtk%2Fimg.jpg',
    envir: '좋',
    explain: '해창만 간척지 제방 유휴토지에 오토갬핑장, 야외 공연장, 산책로 등을 조성하여 관광객에게 편안한 휴식공간을 제공하고자 해창만 간철지 공원을 조성하였다. 앞쪽으로는 담수호, 뒤쪽으로는 바다가 위치하고 있어 낚시하기에 좋은 장소이다.',
  },
  {
    where: '',
    url:'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FelvTY4%2FbtquZGlsht8%2FxJ34kWAOn02L4LRq8KMfJk%2Fimg.jpg',
    envir: 'good',
    explain: '한국이 자체 기술로 인공위성을 우주 공간으로 쏘아올리기 위해 건설된 한국 최초의 우주발사체 발사기지인 나로우주센터와는 해상으로 15km 직선거리에 위치하여 나로호 발사 광경을 넓은 바다와 함께 볼 수 있다.',
  },
  {
    where: '',
    url:'http://tong.visitkorea.or.kr/cms/resource/20/1575820_image2_1.jpg',
    envir: 'good',
    explain: '광양 매화마을의 농가들은 산과 밭에 곡식 대신 모두 매화나무를 심어 매년 3월이 되면 하얗게 만개한 매화꽃이 마치 백설이 내린 듯, 또는 하얀 꽃구름이 골짜기에 내려앉은 듯 장관을 이룬다.',
  },
  {
    where: '금성관',
    url:'http://tong.visitkorea.or.kr/cms/resource/82/1606782_image2_1.jpg',
    envir: '좋',
    explain: '수십년 묵은 매화나무 아래 청보리가 바람을 타는 농원 중턱에 서면 굽이져 흐르는 섬진강너머 하동쪽 마을이 동양화처럼 내려다보인다.섬진강가의 산마다 매화나무가 많이 자라 저마다 꽃을 피워내지만 광양시 도사리 일대의 청매실농원만큼 풍성한 곳도 드물다.',
  },
  {
    where: '나주호',
    url:'http://tong.visitkorea.or.kr/cms/resource/12/169612_image2_1.jpg',
    envir: '바다',
    explain: '해발 1,218m의 백운산을 주봉으로 하여 인공림과 천연림이 조화된 아름드리 소나무가 융단처럼 펼쳐져 있고 삼나무와 편백 숲속의 계곡은 감탄을 자아내게 한다.',
  },
  {
    where: '영산포 등대',
    url:'https://wishbeen-seoul.s3.ap-northeast-2.amazonaws.com/post/1463917077569_IMG_5973.JPG',
    envir: '바다',
    explain: '전통정자와 목교등을 설치하여 물과 전통이 조화를 이루는 광주의 상징적 쉼터로 개발하여 1일 수백명의 이용객이 찾고있다.',
  },
  {
    where: '금성산',
    url:'https://t1.daumcdn.net/cfile/tistory/99DD16335A01C54B2D',
    envir: '산',
    explain: '광주예술의 거리는 예향 광주의 전통을 계승 발전시키기 위해 조성되었다. 서울 인사동처럼 갤러리와 화방, 표구점, 골동품점, 소극장, 고서점, 전통 찻집 등이 뺴곡히 들어서 있다.',
  },
  {
    where: '영산나루마을',
    url:'https://t1.daumcdn.net/cfile/tistory/99A98A335A01C54F19',
    envir: '좋',
    explain: '광주의 무등산은 25년만에 21번째 국립공원으로 2013년 지정되었다.정상부근의 서석대와 입석대 등 거대한 주상절리 기둥들은 독특한 경관을 만들어낸다.',
  },
  {
    where: '죽녹원',
    url:'http://tong.visitkorea.or.kr/cms/resource/59/1603759_image2_1.jpg',
    envir: '좋',
    explain: '은파의 특성과 이미지를 반영한 꽃잎 형태의 분수로 호수와 물빛다리를 연계한 아름답고 환상적인 분수를 연출하고 있다. 분수형태는 꽃잎 형태로 그 아름다움을 더한다.',
  },
  {
    where: '메타세콰이어가로수길',
    url:'https://lh3.googleusercontent.com/proxy/fkaoA50tTyNge2DXBpNotIF2L2d7b_Z3AyanFjwz5evn-7cLnhAxun0lJk3WDPRF6Zs_irE4psRUXARg7nCD0NSpVvDX8W3UH7QnY1CJ6hWxi8jHtHP9',
    envir: '좋',
    explain: '선유도의 동쪽에 위치한 섬으로 면적 4.25㎢, 해안선의 길이 16.5㎞로 고군산군도의 24개 가운데 가장 큰 섬이다. 개막이, 바지락캐기, 낚시 등 체험관광이 활성화되어 있다.',
  },
  {
    where: '소쇄원',
    url:'http://tong.visitkorea.or.kr/cms/resource/16/1603816_image2_1.jpg',
    envir: '좋',
    explain: '금강철새조망대는 자연이 준 천혜의 보고 금강호를 배경으로 세계인이 공유하고자 국민생태관광지로 구성된 자연친화적 생태공원이다.',
  },
  {
    where: '금성산성',
    url:'http://tong.visitkorea.or.kr/cms/resource/22/1207222_image2_1.jpg',
    envir: '좋',
    explain: '장유대청계곡은 불모산 산자락에 양갈래로 형성된 6km의 긴계곡으로 산림이 울창하고 맑은 물이 폭포를 이루는 등 자연경관이 빼어난 곳이다.',
  },
  {
    where: '메타프로방스',
    url:'http://tong.visitkorea.or.kr/cms/resource/61/1611261_image2_1.jpg',
    envir: '좋',
    explain: '왕릉은 선조 13년(1580)에 영남관찰사 허엽이 능을 지금의 모습으로 단장하였다.능의 경내에는 수로왕, 수로왕비의 신위를 모신 숭선전을 비롯하여 안향각, 전사청, 제기고 등 여러 건물과 신도비, 공적비 등 석조물이 있다.',
  },
  {
    where: '한옥마을',
    url:'http://tong.visitkorea.or.kr/cms/resource/50/1611250_image2_1.jpg',
    envir: '역사',
    explain: '한옥마을은 풍남동 일대에 700여채의 한옥이 군락을 이루고 있는 국내 최대 규모의 전통 한옥촌이며, 1910년에 조성되기 시작해서 1977년도에 한옥보전지구로 지정되었습니다. 현재 20여개의 문화시설이 산재해 있습니다. 전주경기전, 조선 태조어진, 하바미, 전주 전동성당 등 볼거리들이 가득합니다.',
  },
  {
    where: '전주 향교',
    url: 'https://t1.daumcdn.net/cfile/blog/2145553554071A741D',
    envir: '좋',
    explain: '가천다랭이마을 체험은 남해인의 억척스러움이 고스란히 묻어있는 다랭이 논을 돌아보는 것으로 시작한다. 들쭉날쭉 제 멋대로 생긴 논들이지만 그 사이사이로 산뜻한 산책로와 전망대가 마련돼 있어 편안히 돌아볼 수 있다.',
  },
  {
    where: '전동성당 풍남문',
    url: 'https://mblogthumb-phinf.pstatic.net/20160716_73/namhaestorys_1468665280052iAk7X_JPEG/IMG_3470.jpg?type=w800',
    envir: '좋',
    explain: '조국 근대화와 경제발전에 헌신한 독일 거주 교포들의 정착생활 지원과 조국의 따뜻한 정을 느낄 수 있는 삶의 터전을 마련하기 위해 개발되었다.',
  },
  {
    where: '자만벽화마을',
    url: 'https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Fcfile%2Ftistory%2F2661BC365626190011',
    envir: '좋',
    explain: '소금강 또는 남해금강이라 불리는 삼남 제일의 명산. 금산(704m)은 한려해상국립공원의 유일한 산악공원으로 온통 기암괴석들로 뒤덮인 38경이 절경을 이루고 있다.',
  }
];

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

request(url, function (error:Error, response:ResponseType, html:HTMLAreaElement){
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

request(url, function (error:Error, response:ResponseType, html:HTMLAreaElement){
  var $ = cheerio.load(html);
  for (let index = 0; index < 91; index++) {
    for (let number = 0; number < num.length; number++) {
       if(index == num[number])
       tem[index] = $(`#Container > div:nth-child(3) > div.kma_city_present > ul > li > table > tbody > tr:nth-child(${index}) > td:nth-child(3)`).text();
    }
  }
  tem = tem.filter(function(item) {
    return item !== undefined && item !== "";
  });
  //console.log(tem);
});

request(url, function (error:Error, response:ResponseType, html:HTMLAreaElement){
  var $ = cheerio.load(html);
  for (let index = 1; index < 91; index++) {
       weather[index] = $(`#Container > div:nth-child(3) > div.kma_city_present > ul > li > table > tbody > tr:nth-child(${index}) > td:nth-child(2)`).text();

  }
  weather = weather.filter(function(item) {
    return item !== undefined && item !== "";
  });
  console.log(weather);
});


index.get('/', function(req:Request, res:Response, next:NextFunction) {
  res.json({region:region});
});
  
export = index;