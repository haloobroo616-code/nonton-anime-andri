import axios from 'axios';

async function testAll() {
  const watch = await axios.get(`http://localhost:3000/api/watch?url=${encodeURIComponent('https://v2.samehadaku.how/yomi-no-tsugai-episode-9/')}`);
  console.log("Streams:", JSON.stringify(watch.data.streams, null, 2));
}
testAll();
