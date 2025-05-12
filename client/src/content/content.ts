import { injectMicrophonePermissionIframe } from "./utils/injectIframe";
import { handleDomCommand } from "./handlers/domCommandHandler";
import { handleVoiceCommand } from "./handlers/commandHandler";
import { handleDomCommandSafely } from "./utils/handleDomCommandSafely";

console.log("[ContentScript] content.js 로딩됨");

// 초기 태그 수집 로그
const allButtons = document.querySelectorAll("button");
console.log("페이지의 버튼 목록:", allButtons);

const allLinks = document.querySelectorAll("a");
console.log("페이지의 링크 목록:", allLinks);

// Gaze Pointer 관련
let pointer: HTMLElement | null = null;
let isScrolling = false;
const SCROLL_THRESHOLD = 100;
const SCROLL_SPEED = 15;
let scrollInterval: number | null = null;

function createGazePointer() {
  if (document.getElementById("gazePointer")) {
    return document.getElementById("gazePointer") as HTMLElement;
  }

  const newPointer = document.createElement("div");
  newPointer.id = "gazePointer";
  Object.assign(newPointer.style, {
    position: "fixed",
    width: "20px",
    height: "20px",
    background: "rgba(255, 0, 0, 0.6)",
    borderRadius: "50%",
    pointerEvents: "none",
    zIndex: "9999",
    transform: "translate(-50%, -50%)",
    transition: "transform 0.08s ease-out",
  });
  document.body.appendChild(newPointer);
  return newPointer;
}

function startScrolling(direction: "up" | "down") {
  if (scrollInterval) return;
  isScrolling = true;
  scrollInterval = window.setInterval(() => {
    window.scrollBy(0, direction === "up" ? -SCROLL_SPEED : SCROLL_SPEED);
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
  if (y < SCROLL_THRESHOLD) startScrolling("up");
  else if (y > window.innerHeight - SCROLL_THRESHOLD) startScrolling("down");
  else stopScrolling();
}

document.addEventListener("DOMContentLoaded", () => {
  pointer = createGazePointer();
});
if (["complete", "interactive"].includes(document.readyState)) {
  pointer = createGazePointer();
}

// 메시지 리스너 통합
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  // domCommand
  if (message.type === "DOM_COMMAND" && message.domCommand) {
    console.log("[ContentScript] 실행할 domCommand 수신:", message.domCommand);
    try {
      handleDomCommand(message.domCommand, sendResponse);
      handleDomCommandSafely(message.domCommand);
      sendResponse({ status: "success" });
    } catch (e: any) {
      console.error("❌ domCommand 실행 실패:", e);
      sendResponse({ status: "error", message: e.message });
    }
    return true;
  }

  // 음성 명령
  if (message.type === "COMMAND" && message.command) {
    handleVoiceCommand(message.command);
    sendResponse({ status: "command processed" });
    return true;
  }

  // iframe 삽입
  if (message.action === "injectMicrophonePermissionIframe") {
    injectMicrophonePermissionIframe();
    sendResponse({ status: "success" });
    return true;
  }
  if (message.action === "injectCameraPermissionIframe") {
    injectCameraPermissionIframe();
    sendResponse({ status: "camera iframe injected" });
    return true;
  }

  // Gaze 좌표 업데이트
  if (message.action === "updateGazePosition") {
    if (!pointer) pointer = createGazePointer();
    if (pointer && message.gazeData) {
      const { x, y } = message.gazeData;
      pointer.style.left = `${x}px`;
      pointer.style.top = `${y}px`;
      checkScrollArea(y);
    }
    sendResponse({ status: "position updated" });
    return true;
  }

  // Gaze Pointer on/off
  if (message.action === "toggleGazePointer") {
    if (!pointer) pointer = createGazePointer();
    if (pointer) {
      pointer.style.display = message.visible ? "block" : "none";
      if (!message.visible) stopScrolling();
    }
    sendResponse({ status: "visibility updated" });
    return true;
  }

  // 스크롤 on/off
  if (message.action === "toggleScrolling") {
    if (!message.enabled) stopScrolling();
    sendResponse({ status: "scrolling toggled" });
    return true;
  }

  // 클릭 수행
  if (message.action === "performClick" && pointer) {
    const x = parseInt(pointer.style.left, 10);
    const y = parseInt(pointer.style.top, 10);
    const el = document.elementFromPoint(x, y);
    if (el) {
      const effect = document.createElement("div");
      Object.assign(effect.style, {
        position: "fixed",
        left: `${x}px`,
        top: `${y}px`,
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        backgroundColor: "rgba(0, 255, 0, 0.4)",
        transform: "translate(-50%, -50%)",
        transition: "all 0.3s ease-out",
        zIndex: "9998",
      });
      document.body.appendChild(effect);
      setTimeout(() => {
        effect.style.opacity = "0";
        effect.style.transform = "translate(-50%, -50%) scale(1.5)";
        setTimeout(() => effect.remove(), 300);
      }, 50);

      el instanceof HTMLElement ? el.click() : el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }
  }

  // 백그라운드 테스트용
  if (message.type === "FROM_BACKGROUND") {
    console.log("[ContentScript] 백그라운드로부터 메시지 수신:", message.message);
    const h1 = document.querySelector("h1");
    if (h1) h1.style.border = "2px solid red";
    console.log("[ContentScript] 웹페이지에 DOM 조작 완료");
  }
});

// iframe 삽입 함수 분리
function injectCameraPermissionIframe() {
  const iframe = document.createElement("iframe");
  iframe.hidden = true;
  iframe.id = "cameraPermissionsIFrame";
  iframe.allow = "camera";
  iframe.src = chrome.runtime.getURL("permission/camera.html");
  document.body.appendChild(iframe);
}
