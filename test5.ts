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
    
    const $ = cheerio.load(res.data);
    const data: any[] = [];
    $('.post-show ul li').each((_, e) => {
      const a = $(e).find('.dtla h2 a');
      data.push({
        title: a.text().trim(),
        url: a.attr('href'),
      });
    });
    console.log("Found items:", data.length);
    console.log("First item:", data[0]);
  } catch (e: any) {
    console.log(url, "Error:", e.message);
  }
}

test('https://samehadaku.care/anime-terbaru/page/1/');
