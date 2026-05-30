import axios from 'axios';
import * as cheerio from 'cheerio';

async function test(url: string) {
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      }
    });
    
    const $ = cheerio.load(res.data);
    const links: string[] = [];
    $('a').each((_, e) => {
      links.push($(e).attr('href') || '');
    });
    console.log("Unique links containing 'anime':", [...new Set(links)].filter(l => l.includes('anime')).slice(0, 10));
    
    console.log("Checking classes around post-show or animpost...");
    console.log($('.post-show').length);
    console.log($('.animpost').length);
    
    // Find how many items have images
    console.log("Images on homepage:", $('img').length);
    
  } catch (e: any) {
    console.log(url, "Error:", e.message);
  }
}

test('https://samehadaku.care/');
