import axios from 'axios';

async function testAll() {
  try {
    console.log("TESTING LATEST");
    const latest = await axios.get('http://localhost:3000/api/latest');
    const firstUrl = latest.data[0].url;
    console.log("First URL:", firstUrl);
    
    console.log("TESTING DETAIL");
    const detail = await axios.get(`http://localhost:3000/api/detail?url=${encodeURIComponent(firstUrl)}`);
    console.log("Detail title:", detail.data.title);
    const eps = detail.data.episodes[0].url;
    console.log("First episode:", eps);
    
    console.log("TESTING DOWNLOAD");
    const watch = await axios.get(`http://localhost:3000/api/watch?url=${encodeURIComponent(eps)}`);
    console.log("Watch streams:", watch.data.streams.length);
    
    console.log("TESTING SEARCH");
    const search = await axios.get(`http://localhost:3000/api/search?q=one%20piece`);
    console.log("Search result count:", search.data.length);
  } catch(e: any) {
    console.error("ERROR:", e.response?.data || e.message);
  }
}
testAll();
