import { handleDomCommand } from './handlers/domCommandHandler';
// import { handleVoiceCommand } from "./handlers/commandHandler";
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
  newPointer.style.width = '50px';
  newPointer.style.height = '50px';
  newPointer.style.pointerEvents = 'none';
  newPointer.style.zIndex = '9999';
  newPointer.style.transform = 'translate(-50%, -50%)';
  newPointer.style.transition = 'transform 0.08s ease-out';

  // SVG 커서 아이콘 로드
  fetch(chrome.runtime.getURL('icons/cursor.svg'))
    .then((response) => response.text())
    .then((svgText) => {
      // SVG 내용을 안전하게 삽입
      newPointer.innerHTML = svgText;

      // SVG 요소 스타일 수정 (색상 등 변경)
      const svgElement = newPointer.querySelector('svg');
      if (svgElement) {
        svgElement.setAttribute('width', '100%');
        svgElement.setAttribute('height', '100%');
      }
    })
    .catch((error) => {
      console.error('SVG 로드 실패:', error);
    });

  document.body.appendChild(newPointer);
  return newPointer;
}

function createClickEffect(x: number, y: number) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const effect = document.createElement('div');
  Object.assign(effect.style, {
    position: 'fixed',
    left: `${x}px`,
    top: `${y}px`,
    width: '50px',
    height: '50px',
    pointerEvents: 'none',
    transform: 'translate(-50%, -50%)',
    transition: 'all 0.3s ease-out',
    zIndex: '9998',
  });

  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('viewBox', '0 0 50 50');

  // 클릭 이펙트 1: 확장되는 원
  const outerCircle = document.createElementNS(svgNS, 'circle');
  outerCircle.setAttribute('cx', '25');
  outerCircle.setAttribute('cy', '25');
  outerCircle.setAttribute('r', '15');
  outerCircle.setAttribute('fill', 'rgba(0, 255, 0, 0.4)');
  outerCircle.setAttribute('stroke', 'rgba(0, 255, 0, 0.8)');
  outerCircle.setAttribute('stroke-width', '2');

  // 클릭 이펙트 2: 작은 파티클들 (선택적)
  for (let i = 0; i < 6; i++) {
    const particle = document.createElementNS(svgNS, 'circle');
    const angle = (i / 6) * Math.PI * 2;
    const size = 2 + Math.random() * 3;

    particle.setAttribute('cx', '25');
    particle.setAttribute('cy', '25');
    particle.setAttribute('r', size.toString());
    particle.setAttribute('fill', 'rgba(0, 255, 0, 0.8)');

    // 파티클 애니메이션을 위한 애니메이션 요소
    const animX = document.createElementNS(svgNS, 'animate');
    animX.setAttribute('attributeName', 'cx');
    animX.setAttribute('from', '25');
    animX.setAttribute('to', (25 + Math.cos(angle) * 20).toString());
    animX.setAttribute('dur', '0.3s');
    animX.setAttribute('begin', '0s');
    animX.setAttribute('fill', 'freeze');

    const animY = document.createElementNS(svgNS, 'animate');
    animY.setAttribute('attributeName', 'cy');
    animY.setAttribute('from', '25');
    animY.setAttribute('to', (25 + Math.sin(angle) * 20).toString());
    animY.setAttribute('dur', '0.3s');
    animY.setAttribute('begin', '0s');
    animY.setAttribute('fill', 'freeze');

    const animOpacity = document.createElementNS(svgNS, 'animate');
    animOpacity.setAttribute('attributeName', 'opacity');
    animOpacity.setAttribute('from', '1');
    animOpacity.setAttribute('to', '0');
    animOpacity.setAttribute('dur', '0.3s');
    animOpacity.setAttribute('begin', '0s');
    animOpacity.setAttribute('fill', 'freeze');

    particle.appendChild(animX);
    particle.appendChild(animY);
    particle.appendChild(animOpacity);
    svg.appendChild(particle);
  }

  svg.appendChild(outerCircle);
  effect.appendChild(svg);
  document.body.appendChild(effect);

  setTimeout(() => {
    effect.style.opacity = '0';
    effect.style.transform = 'translate(-50%, -50%) scale(1.5)';
    setTimeout(() => {
      effect.remove();
    }, 300);
  }, 50);
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

  // 음성 명령
  if (message.type === 'DOM_COMMAND' && message.domCommand) {
    const cmd = message.domCommand;
    console.log('[ContentScript] 실행할 domCommand 수신:', cmd);

    try {
      handleDomCommand(cmd, sendResponse); // 공식 핸들러
      handleDomCommandSafely(cmd); // 안전 실행
      sendResponse({ status: 'success' });
    } catch (e: any) {
      console.error('❌ domCommand 실행 실패:', e);
      sendResponse({ status: 'error', message: e.message });
    }
    return true;
  }

  // iframe 삽입
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
    console.log('[ContentScript] performClick 메시지 수신됨');

    if (pointer) {
      const x = parseInt(pointer.style.left, 10);
      const y = parseInt(pointer.style.top, 10);

      // 클릭 효과를 일단 발생시킴 (위치에 관계없이)
      createClickEffect(x, y);

      const el = document.elementFromPoint(x, y);
      if (el) {
        if (el instanceof HTMLElement) {
          el.click();
        } else {
          el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
      } else {
        console.warn('[ContentScript] 클릭 위치에 요소가 없음');
      }
    } else {
      console.warn('[ContentScript] pointer가 null임');
    }
  }

  // 백그라운드 테스트용
  if (message.type === 'FROM_BACKGROUND') {
    console.log(
      '[ContentScript] 백그라운드로부터 메시지 수신:',
      message.message
    );
    const h1 = document.querySelector('h1');
    if (h1) h1.style.border = '2px solid red';
    console.log('[ContentScript] 웹페이지에 DOM 조작 완료');
  }
});

document.addEventListener('focusin', (e) => {
  if (
    e.target instanceof HTMLInputElement ||
    e.target instanceof HTMLTextAreaElement
  ) {
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
