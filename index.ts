import axios from 'axios';
import { parse } from 'node-html-parser';
import { createConnection } from 'mysql2/promise';

interface patent {
  company: string;
  corp_no : string;
  title: string;
  application_number: string;
  application_date_ymd: string;
  quote: number;
  summary: string;
}


async function crawlWebsiteWithPost(corp_no: string, /*postData: any*/): Promise<void> {
  try {


    const content: Record<string, Record<string, string>> = {};

    const param = new URLSearchParams();
    param.set('queryText', `RG=[${corp_no}]`);

    param.set('searchInResultCk', 'undefined');

    param.set('next', 'MainList');
    param.set('config', 'G1111111111111111111111S111111111000000000');
    param.set('sortField', 'RANK');
    param.set('sortStage', 'DESC');
    param.set('configChange', 'Y');
    param.set('expression', `RG=[${corp_no}]`);
    param.set('historyQuery', `RG=[${corp_no}]`);
    param.set('numPerPage', '30');
    param.set('numPageLinks', '10');
    param.set('currentPage', '1');
    param.set('beforeExpression', `RG=[${corp_no}]`);
    param.set('userInput', `${corp_no}`);

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

    console.log(root.querySelectorAll('article').length);

    const rows: patent[] = [];


    root.querySelectorAll('article')
      .map((pat) => {
        const input = pat.querySelector('input');
        const title = input?.attributes.title;
        const applicationNumber = input?.attributes.value;

        const fonts = pat.querySelectorAll('font');
        const holder = fonts[fonts.length - 1]?.attributes.title;

        const divs = pat.querySelectorAll('div');
        const summary = divs[5]?.text?.trim();

        const lis = pat.querySelectorAll('li');
        const quote = Number(lis[lis.length - 1]?.querySelector('a')?.text?.trim()) || 0;

        const date = lis[1]?.querySelector('a')?.text?.trim().slice(15,25);

        const row:patent = {
          company: holder ?? '',
          corp_no : corp_no ?? '',
          title: title ?? '',
          application_number: applicationNumber ?? '',
          application_date_ymd: date ?? '',
          quote: quote ?? 0,
          summary: summary ?? '',
        };
        rows.push(row);
      });


    const pool = await createConnection({
      host: 'localhost',
      user: 'root',
      password: '1234abcd',
      database: 'mycompany',
    });

    async function insertRows() {
      await Promise.all(rows.map(async (row) => {
        await pool.execute('INSERT INTO kipris_patent_list (company, corp_no, title, application_number, application_date_ymd, quote, summary) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE company = VALUES(company), corp_no = VALUES(corp_no), title = VALUES(title), application_date_ymd = VALUES(application_date_ymd), quote = VALUES(quote), summary = VALUES(summary)', [row.company, row.corp_no, row.title, row.application_number, row.application_date_ymd, row.quote, row.summary]);
      }));
    }

    insertRows().then(() => {
      console.log('Insertion complete.');
    }).catch((error) => {
      console.error('Error inserting rows:', error);
    });

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

crawlWebsiteWithPost('1101113870098'); //리디
crawlWebsiteWithPost('1101115119080'); //비바리퍼블리카(토스)
crawlWebsiteWithPost('1101114834853'); //두나무

