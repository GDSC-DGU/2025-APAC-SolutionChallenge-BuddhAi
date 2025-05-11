navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    console.log('[PermissionPage] Camera permission granted.');
    stream.getTracks().forEach((track) => track.stop()); // 스트림 정리

    console.log('[Permission] 권한 허용됨 → 메시지 전송 시도');
    chrome.runtime.sendMessage({ type: 'CAMERA_PERMISSION_GRANTED' });

    window.close(); // 권한 요청 페이지 자동 종료
  })
  .catch((error) => {
    console.error('[PermissionPage] Camera permission denied:', error);
    chrome.runtime.sendMessage({ type: 'CAMERA_PERMISSION_DENIED' });
    window.close(); // 권한 요청 페이지 자동 종료
  });
