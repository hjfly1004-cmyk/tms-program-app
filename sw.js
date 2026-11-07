// 시술 중 인터넷이 잠깐 끊겨도 프로그램이 멈추지 않게 한다.
// 페이지는 언제나 네트워크를 먼저 본다. 그래야 고친 내용이 다음 접속 때 바로 반영된다.
// 환자 기록은 저장하지 않는다. 여기서 내보내는 것도 없다.
const CACHE = 'tms-program-v1';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(['./', './index.html'].map(u => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || req.mode !== 'navigate') return;
  e.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put('./index.html', copy));
        return res;
      })
      .catch(() => caches.match('./index.html').then(r => r || caches.match('./')).then(r => r || Response.error()))
  );
});
