// 태그 수집
const allButtons = document.querySelectorAll('button');
console.log('페이지의 버튼 목록:', allButtons);

const allLinks = document.querySelectorAll('a');
console.log('페이지의 링크 목록:', allLinks);

// [ContentScript] 명령 수신 및 iframe 삽입 처리

// 마이크 권한 iframe 삽입 함수
const injectMicrophonePermissionIframe = () => {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('hidden', 'true');
  iframe.setAttribute('id', 'permissionsIFrame');
  iframe.setAttribute('allow', 'microphone');
  iframe.src = chrome.runtime.getURL('permission/index.html');
  document.body.appendChild(iframe);
};

// 웹캠 권한 iframe 삽입 함수
const injectCameraPermissionIframe = () => {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('hidden', 'true');
  iframe.setAttribute('id', 'cameraPermissionsIFrame');
  iframe.setAttribute('allow', 'camera');
  iframe.src = chrome.runtime.getURL('permission/camera.html');
  document.body.appendChild(iframe);
};

// 메시지 리스너
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  // 마이크 권한 iframe 삽입 요청
  if (message.action === 'injectMicrophonePermissionIframe') {
    injectMicrophonePermissionIframe();
    sendResponse({ status: 'success' });
  }

  // 웹캠 권한 iframe 삽입 요청
  if (message.action === 'injectCameraPermissionIframe') {
    injectCameraPermissionIframe();
    sendResponse({ status: 'camera iframe injected' });
  }

  // 음성 명령 처리
  if (message.type === 'COMMAND' && message.command) {
    console.log('[ContentScript] Received command:', message.command);

    // 예시: 명령어에 따라 동작 실행
    if (message.command.includes('뒤로')) {
      history.back();
    }
    // 여기에 다른 명령도 추가 가능
  }
});
