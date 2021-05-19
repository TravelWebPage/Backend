import axios from "axios";
import express, { Request, Response, NextFunction } from "express";

const index = express.Router();

let cheerio = require('cheerio');
let request = require('request');
let url = "http://www.kweather.co.kr/kma/kma_city.html";
let event_url = "https://korean.visitkorea.or.kr/list/fes_list.do?choiceTag=%EA%B3%B5%EC%97%B0/%ED%96%89%EC%82%AC&choiceTagId=ca662dcd-d7f0-11e8-bff9-02001c6b0001";


let param = {}; 

let region:string[] = new Array(91);
let weather:string[] = new Array(91);
let tem:string[] = new Array(91);
let data_cut:string;
let data:string;
let event_data:string[] = new Array(91)

let region_num:number[] = [ 10,22,65,43,69 ];
let nature = new Array(38);
//let mountain = [ 4,6,8,9,13,14,15,17,18,20,21,22,27,29,30,31,34,35,36 ];

const travel = [
  {
    where: '무등산',
    url:'https://t1.daumcdn.net/cfile/tistory/99A98A335A01C54F19',
    envir: '산',
    explain: '무등산은 비할 데 없이 높고 큰 산 또는 등급을 매길 수 없을 정도의 고귀한 산 이라는 의미를 지니고 있다. 최고봉인 천왕봉을 중심으로 서석대·입석대가 있다.',
  },
  {
    where: '펭귄마을',
    url:'https://t1.daumcdn.net/cfile/tistory/996049335A01C54808',
    envir: '좋',
    explain: '전남 광주 양림동은 과거로 떠나는 타임머신 여행지다. 광주 근현대사 여행지로 인기가 높은 이곳엔 옛 추억을 불러일으키는 또 다른 시간 여행지가 있다. 이름도 재밌는 펭귄마을. 비록 펭귄은 살지 않지만 그보다 더 눈길을 끄는 잡다한 볼거리들이 가득하다. 시간 여행 속 색다른 여행지로 떠오르는 곳이다.',
  },
  {
    where: '대인시장',
    url:'https://lh3.googleusercontent.com/proxy/1LUQY-42VMVC7RIgv4GRVJXZ0CIWJLijCpdVWyvlKN5IUgjU6v_DqEYMt5HWFX7bQyI4S5sVKwrmgn5tLjaiB7iJOz5UnAv4dRQ9mRCiWrZOuJU7eVLsDIEsTXJn-VgKiumeONwQRGHPVjw6Lizccy1tuIsUDrmRbnQ7eSzUQQgxLiznhFhdTcxQx42vaW1qFF8K4c1w2TwY92vWIXw66N0AvOGvWytfI2iqRy8jB0h2gZdhQZfTzo1kdVIVDqM2tirIJqThvSwOEJQx8tyCZPWK8J5nhdzUw12dWmvgqns',
    envir: '좋',
    explain: '현재 광주 대인시장은 예술가와 상인들이 함께 거주하는 공간이 되었고, 매주 토요일 저녁 예술야시장 등을 개최하며 많은 사람들을 매료시키고 있다.',
  },
  {
    where: '운천저수지',
    url:'https://t1.daumcdn.net/cfile/tistory/991976335A01C54E0C',
    envir: '바다',
    explain: '아름다운 풍경이 있는 저수지로, 산책하기 좋고 여러 종류의 꽃들이 피므로 꽃구경하기도 굉장히 좋다.',
  },
  {
    where: '518민주광장',
    url:'https://t1.daumcdn.net/cfile/tistory/99AA39335A01C55007',
    envir: '역사',
    explain: '이곳은 과거 민주화 항쟁의 전초기지였으며, 도청 앞 분수대를 연단 삼아 각종 집회가 열리기도 했다. 현재도 5.18 민주화운동과 관련된 많은 행사들이 이곳에서 거행되고 있으며, 역사의 현장을 직접 보기 위한 많은 관광객들이 방문하고 있다. ',
  },
  {
    where: '왕인박사유적지',
    url:'https://nimage.g-enews.com/phpwas/restmb_allidxmake.php?idx=5&simg=20191013112029027364e4869c12021110617783.jpg',
    envir: '역사',
    explain: '구림마을의 동쪽 문필봉 기슭에 자리잡고 있으며 왕인이 새롭게 조명되면서 그의 자취를 복원해 놓은 곳이다. 왕인박사의 탄생지인 성기동과 박사가 마셨다고 전해오고 있는 성천(聖泉)이 있으며, 탄생지 옆에는 유허비(遺墟碑)가 세워져 있다.',
  },
  {
    where: '월출산',
    url:'https://zznz.co.kr/wp-content/uploads/2020/05/A%EC%9B%94%EC%B6%9C%EC%82%B0-3.jpg',
    envir: '산',
    explain: '월출산은 전라남도 영암군과 강진군에 걸쳐있는 산이다. 1973년 1월 29일에 도립공원으로, 1988년 6월 11일에는 국립공원으로 지정되었다. 월출산이라는 이름은 달이 뜨는 산라는 의미이다',
  },
  {
    where: '도기 문화센터',
    url:'https://cdn.yasinmoon.com/news/photo/200904/9931_11107_5727.jpg',
    envir: '좋',
    explain: '한국도기의 역사성을 보여주는 전시실과 영암의 붉은 황토를 이용하여 손으로 빚어 만드는 영암도기 생산공방이 있다. 특히 2003년 새롭게 연 전통고가마 영암요와 전통공방이 있으며 진정한 한국 전통 도기의 중심이 되고 있다',
  },
  {
    where: '도갑사',
    url:'http://here.busan.com/data/file/trip_tour/28408080_c0waAJTU_DSC04007.JPG',
    envir: '역',
    explain: '지금도 대웅전 뒤 천여 평의 빈터에는 주춧돌이 선명하게 군데군데 박혀 있고, 앞뜰에는 5m에 달하는 스님들이 마실 물을 담아 두는 석조의 크기가 도갑사의 옛 사세와 승려수를 말없이 전해주고 있습니다.',
  },
  {
    where: '영암향교',
    url:'https://lh3.googleusercontent.com/proxy/80-fq_PwkAgJyemaVGRR6Asnc88bsUUUmVhNwJlNaIebZLew-xxLS91Xp6IcN-yHNeMUi55NEnkRAx6goNM',
    envir: '역',
    explain: '전라남도 문화재자료 제126호로 지정되어 있으며, 운영은 전교(典校) 1명과 장의(掌議) 수명이 담당하고 있습니다',
  },
  {
    where: '섬진강가',
    url:'http://tong.visitkorea.or.kr/cms/resource/82/1606782_image2_1.jpg',
    envir: '좋',
    explain: '수십년 묵은 매화나무 아래 청보리가 바람을 타는 농원 중턱에 서면 굽이져 흐르는 섬진강너머 하동쪽 마을이 동양화처럼 내려다보인다.섬진강가의 산마다 매화나무가 많이 자라 저마다 꽃을 피워내지만 광양시 도사리 일대의 청매실농원만큼 풍성한 곳도 드물다.',
  },
  {
    where: '나주호',
    url:'https://www.jnilbo.com//2019/05/16/2019051614123762318_l.jpg',
    envir: '바다',
    explain: '경관이 수려한 인공 호수, 나주호 * 영산강 종합개발계획의 하나로 만들어진 저수량 9,100만 톤의 인공호수. 주변경치가 뛰어나, 나주호와 인근 사찰들을 찾는 관광객이 늘고 있습니다.',
  },
  {
    where: '영산포 등대',
    url: 'http://www.naju.go.kr/build/images/module/smartour/smartour_tour/og_img_20161215130418_0157czz4qskj0flw1slu1lb0vy240e.jpg',
    envir: '바다',
    explain: '영산포 선창은 1960년대까지 각종 선박이 왕래하면서 많은 수산물들이 유통 되었습니다. 특히 산 홍어와 추자 멸치젓배가 왕래해 지금도 선창가에는 어물전들이 남아서 그 옛날의 정취를 느끼게 합니다.',
  },
  {
    where: '금성관',
    url: 'https://img1.yna.co.kr/etc/inner/KR/2019/10/25/AKR20191025046200005_01_i_P4.jpg',
    envir: '좋',
    explain: '일제 강점기 이후 군청 건물로 사용해오면서 원형이 파괴되어 1976년에서1977년 사이 완전해체 복원하였습니다. 현재 전라남도 유형문화재 제 2호로 지정되어 있으며, 곁에는 삼층석탑(보물50호), 사마교비, 금성토평비, 목사선정비 등의 문화재가 있습니다.',
  },
  {
    where: '영산나루마을',
    url: 'http://tong.visitkorea.or.kr/cms/resource/49/2516449_image2_1.jpg',
    envir: '좋',
    explain: '영산강과 인접해 있고 해발 150m 되는 마을 뒷산에 오르면 영산강이 유유히 흐르는 아름다운 모습을 한눈에 볼 수 있는 전형적인 농촌마을입니다. 특히 가을철 나주평야의 황금물결은 어디에서도 볼 수 없는 풍요로움을 맛볼 수 있고, 또한 일제 강점기 금광을 대발했던 금광굴은 여름철 시원하고 겨울철 따뜻하여 휴식 공간으로 안성맞춤입니다.'
  },
  {
    where: '죽녹원',
    url: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=http%3A%2F%2Fcfile2.uf.tistory.com%2Fimage%2F99E1E33C5ED2AEBA04BC8F',
    envir: '좋',
    explain: '산책로 조성이 잘되어 있어서 바람에 흔들리는 대나무 소리를 들으면서 산책하기 좋습니다. 죽녹원 안에는 한옥카페가 있어서 휴식하기에 좋고, 한옥숙박도 가능합니다. 숙박하기 위해서는 인터넷 죽녹원 홈페이지에서 사전 예약해야 합니다. '
  },
  {
    where: '메타세콰이어가로수길',
    url: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=http%3A%2F%2Fcfile23.uf.tistory.com%2Fimage%2F99D8AC335ED2AEB704A6B7',
    envir: '좋',
    explain: '담양에 가면 꼭 가봐야할 곳 중 하나는 메타세콰이어 가로수길입니다. 양쪽으로 뻥 뚫린 가로수길로 초록빛 동굴같은 길을 지나가게 됩니다. 가로수길의 총 길이는 8.5km로 도로 사이로 양쪽 길가에 높이 10~20m의 메타세콰이어가 심어져 있습니다.'
  },
  {
    where: '소쇄원',
    url: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=http%3A%2F%2Fcfile3.uf.tistory.com%2Fimage%2F99E18B3C5ED2AEB904120F',
    envir: '좋',
    explain: '정유재란때 당시의 건물은 소실되었으나 다시 복원되었습니다. 세속을 떠난 선비들이 자연에서 공부하고 수련한 곳으로 소나무와 대나무의 멋, 바위 위로 흐르는 개울물이 소박하면서도 인상적입니다. 정자에 앉아 흐르는 물소리를 들으며 사색에 잠겨보세요. '
  },
  {
    where: '금성산성',
    url: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=http%3A%2F%2Fcfile5.uf.tistory.com%2Fimage%2F99D7FC335ED2AEB5040159',
    envir: '좋',
    explain: '금성산성은 순창과 경계를 이루는 금성산(603m)에 있는 길이 3km 가까운 산성입니다. 호남 3대 산성 중 하나로고려시대에 건축되어졌다고 전해지는데 임진왜란때는 의병의 거점이 되었고, 동학농민운동때 혈전이 벌어진 장소로 각종 시설이 불타고 동,서,남,북문의 터만 남아 있습니다.'
  },
  {
    where: '메타프로방스',
    url: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=http%3A%2F%2Fcfile8.uf.tistory.com%2Fimage%2F99D8B0335ED2AEB804ECB6',
    envir: '좋',
    explain: '메타프로방스는 메타스퀘이어 가로수길 바로 옆에 있는 관광지로 유명한 프랑스의 도시 프로방스를 표방한 곳입니다. 식당, 쇼핑센터, 카페, 팬션 등이 모여있는 곳으로 다양하고 독특한 유럽풍의 가옥들로 이루어져서 이국적인 느낌이 물씬 납니다.'
  },
  {
    where: '한옥마을',
    url: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=http%3A%2F%2Fcfile22.uf.tistory.com%2Fimage%2F99D7963E5F1720A81C1F82',
    envir: '역사',
    explain: '전주하면 떠오르는 곳은 바로 한옥마을입니다. 전주를 대표하는 관광지로 한옥 건물과 여러 유서깊은 건물들이 있습니다. 연 1천만명 이상의 관광객이 다녀가는 곳으로, 전주를 가면 필히 방문해야 하는 곳입니다. '
  },
  {
    where: '전주 향교',
    url: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=http%3A%2F%2Fcfile22.uf.tistory.com%2Fimage%2F994CE13F5F17201B1E1544',
    envir: '좋',
    explain: '전주 한옥마을의 대표적인 유적지입니다. 전주항교는 고려 공민왕 3년(1354년)에 지어졌으며 태종 10년(1410년) 태조 영정을 봉안할 경기전(慶基殿) 건립으로 부(府) 서쪽 화산동으로 옮겨졌다가 선조 36년(1603년) 관찰사 장만의 상계에 의하여 현재의 위치로 재이건하였습니다.'
  },
  {
    where: '전동성당 풍남문',
    url: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=http%3A%2F%2Fcfile28.uf.tistory.com%2Fimage%2F99EB593F5F17201A1B99BE',
    envir: '좋',
    explain: '전동성당은 한옥마을에 위치한 호남 전체에서 최초로 세워진 로마네스크 양식의 건물입니다. 1908년 착공이 진행되어 1914년에 완공되었습니다. 전동성당은 풍남문이 있던 바로 그 자리에 세워진 성당으로 순교지를 보존하고 있는 신앙의 요람입니다.'
  },
  {
    where: '자만벽화마을',
    url: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=http%3A%2F%2Fcfile5.uf.tistory.com%2Fimage%2F9939F13A5F1721351E7C58',
    envir: '좋',
    explain: '한옥마을 옆 벽화마을로 주말이면 인증샷을 찍으러오는 관광객들로 북적입니다. 주민들 거주지이기도 하며, 곳곳에 카페가 있습니다. 산비탈에 위치해서 전주시내를 내려다 볼 수 있어요. 자만벽화마을에서 가장 인기 있는 벽화는 일본 지브리 스튜디오의 명작 ‘센과 치히로의 행방불명’과 ‘이웃집 토토로’ 벽화입니다.'
  }
];

