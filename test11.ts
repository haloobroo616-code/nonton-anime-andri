import axios from 'axios';
import * as cheerio from 'cheerio';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,/;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9'
};

const BASE_URL = 'https://cors.caliph.my.id/https://v1.samehadaku.how'; 

async function animeterbaru(page = 1) {
  const res = await axios.get(`${BASE_URL}/anime-terbaru/page/${page}/`, { headers });
  const $ = cheerio.load(res.data);
  const data: any[] = [];
  $('.post-show ul li').each((_, e) => {
    const a = $(e).find('.dtla h2 a');
    data.push({
      title: a.text().trim(),
      url: a.attr('href'),
      image: $(e).find('.thumb img').attr('src'),
      episode: $(e).find('.dtla span:contains("Episode")').text().replace('Episode', '').trim(),
    });
  });
  return data;
}

animeterbaru(1).then(console.log);
