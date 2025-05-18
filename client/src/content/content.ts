import { handleDomCommand } from './handlers/domCommandHandler';
import { handleDomCommandSafely } from './utils/handleDomCommandSafely';

console.log('[ContentScript] content.js 로딩됨');

const allButtons = document.querySelectorAll('button');
console.log('페이지의 버튼 목록:', allButtons);

const allLinks = document.querySelectorAll('a');
console.log('페이지의 링크 목록:', allLinks);

let pointer: HTMLElement | null = null;
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
  newPointer.style.width = '17px';
  newPointer.style.height = '17px';
  newPointer.style.borderRadius = '50%';
  newPointer.style.backgroundColor = 'rgba(238, 130, 238, 0.5)';
  newPointer.style.border = '2px solid rgba(238, 130, 238, 0.9)';
  newPointer.style.pointerEvents = 'none';
  newPointer.style.transform = 'translate(-50%, -50%)';
  newPointer.style.transition = 'transform 0.08s ease-out';
  newPointer.style.zIndex = '9999';
  newPointer.style.backdropFilter = 'blur(2px)';
  newPointer.style.boxShadow = '0 0 10px rgba(238, 130, 238, 0.6)';

  document.body.appendChild(newPointer);
  return newPointer;
}

const createClickEffect = (x: number, y: number) => {
  const effect = document.createElement('div');
  Object.assign(effect.style, {
    position: 'fixed',
    left: `${x}px`,
    top: `${y}px`,
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 200, 255, 0.3)',
    border: '2px solid rgba(0, 200, 255, 0.5)',
    transform: 'translate(-50%, -50%) scale(1)',
    transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
    pointerEvents: 'none',
    zIndex: '9998',
  });

  document.body.appendChild(effect);

  requestAnimationFrame(() => {
    effect.style.transform = 'translate(-50%, -50%) scale(2)';
    effect.style.opacity = '0';
  });

  setTimeout(() => {
    effect.remove();
  }, 300);
};

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

function checkScrollArea(y: number) {
  if (document.body.scrollHeight <= window.innerHeight) return;
  if (y < SCROLL_THRESHOLD) startScrolling('up');
  else if (y > window.innerHeight - SCROLL_THRESHOLD) startScrolling('down');
  else stopScrolling();
}

document.addEventListener('DOMContentLoaded', () => {
  pointer = createGazePointer();
});
if (['complete', 'interactive'].includes(document.readyState)) {
  pointer = createGazePointer();
}

// 메시지 리스너 통합
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'ping') {
    sendResponse({ status: 'pong' });
    return true;
  }
  // domCommand
  if (message.type === 'DOM_COMMAND' && message.domCommand) {
    console.log('[ContentScript] 실행할 domCommand 수신:', message.domCommand);
    try {
      handleDomCommand(message.domCommand, sendResponse);
      handleDomCommandSafely(message.domCommand);
      sendResponse({ status: 'success' });
    } catch (e: any) {
      console.error('❌ domCommand 실행 실패:', e);
      sendResponse({ status: 'error', message: e.message });
    }
    return true;
  }

  if (message.action === 'showPageCursor') {
    document.getElementById('gazePointer')!.style.display = 'block';
  }

  if (message.action === 'hidePageCursor') {
    document.getElementById('gazePointer')!.style.display = 'none';
  }

  // iframe 삽입
  if (message.action === 'injectMicrophonePermissionIframe') {
    injectMicrophonePermissionIframe();
    sendResponse({ status: 'success' });
    return true;
  }

  if (message.action === 'INJECT_PERMISSION_IFRAME') {
    console.log('[ContentScript] 📸 iframe 삽입 시도');
    injectCameraPermissionIframe();
    sendResponse({ status: 'camera iframe injected' });
    return true;
  }

  // Gaze 좌표 업데이트
  if (message.action === 'updateGazePosition') {
    if (!pointer) pointer = createGazePointer();
    if (pointer && message.gazeData) {
      const { x, y } = message.gazeData;
      pointer.style.left = `${x}px`;
      pointer.style.top = `${y}px`;
      checkScrollArea(y);
    }
    sendResponse({ status: 'position updated' });
    return true;
  }

  // Gaze Pointer on/off
  if (message.action === 'toggleGazePointer') {
    if (!pointer) pointer = createGazePointer();
    if (pointer) {
      pointer.style.display = message.visible ? 'block' : 'none';
      if (!message.visible) stopScrolling();
    }
    sendResponse({ status: 'visibility updated' });
    return true;
  }

  // 스크롤 on/off
  if (message.action === 'toggleScrolling') {
    if (!message.enabled) stopScrolling();
    sendResponse({ status: 'scrolling toggled' });
    return true;
  }

  if (message.action === 'performClick') {
    if (!pointer || pointer.style.display === 'none') {
      sendResponse({ status: 'ignored (cursor hidden)' });
      return true;
    }

    const x = parseInt(pointer.style.left, 10);
    const y = parseInt(pointer.style.top, 10);
    createClickEffect(x, y);

    const el = document.elementFromPoint(x, y);
    if (el instanceof HTMLElement) {
      el.click();
      sendResponse({ status: 'clicked' });
    } else if (el) {
      el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      sendResponse({ status: 'clicked (dispatched)' });
    } else {
      console.warn('[ContentScript] 클릭 위치에 요소가 없음');
      sendResponse({ status: 'no element at point' });
    }

    return true;
  }

  if (message.action === 'insertInputValue' && message.value) {
    let target: HTMLElement | null = document.activeElement as HTMLElement;
    if (
      !target ||
      !(
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable
      )
    ) {
      target = document.querySelector(
        'textarea, input[type="text"], [contenteditable="true"]'
      ) as HTMLElement;
    }

    if (!target) {
      return;
    }

    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement
    ) {
      const setter = Object.getOwnPropertyDescriptor(
        target.constructor.prototype,
        'value'
      )?.set;

      if (setter) {
        setter.call(target, message.value);
      } else {
        target.value = message.value;
      }

      target.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (target.isContentEditable) {
      target.innerText = message.value;
      target.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      console.warn('[Content] 알 수 없는 요소 유형');
      return;
    }

    const form = target.closest('form');
    if (form) {
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true })
      );
    } else {
      const submitButton = document.querySelector(
        'button[type="submit"]'
      ) as HTMLElement;
      if (submitButton) {
        submitButton.click();
      } else {
        console.warn('[Content] form도 submit 버튼도 없음');
      }
    }
  }
});

document.addEventListener('focusin', (e) => {
  if (
    e.target instanceof HTMLInputElement ||
    e.target instanceof HTMLTextAreaElement
  ) {
    chrome.runtime.sendMessage({ type: 'FOCUS_ON_SIDEPANEL' });
    chrome.runtime.sendMessage({ type: 'INPUT_FOCUSED', focused: true });
  }
});

document.addEventListener('focusout', (e) => {
  if (
    e.target instanceof HTMLInputElement ||
    e.target instanceof HTMLTextAreaElement
  ) {
    chrome.runtime.sendMessage({ type: 'INPUT_FOCUSED', focused: false });
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
  iframe.src = chrome.runtime.getURL('cameraPermission/index.html');
  document.body.appendChild(iframe);
}
