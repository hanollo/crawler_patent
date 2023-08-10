import axios from 'axios';
import cheerio from 'cheerio';
import _ from 'lodash';
import { parse } from 'node-html-parser';

async function crawlWebsiteWithPost(/*url: string, postData: any*/): Promise<void> {
  try {


    const content: Record<string, Record<string, string>> = {};

    const param = new URLSearchParams();
    param.set('queryText', 'RG=[1101115119080]');

    param.set('searchInResultCk', 'undefined');

    param.set('next', 'MainList');
    param.set('config', 'G1111111111111111111111S111111111000000000');
    param.set('sortField', 'RANK');
    param.set('sortStage', 'DESC');
    param.set('configChange', 'Y');
    param.set('expression', 'RG=[1101115119080]');
    param.set('historyQuery', 'RG=[1101115119080]');
    param.set('numPerPage', '30');
    param.set('numPageLinks', '10');
    param.set('currentPage', '1');
    param.set('beforeExpression', 'RG=[1101115119080]');
    param.set('userInput', '1101115119080');

    param.set('searchInTrans', 'null');

    param.set('logFlag', 'Y');
    param.set('searchSaveCnt', '0');
    param.set('SEL_PAT', 'KPAT');
    param.set('strstat', 'SMART|RG|');

    param.set('searchInTransCk', 'undefined');

    const result = await axios({
      url: 'http://kpat.kipris.or.kr/kpat/resulta.do',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        accept: '*/*',
        'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        referrer:
          'http://kpat.kipris.or.kr/kpat/searchLogina.do?next=MainSearch',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
      data: param.toString(),
      method: 'POST',
      responseType: 'json',
    });

    const html = result.data;
    console.log(html);
    //
    // const html = result?.data?.data;
    // const root = parse(html);
    // console.log(root)
    //



    //
    //
    // // POST 요청을 보내고 응답 데이터 가져오기
    // const response = await axios.post(url, postData);
    // const html = response.data;
    //
    // // Cheerio를 사용하여 HTML 파싱
    // const $ = cheerio.load(html);
    //
    // // 원하는 데이터 추출 예시: 웹사이트의 제목 추출
    // const title = $('title').text();
    // console.log('Website Title:', title);
    //
    // // 원하는 데이터 추출 예시: 모든 링크 추출
    // const links: string[] = [];
    // $('a').each((index, element) => {
    //   const href = $(element).attr('href');
    //   if (href) {
    //     links.push(href);
    //   }
    // });
    // console.log('Links:', links);
    //
    // // 원하는 데이터 추출 예시: 특정 CSS 선택자를 사용하여 데이터 추출
    // const mainContent = $('#main-content').text();
    // console.log('Main Content:', mainContent);
    //
    // // Lodash를 사용하여 배열 정렬 및 중복 제거 예시
    // const sortedUniqueLinks = _.sortedUniq(links);
    // console.log('Sorted and Unique Links:', sortedUniqueLinks);
  } catch (error) {
    console.error('Error:', error);
  }
}


// const targetUrl = 'https://www.wikipedia.org'; // 크롤링할 웹사이트 URL
// const postData = {
//   username: 'your_username',
//   password: 'your_password',
//   // ... 추가 필드 및 데이터
// };
// crawlWebsiteWithPost(targetUrl, postData);

crawlWebsiteWithPost();