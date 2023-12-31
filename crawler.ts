import axios from 'axios';
import { parse } from 'node-html-parser';
import { mysqlConnect } from './connect';
import sleep from 'sleep-promise';

interface patent {
  company: string; // 회사명
  corp_no: string; // 법인번호
  co_holder?: string; // 공동출원인
  title?: string; // 특허명
  application_number?: string; // 출원번호
  application_date_ymd?: string; // 출원일자
  quote?: number; // 인용횟수
  summary?: string; // 특허요약
}

async function crawlWebsiteWithPost(search_item: patent): Promise<void> {
  try {

    // 요청 파라미터
    const param = new URLSearchParams();
    param.set('queryText', `RG=[${search_item.corp_no}]`);
    param.set('searchInResultCk', 'undefined');
    param.set('next', 'MainList');
    param.set('config', 'G1111111111111111111111S111111111000000000');
    param.set('sortField', 'RANK');
    param.set('sortStage', 'DESC');
    param.set('configChange', 'Y');
    param.set('expression', `RG=[${search_item.corp_no}]`);
    param.set('historyQuery', `RG=[${search_item.corp_no}]`);
    param.set('numPerPage', '100');
    param.set('numPageLinks', '10');
    param.set('currentPage', '1');
    param.set('beforeExpression', `RG=[${search_item.corp_no}]`);
    param.set('userInput', `${search_item.corp_no}`);
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

    const html = result?.data;
    const root = parse(html);
    const rows: patent[] = [];


    //html parsing
    root.querySelectorAll('article')
      .map((pat) => {
        const input = pat.querySelector('input');
        const title = input?.attributes.title;
        const applicationNumber = input?.attributes.value;

        const fonts = pat.querySelectorAll('font');
        const companies = fonts[fonts.length - 1]?.attributes.title;
        const arr_companies = companies.split(",").map(item => item.trim());
        const co_holder = arr_companies.filter(item => !item.includes(search_item.company));
        const co_holder_str = co_holder.join(",");



        const divs = pat.querySelectorAll('div');
        const summary = divs[5]?.text?.trim();

        const lis = pat.querySelectorAll('li');
        const quote = Number(lis[lis.length - 1]?.querySelector('a')?.text?.trim()) || 0;

        const date = lis[1]?.querySelector('a')?.text?.trim().slice(15,25);



        const row:patent = {
          corp_no : search_item.corp_no ?? '', //법인번호
          company: search_item.company ?? '', //회사명
          co_holder: co_holder_str ?? '', //공동출원인
          title: title ?? '', //특허명
          application_number: applicationNumber ?? '', //출원번호
          application_date_ymd: date ?? '', //출원일
          quote: quote ?? 0, //인용횟수
          summary: summary ?? '', //특허 요약
        };
        rows.push(row);
      });

    //DB : 테스트DB/backend/kipris_patent_list
    const pool = await mysqlConnect();



    async function insertRows() {
      await Promise.all(rows.map(async (row) => {
        await pool.execute('INSERT INTO kipris_patent_list (company, corp_no, co_holder, title, application_number, application_date_ymd, quote, summary) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE company = VALUES(company), corp_no = VALUES(corp_no), co_holder = VALUES(co_holder), title = VALUES(title), application_date_ymd = VALUES(application_date_ymd), quote = VALUES(quote), summary = VALUES(summary)', [row.company, row.corp_no, row.co_holder, row.title, row.application_number, row.application_date_ymd, row.quote, row.summary]);
      }));
    }

    insertRows().then(() => {
      console.log(`Insertion complete : ${rows.length} rows`);
    }).catch((error) => {
      console.error('Error inserting rows:', error);
    });
    await sleep(500);
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

const search_companies : patent[] =[
  {
    company: "리디 주식회사",
    corp_no: "1101113870098",
  },
  {
    company: "(주)비바리퍼블리카",
    corp_no: "1101115119080",
  },
  {
    company: "두나무 주식회사",
    corp_no: "1101114834853",
  }
];
search_companies.forEach(search_company => {
  crawlWebsiteWithPost(search_company);
})