
import { injectMicrophonePermissionIframe } from "./utils/injectIframe";
import { handleDomCommand } from "./handlers/domCommandHandler";
import { handleVoiceCommand } from "./handlers/commandHandler";
import { handleDomCommandSafely } from "./utils/handleDomCommandSafely";

// 초기 태그 수집 로그
console.log("[ContentScript] content.js 로딩됨");

const allButtons = document.querySelectorAll("button");
console.log("페이지의 버튼 목록:", allButtons);

const allLinks = document.querySelectorAll("a");
console.log("페이지의 링크 목록:", allLinks);

// 메시지 리스너
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "DOM_COMMAND" && message.domCommand) {
    console.log("[ContentScript] 실행할 domCommand 수신:", message.domCommand);
    handleDomCommand(message.domCommand, sendResponse);
    try {
      handleDomCommandSafely(message.domCommand);
      sendResponse({ status: "success" });
    } catch (e: any) {
      console.error("❌ domCommand 실행 실패:", e);
      sendResponse({ status: "error", message: e.message });
    }
    return true; // 비동기 응답 처리
  }

  if (message.action === "injectMicrophonePermissionIframe") {
    injectMicrophonePermissionIframe();
    sendResponse({ status: "success" });
  }

  if (message.type === "COMMAND" && message.command) {
    handleVoiceCommand(message.command);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "FROM_BACKGROUND") {
    console.log("[ContentScript] 백그라운드로부터 메시지 수신:", request.message);

    // 실제 DOM 접근 예시
    const h1 = document.querySelector("h1");
    if (h1) h1.style.border = "2px solid red";

    console.log("[ContentScript] 웹페이지에 DOM 조작 완료");
  }
});


