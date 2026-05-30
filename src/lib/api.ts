const API_BASE = '/api';

export async function fetchLatest(page = 1) {
  const res = await fetch(`${API_BASE}/latest?page=${page}`);
  return res.json();
}

export async function fetchSearch(query: string) {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
  return res.json();
}

export async function fetchDetail(url: string) {
  const res = await fetch(`${API_BASE}/detail?url=${encodeURIComponent(url)}`);
  return res.json();
}

export async function fetchWatch(url: string) {
  const res = await fetch(`${API_BASE}/watch?url=${encodeURIComponent(url)}`);
  return res.json();
}

export async function fetchTiktok(username: string) {
  const res = await fetch(`${API_BASE}/tiktok?username=${encodeURIComponent(username)}`);
  return res.json();
}
