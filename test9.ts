import axios from 'axios';
import * as cheerio from 'cheerio';

async function test(url: string) {
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      }
    });
    console.log(url, "Status:", res.status);
    console.log("Title data:", res.data.match(/<title>(.*?)<\/title>/)?.[1]);
  } catch (e: any) {
    console.log(url, "Error:", e.message);
  }
}

test('https://v1.samehadaku.how/');
test('https://v1.samehadaku.how/anime-terbaru/page/1/');
