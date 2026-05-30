import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const app = express();

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

async function search(query: string) {
  const res = await axios.get(`${BASE_URL}/?s=${encodeURIComponent(query)}`, { headers });
  const $ = cheerio.load(res.data);
  const data: any[] = [];
  $('.animpost').each((_, e) => {
    data.push({
      title: $(e).find('.data .title h2').text().trim(),
      image: $(e).find('.content-thumb img').attr('src'),
      type: $(e).find('.type').text().trim(),
      score: $(e).find('.score').text().trim(),
      url: $(e).find('a').attr('href')
    });
  });
  return data;
}

async function detail(link: string) {
  let targetUrl = link;
  if (link.startsWith('http') && !link.startsWith('https://cors.caliph.my.id/')) {
    targetUrl = `https://cors.caliph.my.id/${link}`;
  } else if (!link.startsWith('http')) {
    targetUrl = `${BASE_URL}${link}`;
  }
  const res = await axios.get(targetUrl, { headers });
  const $ = cheerio.load(res.data);

  const episodes: any[] = [];
  $('.lstepsiode ul li').each((_, e) => {
    episodes.push({
      title: $(e).find('.epsleft .lchx a').text().trim(),
      url: $(e).find('.epsleft .lchx a').attr('href'),
      date: $(e).find('.epsleft .date').text().trim()
    });
  });

  const info: any = {};
  $('.anim-senct .right-senc .spe span').each((_, e) => {
    const t = $(e).text();
    if (t.includes(':')) {
      const [k, ...v] = t.split(':');
      info[k.trim().toLowerCase().replace(/\s+/g, '_')] = v.join(':').trim();
    }
  });

  return {
    title: $('title').text().replace(' - Samehadaku', '').trim(),
    image: $('meta[property="og:image"]').attr('content'),
    description: $('.entry-content').text().trim() || $('meta[name="description"]').attr('content'),
    episodes,
    info
  };
}

async function download(link: string) {
  let targetUrl = link;
  if (link.startsWith('http') && !link.startsWith('https://cors.caliph.my.id/')) {
    targetUrl = `https://cors.caliph.my.id/${link}`;
  } else if (!link.startsWith('http')) {
    targetUrl = `${BASE_URL}${link}`;
  }
  const res = await axios.get(targetUrl, { headers });
  const cookies = res.headers['set-cookie']?.map((v: string) => v.split(';')[0]).join('; ') || '';
  const $ = cheerio.load(res.data);
  const data: any[] = [];

  const promises = $('div#server > ul > li').toArray().map(async (li) => {
    const div = $(li).find('div');
    const post = div.attr('data-post');
    const nume = div.attr('data-nume');
    const type = div.attr('data-type');
    const name = $(li).find('span').text().trim();
    if (!post) return;

    const parsedOriginalUrl = new URL(targetUrl.replace('https://cors.caliph.my.id/', ''));
    const ajaxUrl = `https://cors.caliph.my.id/${parsedOriginalUrl.origin}/wp-admin/admin-ajax.php`;
    const body = new URLSearchParams({ action: 'player_ajax', post, nume, type }).toString();
    try {
        const r = await axios.post(ajaxUrl, body, {
        headers: {
            ...headers,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookies,
            'Referer': targetUrl
        }
        });
        const html = r.data;
        const $$ = cheerio.load(html);
        let iframe = $$('iframe').attr('src');
        if (!iframe) {
            const vidlionMatch = html.match(/\[vidlion\s+id=([^\]]+)\]/);
            if (vidlionMatch) {
               iframe = `https://vidhide.com/embed/${vidlionMatch[1]}`;
            }
        }
        if (iframe) data.push({ server: name, url: iframe });
    } catch (e) {
        console.log("Error fetching server:", name);
    }
  });
  
  await Promise.allSettled(promises);

  return {
    title: $('h1[itemprop="name"]').text().trim(),
    streams: data
  };
}

async function getTikTokData(username: string) {
  try {
    const res = await axios.get(`https://www.tiktok.com/@${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      }
    });
    const $ = cheerio.load(res.data);
    
    // TikTok sometimes uses __UNIVERSAL_DATA_FOR_REHYDRATION__
    const script = $('#__UNIVERSAL_DATA_FOR_REHYDRATION__').html();
    if (script) {
        const data = JSON.parse(script);
        return {
            followers: data.__DEFAULT_SCOPE__?.["webapp.user-detail"]?.userInfo?.stats?.followerCount || 0,
            likes: data.__DEFAULT_SCOPE__?.["webapp.user-detail"]?.userInfo?.stats?.heartCount || 0,
            following: data.__DEFAULT_SCOPE__?.["webapp.user-detail"]?.userInfo?.stats?.followingCount || 0,
            avatar: data.__DEFAULT_SCOPE__?.["webapp.user-detail"]?.userInfo?.user?.avatarLarger || '',
            nickname: data.__DEFAULT_SCOPE__?.["webapp.user-detail"]?.userInfo?.user?.nickname || username,
        };
    }
    
    // Older TikTok structure with SIGI_STATE
    const sigi = $('#SIGI_STATE').html();
    if (sigi) {
        const data = JSON.parse(sigi);
        const userModule = data.UserModule;
        const stats = data.UserModule?.stats;
        const userId = Object.keys(stats || {})[0];
        if (userId && stats[userId]) {
             const user = userModule.users[userId];
             return {
                 followers: stats[userId].followerCount || 0,
                 likes: stats[userId].heartCount || 0,
                 following: stats[userId].followingCount || 0,
                 avatar: user?.avatarLarger || '',
                 nickname: user?.nickname || username,
             }
        }
    }
    
    return null;
  } catch (e: any) {
    console.error("TikTok Fetch Error", e.message);
    return null;
  }
}

app.get('/api/tiktok', async (req, res) => {
  try {
    const data = await getTikTokData(req.query.username as string || 'andrimanaa_');
    if (data) {
        res.json(data);
    } else {
        res.status(404).json({ error: 'Not found' });
    }
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/latest', async (req, res) => {
  try {
    const data = await animeterbaru(Number(req.query.page) || 1);
    res.json(data);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/search', async (req, res) => {
  try {
    const data = await search(req.query.q as string);
    res.json(data);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/detail', async (req, res) => {
  try {
    const data = await detail(req.query.url as string);
    res.json(data);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/watch', async (req, res) => {
  try {
    const data = await download(req.query.url as string);
    res.json(data);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default app;
