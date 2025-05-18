console.log('[Permission] requestPermission.js 실행됨');

navigator.mediaDevices
  .getUserMedia({ audio: true })
  .then((stream) => {
    console.log('[Permission] 마이크 권한 허용됨');

    const port = chrome.runtime.connect({ name: 'permission' });
    port.postMessage({ type: 'PERMISSION_GRANTED' });
  })
  .catch((err) => {
    console.warn('[Permission] 마이크 권한 거부됨:', err);

    const port = chrome.runtime.connect({ name: 'permission' });
    port.postMessage({ type: 'PERMISSION_DENIED' });

    window.close();
  });