const event = [
  {
    region: '영암',
    name: '영암 왕인 문화 축제',
    when: '4월',
    explain:'왕인박사춘향대제, 왕인박사일본가오, 솟대-하늘의 교신, 배움의 등 달기, 구림에서 아스카로 부는 바람, 민속공연',
    img:'https://enewstoday.co.kr/news/photo/202001/1359179_422326_2148.jpg'
  },
  {
    region: '광주',
    name: '광주 비엔날레',
    when: '5월',
    explain:'광주의 문화예술 전통과 5ㆍ18광주민중항쟁 이후 국제사회 속에 널리 알려지기 시작한 광주 민주정신을 새로운 문화적 가치로 승화시키기 위하여 창설되었다.',
    img:'data:image/jpeg;base64,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'
  },
  {
    region: '광주',
    name: '광주 민속문화 체험마당',
    when: '4월',
    explain:'왕인박사춘향대제, 왕인박사일본가오, 솟대-하늘의 교신, 배움의 등 달기, 구림에서 아스카로 부는 바람, 민속공연',
    img:'https://enewstoday.co.kr/news/photo/202001/1359179_422326_2148.jpg'
  },
  {
    region: '광주',
    name: '광주 세계 김치 축제',
    when: '4월',
    explain:'왕인박사춘향대제, 왕인박사일본가오, 솟대-하늘의 교신, 배움의 등 달기, 구림에서 아스카로 부는 바람, 민속공연',
    img:'https://enewstoday.co.kr/news/photo/202001/1359179_422326_2148.jpg'
  },
  {
    region: '광주',
    name: '광주 프린지페스티벌',
    when: '11월',
    explain:'2016년에 처음 시작된 광주프린지페스티벌은 장르나 형식, 정해진 틀에 얽매이지 않고 아마추어·전문 예술인과 시민이 자유롭게 만들어 가는 토요일의 유쾌한 문화난장, 광주 대표 브랜드광장문화축제이다.',
    img:'http://tong.visitkorea.or.kr/cms/resource/75/2487975_image2_1.jpg'
  },
  {
    region: '광주',
    name: '광주 ACE Fair',
    when: '4월',
    explain:'왕인박사춘향대제, 왕인박사일본가오, 솟대-하늘의 교신, 배움의 등 달기, 구림에서 아스카로 부는 바람, 민속공연',
    img:'https://enewstoday.co.kr/news/photo/202001/1359179_422326_2148.jpg'
  },
  {
    region: '광주',
    name: '광주 도자기 축제',
    when: '4월',
    explain:'왕인박사춘향대제, 왕인박사일본가오, 솟대-하늘의 교신, 배움의 등 달기, 구림에서 아스카로 부는 바람, 민속공연',
    img:'https://enewstoday.co.kr/news/photo/202001/1359179_422326_2148.jpg'
  },
  {
    region: '광주',
    name: '광주 문화재 야행',
    when: '4월',
    explain:'왕인박사춘향대제, 왕인박사일본가오, 솟대-하늘의 교신, 배움의 등 달기, 구림에서 아스카로 부는 바람, 민속공연',
    img:'https://enewstoday.co.kr/news/photo/202001/1359179_422326_2148.jpg'
  },
  {
    region: '광주',
    name: '광주 왕인 문화 축제',
    when: '4월',
    explain:'왕인박사춘향대제, 왕인박사일본가오, 솟대-하늘의 교신, 배움의 등 달기, 구림에서 아스카로 부는 바람, 민속공연',
    img:'https://enewstoday.co.kr/news/photo/202001/1359179_422326_2148.jpg'
  },
  {
    region: '광주',
    name: '광주 왕인 문화 축제',
    when: '4월',
    explain:'왕인박사춘향대제, 왕인박사일본가오, 솟대-하늘의 교신, 배움의 등 달기, 구림에서 아스카로 부는 바람, 민속공연',
    img:'https://enewstoday.co.kr/news/photo/202001/1359179_422326_2148.jpg'
  },
  {
    region: '광주',
    name: '광주 왕인 문화 축제',
    when: '4월',
    explain:'왕인박사춘향대제, 왕인박사일본가오, 솟대-하늘의 교신, 배움의 등 달기, 구림에서 아스카로 부는 바람, 민속공연',
    img:'https://enewstoday.co.kr/news/photo/202001/1359179_422326_2148.jpg'
  },
  {
    region: '광주',
    name: '광주 왕인 문화 축제',
    when: '4월',
    explain:'왕인박사춘향대제, 왕인박사일본가오, 솟대-하늘의 교신, 배움의 등 달기, 구림에서 아스카로 부는 바람, 민속공연',
    img:'https://enewstoday.co.kr/news/photo/202001/1359179_422326_2148.jpg'
  },
  {
    region: '영암',
    name: '영암 왕인 문화 축제',
    when: '4월',
    explain:'왕인박사춘향대제, 왕인박사일본가오, 솟대-하늘의 교신, 배움의 등 달기, 구림에서 아스카로 부는 바람, 민속공연',
    img:'https://enewstoday.co.kr/news/photo/202001/1359179_422326_2148.jpg'
  },
  {
    region: '영암',
    name: '영암 왕인 문화 축제',
    when: '4월',
    explain:'왕인박사춘향대제, 왕인박사일본가오, 솟대-하늘의 교신, 배움의 등 달기, 구림에서 아스카로 부는 바람, 민속공연',
    img:'https://enewstoday.co.kr/news/photo/202001/1359179_422326_2148.jpg'
  },
  {
    region: '영암',
    name: '영암 왕인 문화 축제',
    when: '4월',
    explain:'왕인박사춘향대제, 왕인박사일본가오, 솟대-하늘의 교신, 배움의 등 달기, 구림에서 아스카로 부는 바람, 민속공연',
    img:'https://enewstoday.co.kr/news/photo/202001/1359179_422326_2148.jpg'
  },
  {
    region: '영암',
    name: '영암 왕인 문화 축제',
    when: '4월',
    explain:'왕인박사춘향대제, 왕인박사일본가오, 솟대-하늘의 교신, 배움의 등 달기, 구림에서 아스카로 부는 바람, 민속공연',
    img:'https://enewstoday.co.kr/news/photo/202001/1359179_422326_2148.jpg'
  },
  {
    region: '영암',
    name: '영암 왕인 문화 축제',
    when: '4월',
    explain:'왕인박사춘향대제, 왕인박사일본가오, 솟대-하늘의 교신, 배움의 등 달기, 구림에서 아스카로 부는 바람, 민속공연',
    img:'https://enewstoday.co.kr/news/photo/202001/1359179_422326_2148.jpg'
  },
  {
    region: '영암',
    name: '영암 왕인 문화 축제',
    when: '4월',
    explain:'왕인박사춘향대제, 왕인박사일본가오, 솟대-하늘의 교신, 배움의 등 달기, 구림에서 아스카로 부는 바람, 민속공연',
    img:'https://enewstoday.co.kr/news/photo/202001/1359179_422326_2148.jpg'
  },
  {
    region: '영암',
    name: '영암 왕인 문화 축제',
    when: '4월',
    explain:'왕인박사춘향대제, 왕인박사일본가오, 솟대-하늘의 교신, 배움의 등 달기, 구림에서 아스카로 부는 바람, 민속공연',
    img:'https://enewstoday.co.kr/news/photo/202001/1359179_422326_2148.jpg'
  },

]

/*
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
}*/



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
  //console.log(weather);
});

index.get('/', function(req:Request, res:Response, next:NextFunction) {
  res.json({travel:travel});
});


index.get('/postdata/indexpage', function(req:Request, res:Response, next:NextFunction) {
  res.json({travel:travel});
});

  
export = index;