import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function test(url: string) {
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      }
    });
    fs.writeFileSync('page.html', res.data);
    console.log("Written to page.html");
  } catch (e: any) {
    console.log(url, "Error:", e.message);
  }
}

test('https://samehadaku.care/');
