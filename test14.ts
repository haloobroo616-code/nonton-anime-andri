import axios from 'axios';
import * as cheerio from 'cheerio';

async function getTikTokData(username: string) {
  try {
    const res = await axios.get(`https://www.tiktok.com/@${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      }
    });
    const $ = cheerio.load(res.data);
    const script = $('#__UNIVERSAL_DATA_FOR_REHYDRATION__').html();
    if (script) {
        const data = JSON.parse(script);
        console.log("Success with script, length:", script.length);
        
        let followerCount = '?';
        try {
            const userDetail = data.__DEFAULT_SCOPE__["webapp.user-detail"].userInfo.stats;
            followerCount = userDetail.followerCount;
        } catch(e) {}
        console.log("Follower count", followerCount);
    } else {
        const sigi = $('#SIGI_STATE').html();
        if (sigi) {
            console.log("Found SIGI_STATE");
        } else {
            console.log("No script tag found");
            console.log(res.data.substring(0, 500));
        }
    }
  } catch (e: any) {
    console.log("Error:", e.message);
  }
}
getTikTokData('andrimanaa_');
