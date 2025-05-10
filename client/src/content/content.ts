// 페이지 내 클릭 가능한 요소 탐지
const allButtons = document.querySelectorAll('button');
console.log('페이지의 버튼 목록:', allButtons);

const allLinks = document.querySelectorAll('a');
console.log('페이지의 링크 목록:', allLinks);

// 가상 커서 생성
let pointer: HTMLElement | null = null;

// 스크롤 관련 변수
let isScrolling = false;
const SCROLL_THRESHOLD = 100;
const SCROLL_SPEED = 15;
let scrollInterval: number | null = null;

function createGazePointer() {
  if (document.getElementById('gazePointer')) {
    return document.getElementById('gazePointer') as HTMLElement;
  }

  const newPointer = document.createElement('div');
  newPointer.id = 'gazePointer';
  newPointer.style.position = 'fixed';
  newPointer.style.width = '20px';
  newPointer.style.height = '20px';
  newPointer.style.background = 'rgba(255, 0, 0, 0.6)';
  newPointer.style.borderRadius = '50%';
  newPointer.style.pointerEvents = 'none';
  newPointer.style.zIndex = '9999';
  newPointer.style.transform = 'translate(-50%, -50%)';
  newPointer.style.transition = 'transform 0.08s ease-out';
  document.body.appendChild(newPointer);

  return newPointer;
}

function startScrolling(direction: string) {
  if (scrollInterval) return;
  isScrolling = true;

  scrollInterval = window.setInterval(() => {
    window.scrollBy(0, direction === 'up' ? -SCROLL_SPEED : SCROLL_SPEED);
  }, 16);
}

function stopScrolling() {
  if (!isScrolling) return;
  isScrolling = false;

  if (scrollInterval) {
    clearInterval(scrollInterval);
    scrollInterval = null;
  }
}

function isPageScrollable() {
  return document.body.scrollHeight > window.innerHeight;
}

function checkScrollArea(y: number) {
  if (!isPageScrollable()) return;

  if (y < SCROLL_THRESHOLD) {
    startScrolling('up');
  } else if (y > window.innerHeight - SCROLL_THRESHOLD) {
    startScrolling('down');
  } else {
    stopScrolling();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  pointer = createGazePointer();
});

if (
  document.readyState === 'complete' ||
  document.readyState === 'interactive'
) {
  pointer = createGazePointer();
}

window.addEventListener('message', (event) => {
  if (event.data?.type === 'GAZE_POSITION') {
    const { x, y } = event.data;

    if (!pointer) {
      pointer = createGazePointer();
    }

    const element = document.elementFromPoint(x, y);
    if (element) {
      document
        .querySelector('.gaze-highlight')
        ?.classList.remove('gaze-highlight');
      if (['BUTTON', 'A', 'INPUT'].includes(element.tagName)) {
        element.classList.add('gaze-highlight');
      }
    }
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'updateGazePosition') {
    if (!pointer) {
      pointer = createGazePointer();
    }

    if (pointer && message.gazeData) {
      const { x, y } = message.gazeData;
      pointer.style.left = `${x}px`;
      pointer.style.top = `${y}px`;
      checkScrollArea(y);
    }

    sendResponse({ status: 'position updated' });
    return true;
  }

  if (message.action === 'toggleGazePointer') {
    if (!pointer) {
      pointer = createGazePointer();
    }

    if (pointer) {
      pointer.style.display = message.visible ? 'block' : 'none';
      if (!message.visible) stopScrolling();
    }

    sendResponse({ status: 'visibility updated' });
    return true;
  }

  if (message.action === 'toggleScrolling') {
    if (!message.enabled) stopScrolling();
    sendResponse({ status: 'scrolling toggled' });
    return true;
  }

  if (message.action === 'performClick') {
    if (pointer) {
      const x = parseInt(pointer.style.left, 10);
      const y = parseInt(pointer.style.top, 10);
      const el = document.elementFromPoint(x, y);

      if (el) {
        const effect = document.createElement('div');
        Object.assign(effect.style, {
          position: 'fixed',
          left: `${x}px`,
          top: `${y}px`,
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 255, 0, 0.4)',
          transform: 'translate(-50%, -50%)',
          transition: 'all 0.3s ease-out',
          zIndex: '9998',
        });
        document.body.appendChild(effect);

        setTimeout(() => {
          effect.style.opacity = '0';
          effect.style.transform = 'translate(-50%, -50%) scale(1.5)';
          setTimeout(() => {
            effect.remove();
          }, 300);
        }, 50);

        if (el instanceof HTMLElement) {
          el.click();
        } else {
          el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
      }
    }
  }

  if (message.action === 'injectMicrophonePermissionIframe') {
    injectMicrophonePermissionIframe();
    sendResponse({ status: 'success' });
    return true;
  }

  if (message.action === 'injectCameraPermissionIframe') {
    injectCameraPermissionIframe();
    sendResponse({ status: 'camera iframe injected' });
    return true;
  }

  if (message.type === 'COMMAND' && message.command) {
    console.log('[ContentScript] Received command:', message.command);
    if (message.command.includes('뒤로')) history.back();
    sendResponse({ status: 'command processed' });
    return true;
  }
});

function injectMicrophonePermissionIframe() {
  const iframe = document.createElement('iframe');
  iframe.hidden = true;
  iframe.id = 'permissionsIFrame';
  iframe.allow = 'microphone';
  iframe.src = chrome.runtime.getURL('permission/index.html');
  document.body.appendChild(iframe);
}

function injectCameraPermissionIframe() {
  const iframe = document.createElement('iframe');
  iframe.hidden = true;
  iframe.id = 'cameraPermissionsIFrame';
  iframe.allow = 'camera';
  iframe.src = chrome.runtime.getURL('permission/camera.html');
  document.body.appendChild(iframe);
}
