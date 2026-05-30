import axios from 'axios';

async function test() {
  try {
    const res = await axios.get('https://samehadaku.email/anime-terbaru/page/1/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      }
    });
    console.log("Title data:", res.data.match(/<title>(.*?)<\/title>/)[1]);
    console.log("Body snippet:", res.data.substring(0, 1000));
  } catch (e: any) {
    console.log("Error:", e.message);
  }
}
test();
