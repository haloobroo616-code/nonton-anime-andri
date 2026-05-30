import axios from 'axios';

const tlds = [
  'tv', 'vip', 'ist', 'care', 'rip', 'cam', 'pe', 'mobi', 'biz', 'net', 'com',
  'lol', 'icu', 'moe', 'day', 'pw', 'pro', 'art', 'top', 'cloud', 'mba', 'live', 'lat', 'rest', 'cc'
];

async function scan() {
  for (const tld of tlds) {
    try {
      const url = `https://samehadaku.${tld}/`;
      const res = await axios.get(url, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        }
      });
      if (res.data.toLowerCase().includes('samehadaku') && !res.data.includes('window.location.replace')) {
        console.log("FOUND:", url);
        console.log("Title data:", res.data.match(/<title>(.*?)<\/title>/)?.[1]);
      }
    } catch (e: any) {
      // ignore
    }
  }
}
scan();
